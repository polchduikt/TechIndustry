const db = require('../models');
const { Sequelize } = require('sequelize');

class ShopService {
    constructor() {
        this.categoryCache = null;
        this.categoryCacheMs = Number(process.env.SHOP_CATEGORY_CACHE_MS || 300000);
    }

    async getShopCategories() {
        if (this.categoryCache && (Date.now() - this.categoryCache.cachedAt) < this.categoryCacheMs) {
            return this.categoryCache.data;
        }

        const categories = await db.ShopCategory.findAll({
            where: { is_active: true },
            attributes: ['id', 'name', 'slug', 'icon', 'display_order'],
            order: [['display_order', 'ASC']]
        });

        const plain = categories.map((category) => category.get({ plain: true }));
        this.categoryCache = {
            cachedAt: Date.now(),
            data: plain
        };

        return plain;
    }

    async getShopItems(userId) {
        const userLevel = await db.UserLevel.findOne({
            where: { user_id: userId },
            attributes: ['level']
        });
        const currentLevel = userLevel ? userLevel.level : 0;

        const [items, purchases] = await Promise.all([
            db.ShopItem.findAll({
                where: {
                    is_available: true,
                    level_required: { [Sequelize.Op.lte]: currentLevel }
                },
                attributes: [
                    'id',
                    'category_id',
                    'name',
                    'description',
                    'item_type',
                    'item_value',
                    'price',
                    'rarity',
                    'level_required',
                    'display_order'
                ],
                include: [{
                    model: db.ShopCategory,
                    as: 'category',
                    attributes: ['slug']
                }],
                order: [['category_id', 'ASC'], ['display_order', 'ASC']]
            }),
            db.UserPurchase.findAll({
                where: { user_id: userId },
                attributes: ['item_id', 'is_equipped']
            })
        ]);

        const purchasedMap = {};
        purchases.forEach(p => {
            purchasedMap[p.item_id] = {
                purchased: true,
                equipped: p.is_equipped
            };
        });

        return items.map(item => {
            const plain = item.get({ plain: true });
            return {
                ...plain,
                isPurchased: !!purchasedMap[item.id],
                isEquipped: purchasedMap[item.id]?.equipped || false,
                isLocked: plain.level_required > currentLevel
            };
        });
    }

    async getUserCoins(userId) {
        const userLevel = await db.UserLevel.findOne({
            where: { user_id: userId },
            attributes: ['coins']
        });
        return userLevel ? userLevel.coins : 0;
    }

    async purchaseItem(userId, itemId) {
        const transaction = await db.sequelize.transaction();

        try {
            const [userLevel, item, existing] = await Promise.all([
                db.UserLevel.findOne({
                    where: { user_id: userId },
                    lock: transaction.LOCK.UPDATE,
                    transaction,
                    attributes: ['id', 'user_id', 'level', 'coins']
                }),
                db.ShopItem.findByPk(itemId, {
                    transaction,
                    attributes: ['id', 'name', 'price', 'level_required', 'is_available']
                }),
                db.UserPurchase.findOne({
                    where: { user_id: userId, item_id: itemId },
                    transaction,
                    attributes: ['id']
                })
            ]);

            if (!userLevel) {
                throw new Error('Користувача не знайдено');
            }

            if (!item || !item.is_available) {
                throw new Error('Товар недоступний');
            }

            if (userLevel.level < item.level_required) {
                throw new Error(`Потрібен ${item.level_required} рівень`);
            }

            if (existing) {
                throw new Error('Товар вже придбано');
            }

            if (userLevel.coins < item.price) {
                throw new Error(`Недостатньо монет. Потрібно: ${item.price}, є: ${userLevel.coins}`);
            }
            const newBalance = userLevel.coins - item.price;
            const [, purchase] = await Promise.all([
                userLevel.update({ coins: newBalance }, { transaction }),
                db.UserPurchase.create({
                    user_id: userId,
                    item_id: itemId,
                    price_paid: item.price,
                    is_equipped: false
                }, { transaction })
            ]);

            await db.CoinTransaction.create({
                user_id: userId,
                amount: -item.price,
                transaction_type: 'purchase',
                reference_id: purchase.id,
                description: `Придбано: ${item.name}`,
                balance_after: newBalance
            }, { transaction });

            await transaction.commit();

            return {
                success: true,
                purchase,
                newBalance
            };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async equipItem(userId, itemId) {
        const transaction = await db.sequelize.transaction();
        try {
            const purchase = await db.UserPurchase.findOne({
                where: { user_id: userId, item_id: itemId },
                include: [{
                    model: db.ShopItem,
                    as: 'item',
                    attributes: ['id', 'item_type', 'item_value']
                }],
                transaction
            });

            if (!purchase) {
                throw new Error('Товар не придбано');
            }

            const item = purchase.item;
            const sameTypeItems = await db.ShopItem.findAll({
                where: { item_type: item.item_type },
                attributes: ['id'],
                transaction
            });
            const sameTypeIds = sameTypeItems.map(i => i.id);
            await Promise.all([
                db.UserPurchase.update(
                    { is_equipped: false },
                    {
                        where: {
                            user_id: userId,
                            item_id: sameTypeIds
                        },
                        transaction
                    }
                ),
                purchase.update({ is_equipped: true }, { transaction })
            ]);

            const user = await db.User.findByPk(userId, {
                include: [{
                    model: db.Customer,
                    attributes: ['id']
                }],
                transaction,
                attributes: ['id', 'customer_id']
            });

            const updateData = {};

            if (item.item_type === 'avatar_frame') {
                updateData.avatar_frame = item.item_value;
            } else if (item.item_type === 'title_badge') {
                updateData.title_badge = item.item_value;
            } else if (item.item_type === 'profile_theme') {
                updateData.profile_theme = item.item_value;
            }

            if (Object.keys(updateData).length > 0) {
                await user.Customer.update(updateData, { transaction });
            }

            await transaction.commit();

            return { success: true, item };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async unequipItem(userId, itemId) {
        const transaction = await db.sequelize.transaction();
        try {
            const purchase = await db.UserPurchase.findOne({
                where: { user_id: userId, item_id: itemId },
                include: [{
                    model: db.ShopItem,
                    as: 'item',
                    attributes: ['id', 'item_type', 'item_value']
                }],
                transaction
            });

            if (!purchase) {
                throw new Error('Товар не придбано');
            }

            const user = await db.User.findByPk(userId, {
                include: [{
                    model: db.Customer,
                    attributes: ['id']
                }],
                transaction,
                attributes: ['id', 'customer_id']
            });

            const item = purchase.item;
            const updateData = {};

            if (item.item_type === 'avatar_frame') {
                updateData.avatar_frame = null;
            } else if (item.item_type === 'title_badge') {
                updateData.title_badge = null;
            } else if (item.item_type === 'profile_theme') {
                updateData.profile_theme = 'default';
            }
            await Promise.all([
                purchase.update({ is_equipped: false }, { transaction }),
                Object.keys(updateData).length > 0
                    ? user.Customer.update(updateData, { transaction })
                    : Promise.resolve()
            ]);

            await transaction.commit();

            return { success: true };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async awardCoins(userId, amount, transactionType, description, referenceId = null) {
        const transaction = await db.sequelize.transaction();
        try {
            const userLevel = await db.UserLevel.findOne({
                where: { user_id: userId },
                lock: transaction.LOCK.UPDATE,
                transaction,
                attributes: ['id', 'user_id', 'coins']
            });

            if (!userLevel) {
                throw new Error('Користувача не знайдено');
            }

            const newBalance = userLevel.coins + amount;
            await Promise.all([
                userLevel.update({ coins: newBalance }, { transaction }),
                db.CoinTransaction.create({
                    user_id: userId,
                    amount,
                    transaction_type: transactionType,
                    reference_id: referenceId,
                    description,
                    balance_after: newBalance
                }, { transaction })
            ]);

            await transaction.commit();

            return { success: true, newBalance };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getUserPurchases(userId) {
        const purchases = await db.UserPurchase.findAll({
            where: { user_id: userId },
            include: [{
                model: db.ShopItem,
                as: 'item'
            }],
            order: [['purchased_at', 'DESC']]
        });
        return purchases.map(p => p.get({ plain: true }));
    }

    async getUserPurchasesPublic(userId) {
        const purchases = await db.UserPurchase.findAll({
            where: { user_id: userId },
            attributes: ['item_id', 'is_equipped'],
            include: [{
                model: db.ShopItem,
                as: 'item',
                attributes: ['name', 'description', 'rarity', 'item_type', 'item_value']
            }],
            order: [['purchased_at', 'DESC']]
        });
        return purchases.map((purchase) => purchase.get({ plain: true }));
    }

    async getTransactionHistory(userId, limit = 50) {
        const transactions = await db.CoinTransaction.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            limit,
            attributes: ['id', 'amount', 'transaction_type', 'description', 'balance_after', 'created_at']
        });

        return transactions;
    }
}

module.exports = new ShopService();

const shopService = require('../services/shopService');

class ShopController {
    async renderShop(req, res) {
        try {
            const userId = req.userId;
            const [categories, items, userCoins] = await Promise.all([
                shopService.getShopCategories(),
                shopService.getShopItems(userId),
                shopService.getUserCoins(userId)
            ]);
            res.render('shop', {
                title: 'Магазин | TechIndustry',
                metaDescription: 'Магазин TechIndustry: купуйте рамки для аватарів, значки, теми профілю та інші предмети за зароблені монети.',
                ogTitle: 'Магазин досягнень | TechIndustry',
                ogDescription: 'Персоналізуйте свій профіль: рамки, бейджі, теми. Витрачайте монети на унікальні предмети.',
                extraCss: ['/css/shop.css'],
                noindex: true,
                categories,
                items,
                userCoins,
                user: res.locals.user,
                csrfToken: req.csrfToken ? req.csrfToken() : ''
            });
        } catch (error) {
            console.error('renderShop error:', error);
            res.status(500).send('Помилка завантаження магазину');
        }
    }

    async purchase(req, res) {
        try {
            const { itemId } = req.body;
            const userId = req.userId;
            if (!itemId) {
                return res.status(400).json({
                    success: false,
                    message: 'Не вказано товар'
                });
            }
            const result = await shopService.purchaseItem(userId, parseInt(itemId));
            res.json({
                success: true,
                message: 'Товар успішно придбано!',
                newBalance: result.newBalance
            });
        } catch (error) {
            console.error('purchase error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async equip(req, res) {
        try {
            const { itemId } = req.body;
            const userId = req.userId;

            if (!itemId) {
                return res.status(400).json({
                    success: false,
                    message: 'Не вказано товар'
                });
            }
            await shopService.equipItem(userId, parseInt(itemId));
            res.json({
                success: true,
                message: 'Товар екіпіровано!'
            });
        } catch (error) {
            console.error('equip error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async unequip(req, res) {
        try {
            const { itemId } = req.body;
            const userId = req.userId;
            if (!itemId) {
                return res.status(400).json({
                    success: false,
                    message: 'Не вказано товар'
                });
            }
            await shopService.unequipItem(userId, parseInt(itemId));
            res.json({
                success: true,
                message: 'Екіпіровку знято!'
            });
        } catch (error) {
            console.error('unequip error:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getShopData(req, res) {
        try {
            const userId = req.userId;
            const [items, userCoins, purchases] = await Promise.all([
                shopService.getShopItems(userId),
                shopService.getUserCoins(userId),
                shopService.getUserPurchases(userId)
            ]);
            res.json({
                success: true,
                items,
                userCoins,
                purchases
            });
        } catch (error) {
            console.error('getShopData error:', error);
            res.status(500).json({
                success: false,
                message: 'Помилка завантаження даних'
            });
        }
    }

    async renderInventory(req, res) {
        try {
            const userId = req.userId;
            const [purchases, userCoins, transactions] = await Promise.all([
                shopService.getUserPurchases(userId),
                shopService.getUserCoins(userId),
                shopService.getTransactionHistory(userId, 100)
            ]);
            const inventory = {
                avatar_frames: [],
                title_badges: [],
                profile_themes: [],
                course_unlocks: []
            };

            purchases.forEach(purchase => {
                const item = purchase.item;
                const type = item.item_type;
                if (type === 'avatar_frame') {
                    inventory.avatar_frames.push({
                        ...purchase,
                        item
                    });
                } else if (type === 'title_badge') {
                    inventory.title_badges.push({
                        ...purchase,
                        item
                    });
                } else if (type === 'profile_theme') {
                    inventory.profile_themes.push({
                        ...purchase,
                        item
                    });
                } else if (type === 'course_unlock') {
                    inventory.course_unlocks.push({
                        ...purchase,
                        item
                    });
                }
            });

            res.render('inventory', {
                title: 'Мій інвентар | TechIndustry',
                metaDescription: 'Ваш інвентар на TechIndustry: куплені предмети, історія транзакцій та баланс монет.',
                extraCss: ['/css/shop.css'],
                noindex: true,
                inventory,
                userCoins,
                transactions,
                user: res.locals.user,
                csrfToken: req.csrfToken ? req.csrfToken() : ''
            });
        } catch (error) {
            console.error('renderInventory error:', error);
            res.status(500).send('Помилка завантаження інвентарю');
        }
    }
}

module.exports = new ShopController();

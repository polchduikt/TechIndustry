const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const purchaseLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: 'Забагато спроб покупки. Спробуйте пізніше.'
});

router.get('/', auth, shopController.renderShop);
router.get('/inventory', auth, shopController.renderInventory);
router.post('/purchase', auth, purchaseLimiter, shopController.purchase);
router.post('/equip', auth, shopController.equip);
router.post('/unequip', auth, shopController.unequip);
router.get('/data', auth, shopController.getShopData);

module.exports = router;
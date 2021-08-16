const express = require('express');

const router = express.Router();

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/access').isAuth;

router.get('/', shopController.getHome);

router.get('/shop', shopController.getShop);

router.get('/shop/series/:seriesId/:seriesName', shopController.getSeries);

router.get(
  '/shop/volume/:seriesId/:volumeId/:seriesName/:volumeNumber',
  shopController.getVolume
);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/delete-cart-item', isAuth, shopController.postCartDeleteItem);

router.get('/orders', isAuth, shopController.getOrders);

router.post('/place-order', isAuth, shopController.postOrder);

module.exports = router;

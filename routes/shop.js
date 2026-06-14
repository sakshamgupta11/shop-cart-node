const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const authMiddleWare = require("../middleware/is-auth")

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', authMiddleWare, shopController.getCart);

router.post('/cart', authMiddleWare, shopController.postCart);

router.post('/cart-delete-item', authMiddleWare, shopController.postCartDeleteProduct);

router.post('/cart-add-item', authMiddleWare, shopController.postCartAddProduct);
router.post('/cart-remove-item', authMiddleWare, shopController.cartDelete);

router.get("/checkout", authMiddleWare, shopController.getCheckOut);

router.get("/checkout/success", authMiddleWare,shopController.postOrder);
router.get("/checkout/cancel", authMiddleWare, shopController.getCheckOut);

// router.post('/create-order', authMiddleWare, shopController.postOrder);

router.get('/orders', authMiddleWare, shopController.getOrders);
router.get('/orders/:orderId', authMiddleWare, shopController.getInvoice);


module.exports = router;

const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const authMiddleWare = require("../middleware/is-auth")

const router = express.Router();

router.get('/', shopController.getIndex);

 router.get('/products', shopController.getProducts);

 router.get('/products/:productId', shopController.getProduct);

 router.get('/cart', authMiddleWare, shopController.getCart);

 router.post('/cart',authMiddleWare, shopController.postCart);

 router.post('/cart-delete-item', authMiddleWare,shopController.postCartDeleteProduct);
 
 router.post('/cart-add-item', authMiddleWare, shopController.postCartAddProduct);
  router.post('/cart-remove-item', authMiddleWare,shopController.cartDelete);

router.post('/create-order',authMiddleWare , shopController.postOrder);

router.get('/orders', authMiddleWare, shopController.getOrders);
router.get('/orders/:orderId', authMiddleWare, shopController.getInvoice);


module.exports = router;

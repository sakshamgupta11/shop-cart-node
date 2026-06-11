const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();
const authMiddleWare = require("../middleware/is-auth")
const adminAuth = require("../middleware/adminAuth")
const { body } = require("express-validator");


router.get('/add-product', authMiddleWare, adminController.getAddProduct);
router.get('/products', adminController.getProducts);

router.post('/add-product', [body("title").isString().isLength({ min: 4, max: 100 }).withMessage("please Enter title mini length 4 and max:100"), body("price").isNumeric().withMessage("please enter numeric number"),
body("description").isString().isLength({ min: 10, max: 200 }).withMessage("please Enter title mini length 10 and max:200")

], authMiddleWare, adminAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', authMiddleWare, adminAuth, adminController.getEditProduct);

router.post('/edit-product', [body("title").isString().isLength({ min: 4, max: 100 }).withMessage("please Enter title mini length 4 and max:100"), body("price").isNumeric().withMessage("please enter numeric number"),
body("description").isString().isLength({ min: 10, max: 200 }).withMessage("please Enter title mini length 10 and max:200")
], authMiddleWare, adminAuth, adminController.postEditProduct);

router.post('/delete-product', authMiddleWare, adminAuth, adminController.postDeleteProduct);

module.exports = router;

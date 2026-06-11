const express = require('express');
const authController = require("../controllers/auth");

const router = express.Router();
const { body } = require('express-validator');
const User = require("../models/user");

router.get("/login", authController.getLogin);
router.get('/signup', authController.getSignup);
router.get("/reset", authController.getReset);
router.get("/reset/:token", authController.getNewPassword);

router.post("/login", [body("email").isEmail().withMessage("Please enter the valid email")], authController.postLogin);

router.post("/logout", authController.postLogout);

router.post('/signup', [body('email').isEmail().withMessage("Please enter the valid email").custom((value, { req }) => {
    return User.findOne({ email: value }).then(userDoc => {
        if (userDoc) {
            return Promise.reject("E-mail exist already, please pick diffrent one or login")
        }
    })
}).normalizeEmail(),
body("password").isStrongPassword().trim().withMessage("Password must contain uppercase, lowercase, number and special characte").trim(),
body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
        throw new Error("password and confim password should be match")
    }
    return true
}).trim()],
    authController.postSignup);

router.post("/reset", authController.postReset);
router.post("/new-password", authController.postNewPassword)

module.exports = router;
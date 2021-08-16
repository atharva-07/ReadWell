const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const isAuth = require('../middleware/access').isAuth;

const authController = require('../controllers/auth');

router.get('/login', authController.getLogin);

router.post(
  '/login',
  body('email', 'Please enter a valid email').isEmail().normalizeEmail(),
  authController.postLogin
);

router.get('/signup', authController.getSignup);

router.post(
  '/signup',
  [
    body('username', 'Please enter a valid username').custom(
      (value, { req }) => {
        const RegEx = /^[^%<?'":;,&#!>^$]+$/;
        if (!value.match(RegEx)) {
          return false;
        }
        return true;
      }
    ),
    body('name', 'Name should only contain letters').custom(
      (value, { req }) => {
        const RegEx = /^[A-Za-z ]+$/;
        if (!value.match(RegEx)) {
          return false;
        }
        return true;
      }
    ),
    body('email', 'Please enter a valid email').isEmail().normalizeEmail(),
    body('password', 'Your password is not strong enough').custom(
      (value, { req }) => {
        // Minimum 8 characters {>>8,20}
        // Maximum 20 characters {8,>>20}
        // At least one uppercase character (?=.*[A-Z])
        // At least one lowercase character (?=.*[a-z])
        // At least one digit (?=.*\d)
        // At least one special character (?=.*[a-zA-Z >>!#$@^%&? "<<])[a-zA-Z0-9 >>!#$@^%&?<< ]
        const RegEx = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[a-zA-Z!#$@^%&? "])[a-zA-Z0-9!#$@^%&?]{8,20}$/;
        if (!value.match(RegEx)) {
          return false;
        }
        return true;
      }
    ),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Your passwords are not matching');
      }
      return true;
    })
  ],
  authController.postSignup
);

router.post('/logout', isAuth, authController.postLogout);

router.get('/user/:username', isAuth, authController.getProfile);

router.post('/user/:username', isAuth, authController.postProfile);

router.get('/reset', authController.getReset);

router.post(
  '/reset',
  body('email', 'Please enter a valid email').isEmail(),
  authController.postReset
);

router.get('/reset/:token', authController.getNewPassword);

router.post(
  '/new-password',
  [
    body('password', 'Your password is not strong enough').custom(
      (value, { req }) => {
        const RegEx = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[a-zA-Z!#$@^%&? "])[a-zA-Z0-9!#$@^%&?]{8,20}$/;
        if (!value.match(RegEx)) {
          return false;
        }
        return true;
      }
    ),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Your passwords are not matching');
      }
      return true;
    })
  ],
  authController.postNewPassword
);

module.exports = router;

const User = require('../models/user');

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const transport = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY
    }
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    docTitle: 'Login',
    errorMessage: message,
    oldInput: {
      email: '',
      password: ''
    }
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    docTitle: 'Sign Up',
    errorMessage: message,
    oldInput: {
      username: '',
      name: '',
      email: '',
      password: ''
    }
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      docTitle: 'Log In',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      }
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render('auth/login', {
          docTitle: 'Log In',
          errorMessage: 'Invalid email or password',
          oldInput: {
            email: email,
            password: password
          }
        });
      }
      bcrypt.compare(password, user.password).then((match) => {
        if (match) {
          req.session.username = user.username;
          req.session.isLoggedIn = true;
          req.session.isAdmin = user.admin;
          req.session.user = user;
          return req.session.save((err) => {
            res.redirect('/');
          });
        }
        req.flash('error', 'Invalid email or password');
        res.status(422).render('auth/login', {
          docTitle: 'Log In',
          errorMessage: 'Invalid email or password',
          oldInput: {
            email: email,
            password: password
          }
        });
      });
    })
    .catch((err) => {
      console.log('Could not Log In', err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postSignup = (req, res, next) => {
  const username = req.body.username;
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      docTitle: 'Sign Up',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        username: username,
        name: name,
        email: email,
        password: password,
        confirmPassword: confirmPassword
      }
    });
  }
  User.findOne({ username: username }).then((userDoc) => {
    if (userDoc) {
      return res.status(422).render('auth/signup', {
        docTitle: 'Sign Up',
        errorMessage: 'This username is already taken',
        oldInput: {
          username: username,
          name: name,
          email: email,
          password: password,
          confirmPassword: confirmPassword
        }
      });
    } else {
      User.findOne({ email: email })
        .then((userDoc) => {
          if (userDoc) {
            return res.status(422).render('auth/signup', {
              docTitle: 'Sign Up',
              errorMessage: 'This email is already registered',
              oldInput: {
                username: username,
                name: name,
                email: email,
                password: password,
                confirmPassword: confirmPassword
              }
            });
          }
          return bcrypt
            .hash(password, 12)
            .then((hashedPassword) => {
              const user = new User({
                username: username,
                name: name,
                email: email,
                password: hashedPassword,
                cart: { items: [], totalPrice: 0 }
              });
              return user.save();
            })
            .then((result) => {
              res.redirect('/login');
              return transport.sendMail({
                to: email,
                from: `${process.env.SENDGRID_ACC}`,
                subject: 'Welcome to ReadWell !',
                html: '<h1>You have successfully created your ReadWell account.</h1>'
              });
            })
            .then((result) => {
              res.redirect('/login');
            });
        })
        .catch((err) => {
          console.log('Could not Sign Up', err);
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    }
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log('Could not Log Out', err);
    }
    res.redirect('/');
  });
};

exports.getProfile = (req, res, next) => {
  const username = req.params.username;
  User.findOne({ username: username })
    .then((user) => {
      res.render('user/profile', {
        docTitle: `${username} | Profile`,
        path: '/account',
        user: user
      });
    })
    .catch((err) => {
      console.log('Could not retrieve user profile', err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postProfile = (req, res, next) => {
  const username = req.params.username;
  const name = req.body.name;
  const contact = req.body.contact;
  const address = req.body.address;
  const gender = req.body.gender;
  const dob = req.body.dob;
  User.findOne({ username: username })
    .then((user) => {
      user.name = name;
      user.contact = contact;
      user.address = address;
      user.gender = gender;
      user.dob = dob;
      return user.save().then((result) => {
        console.log('UPDATED USER INFORMATION!');
        res.redirect('/');
      });
    })
    .catch((err) => {
      console.log('Could not update user information', err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    docTitle: 'Password Recovery',
    path: '/reset',
    isAuthenticated: false,
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect('/reset');
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render('auth/reset', {
        docTitle: 'Password Recovery',
        path: '/reset',
        isAuthenticated: false,
        errorMessage: errors.array()[0].msg
      });
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('error', 'This email is not registered with ReadWell');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save().then((result) => {
          res.redirect('/');
          transport.sendMail({
            to: req.body.email,
            from: `${process.env.SENDGRID_ACC}`,
            subject: 'Password Recovery',
            html: `
              <h2>You requested a password reset</h2>
              <p>Click <a href="http://localhost:${process.env.DEV_PORT}/reset/${token}">here</a> to set a new password</p>
            `
          });
        });
      })
      .catch((err) => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() }
  })
    .then((user) => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        docTitle: 'New Password',
        path: '/new-password',
        userId: user._id.toString(),
        passwordToken: token,
        isAuthenticated: false,
        errorMessage: message
      });
    })
    .catch((err) => {
      console.log('Could not load new password page', err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.passwordToken;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/new-password', {
      docTitle: 'New Password',
      path: '/new-password',
      userId: userId,
      passwordToken: token,
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg
    });
  }
  let resetUser;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect('/login');
    })
    .catch((err) => {
      console.log('Could not update password', err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

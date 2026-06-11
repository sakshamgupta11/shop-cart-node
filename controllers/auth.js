const crypto = require('crypto');
const User = require("../models/user");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const sendidTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');
const dotenv = require("dotenv");
dotenv.config();



const transporter = nodemailer.createTransport(sendidTransport({
  auth: {
    api_key: process.env.api_key
  }
}));

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0]
  }
  else {
    message = null;
  }

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: { email: "", password: "" }
  });

};

exports.postLogin = (req, res, next) => {
  const { email, Password } = req.body;
  const error = validationResult(req)
  console.log(error.array());

  if (!error.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'login',
      errorMessage: error.array()[0].msg,
      oldInput: { email: email, password: Password }
    });
  }
  User.findOne({ email: email }).then(user => {
    if (!user) {
      req.flash('error', "user does not exist please signUp")
      return res.redirect('/signup');
    }
    return bcrypt.compare(Password, user.password).then(result => {
      if (!result) {
        req.flash('error', 'Invalid email or password');
        return res.redirect("login")
      }
      req.session.isLoggedIn = true;
      req.session.isLoggedIn = true;
      req.session.user = {
        _id: user._id.toString(),
        email: user.email,
        isAdmin: user.isAdmin
      };
      req.session.role = user.isAdmin;
      req.session.save(err => {
        if (err) {
          console.log(err);
        }
        return res.redirect("/");
      });
    })
  })
    .catch(err => console.log(err));
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0]
  }
  else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: { email: "", password: "", confirmPassword: "" }
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email, password: password, confirmPassword: confirmPassword }
    });
  }
  bcrypt.hash(password, 12).then(hashPassword => {
    const user = new User({
      email: email,
      password: hashPassword,
      cart: { items: [] }
    })
    console.log(email);
    return user.save();
  }).then(result => {
    res.redirect("/login")
    return transporter.sendMail({
      to: email,
      from: process.env.from,
      subject: "sign up succeed",
      html: "<h1> YOU have succesfully signed up</h1>"

    }).catch(err => {
      console.log(err);

    })

  })
    .catch(err => {
      console.log(err);

    })


}



exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
  res.redirect("/")
  });
}

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0]
  }
  else {
    message = null;
  }
  res.render('auth/reset.ejs', {
    path: '/reset',
    pageTitle: 'Reset password',
    errorMessage: message
  });
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset")
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email }).then(user => {
      if (!user) {
        req.flash('error', "No account with that email found");
        return res.redirect("/reset")
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save();

    }).then(result => {
      res.redirect('/login')
      transporter.sendMail({
        to: req.body.email,
        from: process.env.from,
        subject: "Password reset",
        html: `
        <p> You requested a password reset </p>
        <p> Click this <a href="http://localhost:3000/reset/${token}">reset</a> to set a new Password </p>

        `

      })
    }).catch(err => {
      console.log(err);

    });
  })
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {

      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0]
      }
      else {
        message = null;
      }
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    }).catch(err => {
      console.log(err);

    })

};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.Password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId })
    .then(user => {
      resetUser = user;
      console.log(user);

      return bcrypt.hash(newPassword, 12)
    }).then(hashPassword => {
      resetUser.password = hashPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save()

    }).then(result => {
      res.redirect('/login')
      transporter.sendMail({
        to: resetUser.email,
        from: "saksham.gupta9793@gmail.com",
        subject: "Password updated",
        html: ` <h2> Your password has been reset </h2>`
      })

    })

    .catch(err => {
      console.log();

    })
};
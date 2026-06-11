const path = require('path');
const mongodb = require("mongodb")
const statusMonitor = require("express-status-monitor");
const mongoose = require("mongoose");
const Order = require("./models/order");
const session = require("express-session");
const mongoDbStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const logs = require("./middleware/applogs");
const express = require('express');
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config()
const MONGODB_URI = process.env.URL
const store = new mongoDbStore({
  uri: MONGODB_URI,
  collection: "sessions"
});
const bodyParser = require('body-parser');


const csrfProtection = csrf();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimeType === 'image/jpg' || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
  }

}

const errorController = require('./controllers/error');
// const mongoConnect = require('./util/database').mongoConnect;
const User = require("./models/user")


const app = express();


app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(statusMonitor())
// app.use((req, res, next) => {

// });
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const { resourceUsage } = require('process');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

app.use(express.static(path.join(__dirname, 'public')));
app.use("/images",express.static(path.join(__dirname, 'images')));
app.use("/products/images",express.static(path.join(__dirname, 'images')));

app.use(session({
  secret: "my secret",
  resave: false,
  saveUninitialized: false,
  store: store
}));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  res.locals.role = req.session.role;
  res.locals.isAdmin = req.session.role === true;
  next()
});


app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)

    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      console.log(err);
      next(err);
    });
});
app.use(logs);
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);


app.get("/500", errorController.get500);
app.use(errorController.get404);
app.use((error, req, res, next) => {
  res.status(500).render('500', { pageTitle: '! Error', path: '/500', isAuthenticated: req.session.isLoggenIn })
})


// mongoConnect(() => {
//   app.listen(3000);
// });

mongoose.connect(MONGODB_URI)
  .then(result => {
    // User.findOne().then(user => {
    //   if (!user) {
    //     const user = new User({
    //       name: "max",
    //       email: "admin.com",
    //       cart: {
    //         items: []
    //       }
    //     })
    //     user.save();

    //   }
    // })
    app.listen(3000);
  }).catch(err => {
    console.log(err);

  })

// let totalprice = 0;
// Order.find({ "user.userId": "6a02e8167f003d3881ee7011" })
//   .select("products updatedAt")
//   .sort({ updatedAt: -1 })
//   .then(result => {


//     for (let i = 0; i < result.length; i++) {

//       for (let j = 0; j < result[i].products.length; j++) {

//         let getPrice = result[i].products[j].product.price;
//         let qty = result[i].products[j].quantity;
//         totalprice += getPrice * qty

//       }
//     }
//     console.log(totalprice, "...");

//     return result;
//   })
//   .catch(err => {
//     console.log(err);
//   });
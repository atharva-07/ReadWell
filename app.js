const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const authRoutes = require('./routes/auth');

const User = require('./models/user');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_USER_PW}@dummystorecluster.8o8sy.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`;

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: 'SomeMysteryText',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use(csrf());
app.use(flash());

app.use((req, res, next) => {
  res.locals.username = req.session.username;
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.isAdmin = req.session.isAdmin;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use(authRoutes);
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.error404);

app.use((error, req, res, next) => {
  res.status(500).render('error/error500', {
    docTitle: 'An Error Occured!',
    path: '/500'
  });
});

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    app.listen(process.env.DEV_PORT || 3000);
    console.log('Connected to the Database!');
  })
  .catch((err) => {
    console.log('Error establishing the connection! :-> ', err);
  });

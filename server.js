const express = require('express');
const path = require('path');
require('dotenv').config();


const adminRoute = require('./routes/adminRoute');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoute');
const session = require('express-session');
const passport = require('passport');
require('./config/passport');

const cartCountMiddleware =
require('./middleware/cartCountMiddleware');
const wishlistCountMiddleware =
require('./middleware/wishlistCountMiddleware');
const app = express();


connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  })
);
app.use(cartCountMiddleware);
app.use(wishlistCountMiddleware);
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.message = req.session.message || null;
  delete req.session.message;
  next();
});

app.use(passport.initialize());
app.use(passport.session());


app.use('/admin', adminRoute);   
app.use('/', userRoutes);



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
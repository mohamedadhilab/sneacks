const express = require('express');
const path = require('path');
require('dotenv').config();



const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoute');
const session = require('express-session');
const passport = require('passport');
require('./config/passport');

const app = express();


connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));


app.use(
  session({
    secret: 'your_secret_key', // change later
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true only in HTTPS
      maxAge: 1000 * 60 * 60 // 1 hour
    }
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', userRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
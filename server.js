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


app.use(
  session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', userRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
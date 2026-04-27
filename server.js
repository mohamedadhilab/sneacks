const express = require('express');
const path = require('path');
require('dotenv').config();



const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoute');

const app = express();

// DB
connectDB();

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const session = require('express-session');

app.use(
  session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true
  })
);

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// static
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', userRoutes);

// server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
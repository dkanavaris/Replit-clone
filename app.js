const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
require('dotenv').config()

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login-route/login');
const signupRouter = require('./routes/login-route/sign-up');
const mainPageRouter = require("./routes/main-page-route/main-page");
const projectRouter = require("./routes/project-route/project");

/* Connect to DB*/
const mongoDb = process.env.DB_URL;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* Use passport for authentication */
app.use(session({ secret: "cats", resave: false, saveUninitialized: false, cookie: {name : "test"}}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

/* Store the current user to a local variable */
app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/sign-up', signupRouter);
app.use('/main-page', mainPageRouter);
app.use('/@', projectRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;

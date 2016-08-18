var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

// Cookies and Body Parsers
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

// Session Management
var session = require("express-session");
var flash = require("connect-flash");

// Passport Authentication
var passport = require('passport');
var setupPassport = require('./setupPassport');

// Database Module
var mongoose = require('mongoose');

// Routers
var routes = require('./routes/index');
var login = require('./routes/login');
var signup = require('./routes/signup');
var logout = require('./routes/logout');
var create = require('./routes/create');
var join = require('./routes/join');
var group = require('./routes/group');
var poll = require('./routes/poll');
var sessionInfo = require('./routes/session');

//API Router
var api_v1 = require('./api/v1');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to the database
mongoose.connect('mongodb://localhost:27017/HitickDb');

//Session Middleware
app.use(session({
    secret: "TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX",
    resave: true,
    saveUninitialized: true
}));

// Setup Passport
setupPassport();
app.use(passport.initialize());
app.use(passport.session());

// Flash Middleware
app.use(flash());

app.use('/', routes);
app.use('/login', login);
app.use('/signup', signup);
app.use('/logout', logout);
app.use('/create', create);
app.use('/join', join);
app.use('/group', group);
app.use('/poll' , poll);
app.use('/session' , sessionInfo);

//Route for all API requets
app.use('/api/v1', api_v1);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

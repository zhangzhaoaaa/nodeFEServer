/**
 * Created by zhangmike on 16/8/8.
 */
var ejs = require('ejs');
var path = require('path');
var bodyParser = require('body-parser');
var lactate = require('lactate');
var routers = require('../router/routersIndex');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var connect = require('connect');
let env  = process.env.NODE_ENV || 'dev';
let config = require(`../config/config.${env}.json`);
//bind to global var
global.$g        = global.$g || {};
global.$g.config = config;

module.exports = function(app) {


	
	app.engine('html', ejs.renderFile);
	app.set('view engine', 'html');

	app.use(lactate.static(path.join(__dirname, '../')));
	app.use('/api/static', lactate.static(path.join(__dirname, '../views/static')));
	app.use(function() {
		var args = arguments;
		var isErr = args[0] instanceof Error;
		if (isErr) {
			args[2].status(500).send(args[0]);
		} else {
			args[2]();
		}
	});


	app.use(cookieParser('femoniter'));

	//parse application/x-www-form-urlencoded
	app.use(bodyParser.urlencoded({
		extended: false
	}));

	//
	//parse application/json
	app.use(bodyParser.json());

	// Use native promises
    mongoose.Promise = global.Promise;
	mongoose.connect(config.server_ip);
	const session = require('express-session');
	const MongoStore = require('connect-mongo')(session);
	app.use(session({
		secret: 'femoniter',
	    cookie: {  secure: false,httpOnly: false},
	    store: new MongoStore({ mongooseConnection: mongoose.connection }),
	    saveUninitialized: false,
	    resave: false
	}));
	app.use(function(req, res, next) {
	    res.header('Access-Control-Allow-Credentials', true);
	    res.header('Access-Control-Allow-Origin', req.headers.origin);
	    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
	    next();
});



	routers.forEach(function(router) {
		app.use(router);
	});


	//return error
	app.use(function(err, req, res, next){
		console.log(err);
	    res.end(err);
	});
};
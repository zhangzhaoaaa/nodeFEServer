/**
 * Created by zhangmike on 16/8/8.
 */
var ejs = require('ejs');
var path = require('path');
var bodyParser = require('body-parser');
var lactate = require('lactate');
var routers = require('../router/routersIndex');
var mongoose = require('mongoose');

let env  = process.env.NODE_ENV || 'dev';
let config = require(`../config/config.${env}.json`);
//bind to global var
global.$g        = global.$g || {};
global.$g.config = config;

module.exports = function(app) {
	app.engine('html', ejs.renderFile);
	app.set('view engine', 'html');

	mongoose.connect(config.server_ip);

	//parse application/x-www-form-urlencoded
	app.use(bodyParser.urlencoded({
		extended: false
	}));

	//
	//parse application/json
	app.use(bodyParser.json());

	routers.forEach(function(router) {
		app.use(router);
	});

	app.use(lactate.static(path.join(__dirname, '../')));

	app.use(function() {
		var args = arguments;
		var isErr = args[0] instanceof Error;
		if (isErr) {
			args[2].status(500).send(args[0]);
		} else {
			args[2]();
		}
	});
};
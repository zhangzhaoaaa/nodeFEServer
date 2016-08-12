/**
 * Created by zhangmike on 16/8/8.
 */
import {logger,loggerError} from '../lib/log'
import path from 'path';

module.exports = function(Router) {
	Router.all('/', function(req, res) {
		res.redirect('/index');
	});
	Router.get('/index', function (req, res) {
		/*var meixin = new SpeedInfo({ name: 'MeiXin' });
		meixin.save(function (err) {
			if (err) {
				console.log(err);
			} else {
				console.log('meow');
			}
		});*/
		logger.info("coming in...");
		res.render(path.resolve(__dirname,'../Views/index'), {
			title: '配置页面'
		});
	});

	Router.get('/start', function (req, res) {
		res.send({
			msg: '启动成功'
		});
	});

	Router.get('/close', function (req, res) {
		res.send({
			msg: '关闭成功'
		});
	});

	return Router;
}
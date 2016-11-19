/**
 * Created by zhangmike on 16/8/31.
 */
import db from '../dbmodel';
import moment from 'moment';
module.exports = function(Router) {
	Router.get('/', async function(req, res, next){
		try {
			// console.log(req.query)
			let result = await db.urls.$paginate(req.query);
			// console.log(result);
			let totalCount = await db.urls.$count(req.query);
			let ret = [];

			result.data.result.forEach(current => {
				ret.push({
					_id: current._id,
					url: current.url.url,
					platName:current.ids.platName
				});
			});
			res.json({
				totalCount: totalCount.data.count,
				data: ret
			});
		} catch(err) {
			next(err);
		}
	});

	Router.get('/count', async function(req, res, next){
		try {
			let result = await db.urls.$count(req.query);
			res.json({
				count: result.data.countTotal || 0
			});
		} catch(err) {
			next(err);
		}
	});

	Router.put('/regcancelUrl', async function(req, res, next){
		try {
			// console.log("regcancelurl...", req.body);
			let result = await db.userInfo.$updateReg({
				id: req.body.params.userId,
				urlId: req.body.params.urlId,
				op: req.body.params.op
			});
			res.json({
				data: result
			});
		} catch(err) {
			next(err);
		}
	});

	Router.get('/checkReg', async function(req, res, next){
		try {
			// console.log('db.userInfo.modelName...',req.body,req.params,req.query.userId, req.query.urlId);
			let result = await db.userInfo.$checkReg({
				id: req.query.userId,
				urlId: req.query.urlId
			});
			// console.log("checkReg...", result);
			res.json(result);
		} catch(err) {
			next(err);
		}
	});
	return Router;
}
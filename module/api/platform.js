/**
 * Created by zhangmike on 16/8/15.
 */
import db from '../dbmodel';
import moment from 'moment';
module.exports = function(Router) {
	//Create task
	Router.post('/createplatform', async function(req, res, next){
		try {
			let result = await db.platform.$createPlatform(req.body);
			await db.urls.$create({
				platid: result._id,
				url: req.body.urls
			});
			res.json(result);
		} catch(err) {
			next(err);
		}
	});
	Router.post('/updateplatform', async function(req, res, next){
		try {
			let result = await db.platform.$updatePlatform(req.body);
			await db.urls.$update({
				platid: req.body._id,
				urls: req.body.urls
			});
			res.json(result);
		} catch(err) {
			next(err);
		}
	});
	Router.delete('/deleteplatform/:id', async function(req, res, next){
		try {
			let result = await db.platform.$deletePlatform([req.params.id]);
			res.json(result);
		} catch(err) {
			next(err);
		}
	});
	Router.get('/findplatform', async function(req, res, next){
		try {
			let result = await db.platform.$paginate(req.query);
			let result2 = await result.data.result.map(current => {
				 let obj = {};
				 obj["_id"] = current._id;
				 obj["_createdAt"] = moment(current._createdAt).format('YYYY-MM-DD HH:mm:ss');
				 obj["platName"] = current.platName;
				 obj["platDesc"] = current.platDesc;
				 return obj;
			});
			let totalCount = await db.platform.$count({});
			res.json({
				totalCount: totalCount.data.count,
				data: result2
			});
		} catch(err) {
			next(err);
		}
	});

	Router.get('/count', async function(req, res, next){
		try {
			let result = await db.platform.$count(req.query);
			res.json(result);
		} catch(err) {
			next(err);
		}
	});

	Router.get('/findplatformbyid', async function(req, res, next){
		try {
			//console.log(req.query.id)
			let result = await db.platform.$get({id:req.query.id});
			// console.log(result);
			let urls = await db.urls.$findData({platid: req.query.id});
			// console.log(urls);
			result.data.result.urls = urls;
			res.json({
				data: result.data.result
			});
		} catch(err) {
			next(err);
		}
	});

	Router.get('/findurlsbyplatid/:id', async function(req, res, next){
		try {
			let result = await db.urls.$findData({platid: req.params.id});
			// console.log(req.params.id, result);
			res.json({
				data: result
			});
		} catch(err) {
			next(err);
		}
	});
	return Router;
}
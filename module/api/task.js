import db from '../dbmodel';
import events from 'events';
import constants from '../../config/constants';
var set = new Set();
var eventEmitter = new events.EventEmitter();
import {logger} from '../../lib/log';

eventEmitter.on('taskcreate_queue_event', async function() {
	logger.info('taskcreate_queue_event 事件触发');
	for (let req of set) {
		console.log(req.req);
		let results = await db.taskInfo.$createAPI(req.req);
		req.res.json(results);
		set.delete(req);
	}
	logger.info("set.size....",set.size);
});
function trimParam(param,session){
	param.filter = {};
    if (param.groupBy) {
        let id = session?(session.userId || 0):0;
        switch (param.groupBy) {
        case 'all':
            break;
        case 'mine':
        	param.filter['user.ID'] = id;
            break;
        case 'anonymous':
            param.filter['user.TN'] = '匿名';
            break;
        case 'schedule':
            param.filter['user'] = {$exists: false};
            break;
        }
        delete param.groupBy;
    }
    if (param.keyword) {
    	param.filter['url'] = { $regex: param.keyword, $options: 'i' };
    }
    return param;
}

module.exports = function(Router) {
	//Create task
	Router.post('/', async function(req, res, next){
	    try {
			logger.info(set.size);
			if (set.size < constants.CREATE_TASK_QUEUE) {
				set.add({
					req: req.body,
					res: res
				});
				eventEmitter.emit("taskcreate_queue_event");
			} else {
				res.json({
					data: true,
					code: 200,
					msg: "当前请求太多,请稍后重试!"
				});
			}
	    } catch(err) {
	        next(err);
	    }
	});
	//List task
	Router.get('/', async function(req, res, next){
	    try {
	    	let param = req.query;
	    	trimParam(param,req.session);
	    	let result = await db.taskInfo.$paginate(param);
	        res.json(result);
	    } catch(err) {
	        next(err);
	    }
	});
	Router.get('/count', async function(req, res, next){
	    try {
	    	let param = req.query;
	    	trimParam(param,req.session);
	    	let result = await db.taskInfo.$count(param);
	        res.json(result);
	    } catch(err) {
	        next(err);
	    }
	});
	//single get
	Router.get('/:id', async function(req, res, next){
	    try {
	    	let result = await db.taskInfo.$get({id:req.params.id});
	        res.json(result);
	    } catch(err) {
	    	console.log(err);
	        next(err);
	    }
	});
	//delete
	Router.delete('/', async function(req, res, next){
	    try {
	    	let ids = req.body.ids;
	    	if (!Array.isArray(ids) || ids.length <= 0){
				res.end(errors.error({
                 	code  : '104',
                	path  : 'taskID',
				}));
	    	}
	    	let result = await db.taskInfo.$delete(req.body.ids);
	    	console.log(result);
	    	//delete records
	    	if (result.code === 200) {
	    		let res = await db.speedInfo.$delByTaskid(req.body.ids);
	    	}
	        res.json(result);
	    } catch(err) {
	    	console.log(err);
	        next(err);
	    }
	});
	return Router;
}
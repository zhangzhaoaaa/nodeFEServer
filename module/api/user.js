import db from '../dbmodel';
import errors   from '../error';

//获取用户IP
function getClientIp(req) {
	return req.headers['x-real-ip']||
		req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;

};
function trimParam(param,session){
	param.filter = {};
	if (param.groupBy) {
        let id = session?(session.userId || 0):0;
        switch (param.groupBy) {
        case 'all':
            break;
        case 'admin':
        	param.filter['root'] = true;
            break;
        case 'no-email':
            param.filter['email.value'] = '';
            break;
        case 'disable':
            param['status'] = [0];
            break;
        }
        delete param.groupBy;
    }

    if (param.keyword) {
    	param.filter['name'] = { $regex: param.keyword, $options: 'i' };
    }
    return param;
}
module.exports = function(Router) {
	//mock get user
	Router.get('/getUser', async function(req, res, next){

		try {
			let id = req.session?req.session.userId:null;
			let userInfo;
			let result = {
					EM: 'no email',
					TN: '匿名',
					IP: getClientIp(req)
				};
			if(id){
				//fetch userInfo
				userInfo = await db.userInfo.$get({id});
				if(userInfo.code === 200){
					result.EN = userInfo.data.result.email.value;
					result.TN = userInfo.data.result.name;
					result.ID = userInfo.data.result._id;
					result.ROOT = userInfo.data.result.root;
				}
			}
			result = errors.success({
				result
			});
			res.json(result);
		} catch(err) {
			console.log(err);
			next(err);
		}
	});
	//List users
	Router.get('/', async function(req, res, next){
	    try {
	    	let param = req.query;
	    	trimParam(param,req.session);
	    	let result = await db.userInfo.$paginate(param);
	        res.json(result);
	    } catch(err) {
	        next(err);
	    }
	});
	Router.get('/count', async function(req, res, next){
	    try {
	    	let param = req.query;
	    	trimParam(param,req.session);
	    	let result = await db.userInfo.$count(param);
	        res.json(result);
	    } catch(err) {
	        next(err);
	    }
	});
	//single get
	Router.get('/:id', async function(req, res, next){
	    try {
			let result = null;
			if (req.params.id === 'checkpassword') {
				result = await db.userInfo.$check(req.query);
				result = result.code === 200 ? true : false;
			} else if (req.params.id === 'checkValidate') {
				result = await db.userInfo.$checkValidate(req.query);
			} else {
				result = await db.userInfo.$get({id:req.params.id});
			}
	        res.json(result);
	    } catch(err) {
	        next(err);
	    }
	});

	//Create user or login in
	Router.post('/', async function(req, res, next){
		try {
			//console.log(req.body);
			let result;
			if(req.body.method === 'signup') {
				result = await db.userInfo.$create(req.body);
			} else if(req.body.method === 'signin') {
				result = await db.userInfo.$check(req.body);
			}
			if(result.code === 200){
				let userid = result.data.result._id;
				let root = result.data.result.root;
				// req.session.userId = result.data.result;
				req.session.userId = result.data.result._id;
				req.session.save(function(err) {
					if (err) {
					  console.log(err);
					}
					console.log('session saved');
				});
				result.data.result = {
					userid,IP:getClientIp(req),ROOT: root
				}
			} 
			res.json(result);
		} catch(err) {
			next(err);
		}
	});
	Router.post('/signout', function(req, res, next){
			//console.log(req.body);
			if(req.session.userId){
				delete req.session.userId;
				req.session.save(function(err) {
			  // cannot access session here 
			  	if (err) {
				  next(err);
				}
				let result = {
					state:'OK',
					IP: getClientIp(req)
				};
				result = errors.success({
					result
				});
				res.json(result);
			});
		}
	});

	//delete
	Router.delete('/', async function(req, res, next){
	    try {
	    	let ids = req.body.ids;
	    	if (!Array.isArray(ids) || ids.length <= 0){
				res.end(errors.error({
                 	code  : '104',
                	path  : 'userID',
				}));
	    	}
	    	let result = await db.userInfo.$delete(req.body.ids);
	        res.json(result);
	    } catch(err) {
	    	console.log(err);
	        next(err);
	    }
	});

	//update
// Single edit
	Router.put('/:id', async function (req, res, next) {
	    try {
	        let result = await db.userInfo.$update(req.params.id,req.body);
	        if (result.code !== 200) {
	            return next(result);
	        }
	        res.json(result);
	    } catch (err) {
	        next(err);
	    }
	});
	// disable
	Router.post('/:id/ban', async function (req, res, next) {
	    try {
	        let result = await db.userInfo.$update(req.params.id,{_status: 0});
	        if (result.code !== 200) {
	            return next(result);
	        }
	        res.json(result);
	    } catch (err) {
	        next(err);
	    }
	});
	Router.post('/:id/activate', async function (req, res, next) {
	    try {
	        let result = await db.userInfo.$update(req.params.id,{_status: 1});
	        if (result.code !== 200) {
	            return next(result);
	        }
	        res.json(result);
	    } catch (err) {
	        next(err);
	    }
	});
	return Router;
}
import db from '../dbmodel';

module.exports = function(Router) {

	Router.get('/findByUrl',async function (req ,res, next) {
		try{
			let result = await db.speedInfo.find({url:req.query.url}).exec();
				//console.log(result);
		        res.json(result);
	    } catch(err) {
	        next(err);
	    }
	});


	return Router;
}
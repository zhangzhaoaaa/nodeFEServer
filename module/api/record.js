import db from '../dbmodel';

module.exports = function(Router) {

	Router.get('/findByUrl',async function (req ,res, next) {
		try{
			//console.log(db.speedInfo.$findByUrl);
			//let url = req.query.url;
			let result = await db.speedInfo.$findByUrl(req.query);
				//console.log(result);
		        res.json(result);
	    } catch(err) {
	        next(err);
	    }
	});

	Router.get('/:id', async function(req, res, next){
	    try {
	    	let result = await db.speedInfo.$findByTaskid({taskid:req.params.id,types:req.query.types});
	        res.json(result);
	    } catch(err) {
	    	console.log(err);
	        next(err);
	    }
	});


	return Router;
}
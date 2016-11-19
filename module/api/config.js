import config from '../../config/component';
import errors   from '../error';

module.exports = function(Router) {

    //List task
    Router.get('/', function(req, res, next){
        try {
            let result = config.map((x) => {
                return {
                    name:x.name
                };
            });
            res.json(
                errors.success({
                 result
            }));
        } catch(err) {
            next(err);
        }
    });

    Router.get('/count', function(req, res, next){
        try {
            let count = config.length;
            res.json(
                errors.success({
                 count
            }));
        } catch(err) {
            next(err);
        }
    });

    Router.get('/:name',function (req ,res, next) {
        try{
            let _name=req.params.name
             let array=config.filter(x => x.name===_name);
             console.log(array);
             let result;
             if(array){
                result =require(array[0].config);
             }else{
                    result = errors.error({
                    code  : '31',
                    path :  'api-config',
                    value : config
                });
            }
             res.json(result);
        } catch(err) {
            next(err);
        }
    });


    return Router;
}
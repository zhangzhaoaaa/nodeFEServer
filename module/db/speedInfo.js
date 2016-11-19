import {summaryTypes} from '../../config/speedTypes';
import mongoose from 'mongoose';
import errors   from '../error';

module.exports= {
    conf:{
        uuid : {
            type     : String,
            required : true
        },
        taskid: {
            type : mongoose.Schema.Types.ObjectId,
            ref  : 'taskInfo'
        },
        type : {
            type     : String,
            required : true
        },
        source : {
            type     : String,
            required : true
        },
        url : {
            type     : String,
            required : true
        },
        timestamp: {
            type : Date, 
            default: Date.now 
        }
    },
    statics:{
        $findByUrl:async function({url,types=summaryTypes}){
            try{
                //console.log(types);
                let res = this.find({url,type:{$in:types}});

                res = await res;
                //TODO: error process
                // if(!res){
                //     return errors.error({
                //         code  : '108',
                //         path  : path,
                //         value : id
                //     });
                // }
                return res;
            }catch(err){
                return Promise.reject(err);
            }
        },
        $findByTaskid:async function({taskid,types=summaryTypes}){
            try{
                //only return summary types
                let res = this.find({taskid,type:{$in:types}});

                res = await res;

                return errors.success(res);
            }catch(err){
                return Promise.reject(err);
            }
        },
        $delByTaskid:async function(taskids){
            try{
                let res = this.find({taskid:{$in:taskids}});

                res = await res.remove().exec();;

                return errors.success(res);
            }catch(err){
                return errors.format(err);
            }
        },
        $findData (option){
            return this.find({taskid: { $in: option.taskIds }})
        },
        $aggregate (option,cb){
            this.aggregate(option, cb);
        }
    }
}



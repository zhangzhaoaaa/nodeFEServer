'use strict'
import paginate from './common/paginate'
import findById from './common/findById'
import mongoose from 'mongoose';
import errors   from '../error';

let conf = {
        name: {
            type: String,
            required: true,
            unique: true
        },
        code: {
            type: Number,
            required: true,
            unique: true
        },
        permission: mongoose.Schema.Types.Mixed,
        _status:{
            //0 -> deleted,1 -> available
            type     : Number,
            default  : 1
        },
        description: String
    };

function trimOption(option){
    let trimed={};
    Object.keys(conf).forEach(key=>{
        let value=option[key];
        if(value){
            trimed[key]=value;
        }
    });
    return trimed;
}

let statics={
    $create:async function(option){
        let model=this;
        option=trimOption(option);

        let createRecord = new model(option);
        try{
            let result = await createRecord.save();

            return errors.success({
                result: result._id
            });
        }catch(err){
            console.log(err);
            return errors.format(err);
        }
       
    },
    $paginate:async function(data){
        return paginate(data,this);
    },
};
module.exports= {conf,statics}

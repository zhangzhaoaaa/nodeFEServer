'use strict'
import {addSitespeedTask} from '../lib/sitespeed';
import paginate from './common/paginate';
import findById from './common/findById';
import del from './common/delete';
import count from './common/count';
import mongoose from 'mongoose';
import errors   from '../error';


let conf={
        url : {
            type     : String,
            required : true
        },
        user : {
            type : mongoose.Schema.Types.Mixed
        },
        deviceType : {
            //0 -> mobile,1->PC
            type     : Number,
            default  : '0'
        },
        //0 -> native
        connectivity : {
            type     : Number,
            default  : '0'
        },
        pluginNames: { 
            type : [String]
        },
        state:{
            //0 -> not run or not store
            type     : Number,
            default  : 0
        },
        _status:{
            //0 -> deleted,1 -> available
            type     : Number,
            default  : 1
        },
        description:{
            type : String
        }
    }

function trimOption(option){
    let trimed={};
    Object.keys(conf).forEach(key=>{
        let value=option[key];
        if(value!==void 0){
            trimed[key]=value;
        }
    });
    return trimed;
}

let creatRaw = async function(option)  {
    let model=this;
    //过滤option
    option=trimOption(option);
    //默认进行数据存储
    if(option.store!==false){
        option.store=true;
    }
    if(option.url===undefined){
        return Promise.reject('You must submit an url');
    }
    try{

        let createRecord = new model(option);
        option.taskid=createRecord._id;
        let results;
        try{
           //console.log(createRecord);
           results=await addSitespeedTask(option);
           let newoption = results.options;
           createRecord.pluginNames=newoption.pluginNames;
           if(option.store){
             createRecord.state=1;
           }
        }
        catch(err){
            console.log('print error in taskinfo');
            console.log(err);
            createRecord.state=0;
            return Promise.reject(err);

        }
        let taskRecord = await createRecord.save();
        return {taskRecord,result:results.result};
    }catch(err){
        return Promise.reject(err);
    }
};

let statics={
    $create: async function(option){
        return creatRaw.bind(this)(option)
    },
    $createAPI: async function(option) {
        let result;
        try{
            result = await creatRaw.bind(this)(option);
            result = errors.success(result);
        }
        catch(err) {
            console.log(err);
            result = errors.format(err);
        }
        return result;
    },
    $count: async function(data){
        return count(data,this);
    },
    $paginate:async function(data){
        return paginate(data,this);
    },
    $get:async function({id}){
        return findById(id,[1],this);
    },
    $delete: async function(ids) {
        let res = await del(ids, this);
        return res;

    }
};
module.exports= {conf,statics}

'use strict'
import bcrypt from 'bcrypt';
import paginate from './common/paginate';
import findById from './common/findById';
import count from './common/count';
import del from './common/delete';
import update from './common/update';
import mongoose from 'mongoose';
import * as validate from './common/validate';
import errors   from '../error';
import constant from '../../config/constants';
import db from '../dbmodel';
import _ from 'lodash';
let conf={
        name : {
            type     : String,
            required : true,
            unique   : true,
            index    : true
        },
        password : {
            type     : String,
            writable : true,
            required : true
        },
        email : {
            value : {
                type      : String,
                default   : '',
                lowercase : true,
                trim      : true,
                validate  : {
                    validator : function(v){
                        return !v ? true : validate.email(v);
                    },
                    message : '104'
                },
                unique   : false
            },
            verified : {
                type    : Boolean,
                default : false
            }
        },
        phone :  {
            value : {
                type      : String,
                default   : '',
                lowercase : true,
                trim      : true,
                validate  : {
                    validator : function(v){
                        return !v ? true : validate.phone(v);
                    },
                    message : '104'
                },
                unique   : false
            },
            verified : {
                type    : Boolean,
                default : false
            }
        },
        group: {
            type : mongoose.Schema.Types.ObjectId,
            ref  : 'usergroupInfo'
        },
        _status:{
            //0 -> deleted,1 -> available
            type     : Number,
            default  : 1
        },
        root     : {
            type    : Boolean,
            default : false
        },
        urls :{
            type: [],
            default: []
        }
    }

function trimOption(option){
    let trimed={};
    Object.keys(conf).forEach(key=>{
        let value=option[key];
        if(value){
            trimed[key]=value;
        }
    });
    if(trimed['phone']){
        trimed.phone = {
            value: trimed.phone,
            verified: false
        }
    }
    if(trimed['email']){
        trimed.email = {
            value: trimed.email,
            verified: false
        }
    }
    return trimed;
}

let statics={
    $create:async function(option){
        let model=this;
        option=trimOption(option);
        let _salt = bcrypt.genSaltSync(10);
        let _pwd  = bcrypt.hashSync(`|-:${option.password}:-|`, _salt);
        option['password'] = _pwd;

        let createRecord = new model(option);
        let error = createRecord.validateSync();
        if (error) {
            let res = errors.format(error);
            console.log('res error');
            console.log(res);
            return res;
        }
        let urls = await db.urls.$findData({
            _status: constant.availableStatus,
            "url.url": {$in: constant.defaultUrls}
        });
        try{
            urls.forEach(data => {
                createRecord.urls.push(data._id);
            });
            let result = await createRecord.save();

            return errors.success({
                // result: result._id
                result: result
            });
        }catch(err){
            console.log(err);
            return errors.format(err);
        }
       
    },
    $check:async function(option){
        let model=this;
        option=trimOption(option);
        let res = await model.findOne({
            name : option.name
        }).where('_status').equals(1).select('_id password root');
        if(!res){
            return errors.error({
                code  : '214'
            });
        }
        let pwdres = await bcrypt.compareSync(`|-:${option.password}:-|`, res.password);
        return pwdres ? errors.success({
                // result: res._id
                result: res
            }) : errors.error({
            code  : '214'
        });
    },
    $count: async function(data){
        return count(data,this);
    },
    $paginate:async function(data){
        if (data.select){
            data.select = data.select.replace('password','');
        }
        return paginate(data,this);
    },
    $findAll: async function(option) {
        let res = await this.find(option);
        return res;
    },
    $checkValidate: async function(option) {
        let res = await this.findOne(_.merge({},option,
            {_status: constant.availableStatus}
        ));
        if (res) {
            return true;
        }else {
            return false;
        }
    },
    $get:async function({id}){
        //pupulate user group
        let populate = {
            path   : 'group',
            select : 'name permission code description',
            match  : {
                _status : { $gte : 1 }
            }
        }
        return findById(id,[0,1],this, populate);
    },
    $checkReg: async function({id, urlId}) {
        let res = await findById(id,[1],this);
        let obj = res.data.result.urls;
        return obj.includes(urlId);
    },
    $updateReg: async function({id, urlId, op}) {
        let obj = await findById(id, [1], this);
        let res = obj.data.result;
        if (op === 'reg') {
            res.urls.push(urlId);
        } else if (op === 'cancel') {
            res.urls = res.urls.filter(current => {
                if (current !== urlId) {
                    return true;
                } else {
                    return false;
                }
            });
        }
        let ret = update(id, {
                    urls: res.urls
                }, this);
        /*this.where({_id: id}).setOptions({overwrite: true}).update({
            $set: {

            }
        });*/
        return ret;
    },
    $update: async function(id, data){
        if(data.email){
            data.email = {
                value: data.email,
                verified: false
            }
        }
        if(data.phone){
            data.phone = {
                value: data.phone,
                verified: false
            }
        }
        if (data.password) {
            let _salt = bcrypt.genSaltSync(10);
            let _pwd  = bcrypt.hashSync(`|-:${data.password}:-|`, _salt);
            data.password = _pwd;
        }
        return update(id, data,this);
    },
    $delete: async function(ids) {
        let res = await del(ids, this);
        return res;
    }
};
module.exports= {conf,statics}

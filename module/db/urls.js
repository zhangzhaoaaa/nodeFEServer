/**
* Created by zhangmike on 16/8/31.
*/
import mongoose from 'mongoose';
import errors   from '../error';
import count from './common/countJoin';
import paginate from './common/paginateJoin';
import db from '../dbmodel';
import _ from 'lodash';
let conf = {
	platid: {
		type : mongoose.Schema.Types.ObjectId,
		ref  : 'platform'
	},
	_status: {
		type: Number,
		default: 1
	},
	url : {
		type     : Object,
		required : true
	}
};

let statics = {
	$create: async function(option){
		try{
			let model = this;
			let res = 'success';
			option.url.forEach(current => {
				let m = {
					platid: option.platid,
					url: current
				}
				let createRecord = new model(m);
				createRecord.save();
			});
			return res;
		}catch(err){
			return Promise.reject(err);
		}
	},
	$update: async function(option) {
		let r = this.remove({platid: option.platid});
		let res = await this.$create({ platid: option.platid, url: option.urls });
		return r;
	},
	$findData: async function (option){
		let pids = [],
			params;
		if (option.platid) {
			if (_.isString(option.platid)) {
				pids.push(option.platid);
			} else if (_.isArray(option.platid)) {
				pids = pids.concat(option.platid);
			}
			params = { platid: {$in: pids}, _status: 1};
		}else {
			params = option;
		}
		let res = await this.find(option);
		return res;
	},
	$paginate:async function(data){
		if (data.op === 'mine') {
			// console.log('mine....', data.userId);
			let res = await db.userInfo.$get({id: data.userId});
			// console.log('res...',res);
			let urls = res.data.result.urls;
			let mongoUrl = urls.map(cur => {
				return new mongoose.Types.ObjectId(cur);
			});
			return paginate(data,
				[
					{
						$lookup: {
							from: 'platforms',
							localField: 'platid',
							foreignField: '_id',
							as: 'ids'
						}
					},
					{
						$match: {
							_id: {$in: mongoUrl},
							_status: 1
						}
					},
					{ "$unwind": "$ids" },
					{
						$match:{
							"ids._status": 1
						}
					},
					{
						$limit: parseInt(data.limit)
					}
				], this);
		}else {
			return paginate(data, [
				{
					$lookup: {
						from: 'platforms',
						localField: 'platid',
						foreignField: '_id',
						as: 'ids'
					}
				},
				{
					$match: {
						_status: 1
					}
				},
				{ "$unwind": "$ids" },
				{
					$match:{
						"ids._status": 1
					}
				},
				{
					$limit: parseInt(data.limit)
				}
			], this);
		}
	},
	$count: async function(data){
		if (data.op === 'mine') {
			let res = await db.userInfo.$get({id: data.userId});
			let urls = res.data.result.urls;
			let mongoUrl = urls.map(cur => {
				return new mongoose.Types.ObjectId(cur);
			});
			return count(data,this, [
				{
					$lookup: {
						from: 'platforms',
						localField: 'platid',
						foreignField: '_id',
						as: 'ids'
					}
				},
				{
					$match: {
						_id: {$in: mongoUrl},
						_status: 1
					}
				},
				{ "$unwind": "$ids" },
				{
					$match:{
						"ids._status": 1
					}
				},
				{
					$group: {
						_id: null,
						count: {
							$sum: 1
						}
					}
				}
			]);
		} else {
			return count(data,this, [
				{
					$lookup: {
						from: 'platforms',
						localField: 'platid',
						foreignField: '_id',
						as: 'ids'
					}
				},
				{
					$match: {
						_status: 1
					}
				},
				{ "$unwind": "$ids" },
				{
					$match:{
						"ids._status": 1
					}
				},
				{
					$group: {
						_id: null,
						count: {
							$sum: 1
						}
					}
				}
			]);
		}

	}
};
module.exports= {conf,statics};
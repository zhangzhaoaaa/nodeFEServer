/**
 * Created by zhangmike on 16/8/15.
 */
import count from './common/count';
import paginate from './common/paginate';
import findById from './common/findById';
import del from './common/delete';
let conf={
	platName : {
		type     : String,
		default  : 'platName'
	},
	platDesc : {
		type     : String,
		default  : ''
	},
	platType: {
		type     : Number,
		default  : 0
	},
	urls : {
		type     : [],
		default  : []
	},
	_status:{
		//-1 -> delete 1-> available
		type     : Number,
		default  : 1
	},
	deviceType: {
		type: Number,
		default: 0
	}
}

let statics={
	$findPlatforms (option) {
		return this.find(option).sort({"_createdAt": -1});
	},
	$count: async function(data){
		return count(data,this);
	},
	$createPlatform: async function(option){
		let model=this;
		try{
			let createRecord = new model(option);
			let result = await createRecord.save();
			return result;
		}catch(err){
			return Promise.reject(err);
		}
	},
	$get:async function({id}){
		return findById(id,[1],this);
	},
	$paginate:async function(data){
		return paginate(data,this);
	},
	$updatePlatform (option){
		let res = this.where({ _id: option._id }).
				setOptions({ overwrite: true }).update({ $set: option});
		return res;
	},
	$deletePlatform: async function (id){
		let res = await del(id, this);
		await db.urls.remove({platid: id});
		return res;
	},
	$findUrls (option) {
		let res = this.find(option);
		return res;
	},
	$updateUrl (option){
		return this.update(option)
	},
	$deleteUrl (option){

	}
};
module.exports= {conf,statics}

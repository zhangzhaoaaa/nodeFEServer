/**
 * Created by zhangmike on 16/8/12.
 */
let conf={
	group : {
		type     : String,
		default  : 'testGroup'
	},
	ruleName : {
		//0 -> mobile,1->PC
		type     : String,
		default  : 'ScheduleRule'
	},
	rule: {
		type     : String,
		default  : ''
	},
	//0 -> native
	ruleType : {
		type     : Number,
		default  : '0'
	},
	state:{
		//0 -> not run
		type     : Number,
		default  : 0
	}
}

let statics={
	$createRule: function(option){
		let model=this;
		try{
			let createRecord = new model(option);
			let result = createRecord.save();
			return result;
		}catch(err){
			return Promise.reject(err);
		}
	},
	$findOneRule: function(option){
		let res = this.findOne(option);
		return res;
	},
	$findRule: function(option){
		let res = this.find(option);
		return res;
	}
};
module.exports= {conf,statics}

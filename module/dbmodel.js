import {getDirModule} from './lib/fsutil';
import  path from 'path';
var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
const defaultOptions={
	timestamps:{
        createdAt : '_createdAt',
        updatedAt : '_updatedAt'
    }
};

let db=getDirModule(path.join(__dirname,'/db'));

Object.keys(db).forEach((key)=>{
	let __schema=new Schema(db[key].conf,db[key].option||defaultOptions);
	__schema.static(db[key].statics);
	db[key]=mongoose.model(key,__schema);
});


 (async () => {
	//add default usergroup
	try{
		 let usergroup = db.usergroupInfo;
	     let usergroupdef = await usergroup.find({ name: 'rootGroup' } );
	     let groupid;
	     if (!usergroupdef || usergroupdef.length === 0) {
	         usergroupdef = await usergroup.$create({
	             name: 'rootGroup',
	             code: 1,
	             permission:  {
			        "task": [
			            {
			                "id": "1",
			                "value": "1111"
			            },
			            {
			                "id": "2",
			                "value": "1111"
			            }
			        ],
			        "config": [
			            {
			                "id": "1",
			                "value": "1111"
			            },
			            {
			                "id": "2",
			                "value": "1111"
			            }
			        ]
			    }
	         });
	         if (usergroupdef.code === 200) {
	         	groupid = usergroupdef.data.result;
	         } else {
	         	return;
	         }
	     } else {
	     	groupid = usergroupdef[0]._id;
	     }
	     // console.log(groupid);
		//add root user 
	     let user = db.userInfo;
	     let userdef = await user.find({name: 'root' });
	     if (!userdef || userdef.length === 0) {
	         userdef = (await user.$create({
	             name: 'root',
	             password: 'root',
	             group: groupid,
	             phone: '13288888888'
	             })).data;
	     } else {
	     	//update group id
	     	let res = await user.findOneAndUpdate({name: 'root' }, {group: groupid});
	     	// console.log(res);
	     }
    }
    catch(err) {
    	console.log(err);
    }
})();

export default db;

import {getDirModule} from '../lib/fsUtil';
import  path from 'path';
var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
let db=getDirModule(path.join(__dirname,'/schema'));

Object.keys(db).forEach((key)=>{
	db[key]=mongoose.model(key,new Schema(db[key]));
});

export default db;

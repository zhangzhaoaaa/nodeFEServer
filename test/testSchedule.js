/**
 * Created by zhangmike on 16/8/8.
 */
var schedule = require('../router/schedule');

schedule.scheduleDayStart();

setTimeout(function(){
	schedule.scheduleDayClose();
},1000 * 20);
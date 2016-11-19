/**
 * Created by zhangmike on 16/8/8.
 */
var schedule = require('../router/schedule');

schedule.scheduleDayStart('at 17:30',function() {
	console.log("dddddddddddd");
});

/*setTimeout(function(){
	console.log('before..',global.scheduleDayTimer)
	schedule.scheduleDayClose();
	schedule.scheduleDayStart('every 1 s');
},1000 * 20);*/

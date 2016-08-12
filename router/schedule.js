/**
 * Created by zhangmike on 16/8/8.
 */
var  later  = require('later');
var scheduleDayTimer = null,
	scheduleWeekEmailTimer = null;

var scheduleDayStart = function() {
	var textSched = later.parse.text('every 5 s');

	// execute logTime one time on the next occurrence of the text schedule

	// execute logTime for each successive occurrence of the text schedule
	scheduleDayTimer = later.setInterval(logTime, textSched);

	// function to execute
	function logTime() {
		console.log(new Date());
	}
};
var scheduleDayClose = function() {
	// clear the interval timer when you are done
	if (scheduleDayTimer) {
		scheduleDayTimer.clear();
	}
};
var scheduleWeekEmailStart = function() {
	var textSched = later.parse.text('every 5 s');

	// execute logTime one time on the next occurrence of the text schedule
	//var timer = later.setTimeout(logTime, textSched);

	// execute logTime for each successive occurrence of the text schedule
	//scheduleWeekEmailTimer = later.setInterval(logTime, textSched);

	// function to execute
	function logTime() {
		console.log(new Date());
	}
};
var scheduleWeekEmailClose = function() {
	// clear the interval timer when you are done
	scheduleWeekEmailTimer.clear();
};
module.exports = {scheduleDayStart, scheduleWeekEmailStart,
	scheduleDayClose, scheduleWeekEmailClose};
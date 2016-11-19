/**
 * Created by zhangmike on 16/8/14.
 */
import later from 'later';

later.date.localTime();

var scheduleDayStart = function(rule, cb) {

	scheduleDayClose();

	var textSched = later.parse.text(rule);

	global.scheduleDayTimer = later.setInterval(cb, textSched);
};

var scheduleDayClose = function() {
	// clear the interval timer when you are done
	if (global.scheduleDayTimer) {
		global.scheduleDayTimer.clear();
	}
};

var scheduleDayAggregate = function(rule, cb) {

	scheduleDayAggregateClose();

	var textSched = later.parse.text(rule);

	global.scheduleDayAggregateTimer = later.setInterval(cb, textSched);
};

var scheduleDayAggregateClose = function() {
	// clear the interval timer when you are done
	if (global.scheduleDayAggregateTimer) {
		global.scheduleDayAggregateTimer.clear();
	}
};

var scheduleWeekReportStart = function(rule, cb) {

	scheduleWeekReportClose();

	var textSched = later.parse.text(rule);

	global.scheduleWeekReport = later.setInterval(cb, textSched);
};

var scheduleWeekReportClose = function() {
	// clear the interval timer when you are done
	if (global.scheduleWeekReport) {
		global.scheduleWeekReport.clear();
	}
};

var scheduleSendEmailStart = function(rule, cb) {

	scheduleSendEmailClose();

	var textSched = later.parse.text(rule);

	global.scheduleSendEmail = later.setInterval(cb, textSched);
};

var scheduleSendEmailClose = function() {
	// clear the interval timer when you are done
	if (global.scheduleSendEmail) {
		global.scheduleSendEmail.clear();
	}
};
export default {scheduleDayStart, scheduleDayClose,
	scheduleDayAggregate, scheduleDayAggregateClose,
	scheduleWeekReportStart,scheduleWeekReportClose,
	scheduleSendEmailStart, scheduleSendEmailClose};
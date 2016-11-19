/**
 * Created by zhangmike on 16/8/25.
 */
const constants = {
	dailySchedule: 1,
	dailyAggregate: 3,
	weekReport: 2,
	weekSendEmail: 4,
	availableStatus: 1,
	staticPeriod: -7,
	defaultUrls: ["https://m.gomeplus.com", "https://h5.gomeplus.com"],
	waitForTime: 5000,
	testScheduleUrls: [ {
		url: { url: 'https://m.gomeplus.com' }
	},{
		url: { url: 'https://h5.gomeplus.com' }
	}],
	testSendEmail: 'zhangzhao@gomeplus.com',
	CREATE_TASK_QUEUE: 20,
	JSONFILENAME: 'femonitorjsondata.json'
};

export default constants;
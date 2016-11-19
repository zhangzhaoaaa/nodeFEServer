/**
 * Created by zhangmike on 16/9/10.
 */
import db from '../../dbmodel';
import moment from 'moment';
import constants from '../../../config/constants';
import {logger,loggerError} from '../../../lib/log';
import sendEmail from '../sendEmail';

export default async function() {
	console.log("准备send email每周数据聚合pdf.zip1")
	logger.info("准备send email每周数据聚合pdf.zip");
	let result = await db.userInfo.$findAll({_status: constants.availableStatus});
	let users = result;
	let pi = [];
	console.log("users...", users.length);
	logger.info("users..." + users.length);
	for (let user of users) { // 循环用户
		if (user.email.value === '' || user.email.value === null) {
			continue;
		}
		let urlsData = await db.urls.$findData({
			_id: {$in: user.urls}, _status: constants.availableStatus
		}, {"url.url": 1});
		logger.info('userUrls...', urlsData);
		logger.info('global.zipSet.size...', global.zipSet.size);
		let uData = urlsData;
		var urlSet = new Set();
		for (let ud of uData) {//循环每个用户注册的url
			for (let item of global.zipSet){
				if (ud.url.url === item.url) {
					urlSet.add(item);
				}
			}
		}

		if (urlSet.size > 0) {
			await pi.push(sendEmail({
				pdfPath: urlSet,
				sendTo: user.email.value
			}));
		} else {
			logger.info('urlSet....', urlSet.size);
		}
	}
	await Promise.all(pi).then(()=>{
		console.log('sendEmail over...');
		global.zipSet = new Set();
	});
}
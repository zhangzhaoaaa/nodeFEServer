/**
 * Created by zhangmike on 16/9/10.
 */
import {logger} from '../../../lib/log';
import db from '../../dbmodel';
import mongoose from 'mongoose';

export default async function(urlsResult) {
	logger.info("开始执行日常数据收集入库");

	var promises = [];
	for (let u of urlsResult){
		let p = await db.taskInfo.$create({
			url: u.url.url,
			deviceType: (u.plat && u.plat.deviceType) || 0
		});
		promises.push(p);
	};
	var taskIds = [];
	await Promise.all(promises).then(values => {
		values.forEach(current => {
			taskIds.push(new mongoose.Types.ObjectId(current.taskRecord._id));
		});
	});
	global.dayScheduleTaskIds = taskIds;
	logger.info("执行日常数据收集入库完毕");
}
/**
 * Created by zhangmike on 16/8/25.
 */
import request from './request';
import {logger,loggerError} from './log';

export default function (port) {
	(async function (){
		let dailyResult = await request({
			method:'post',
			url: `http://localhost:${port}/api/schedule/executeStartRule`,
			data: {ruleType:1}
		});
		if (dailyResult.data.msg) {
			logger.info("每日执行三次的任务启动成功!");
		}else{
			loggerError.error("每日执行三次的任务启动失败!");
		}
	})();

	(async function (){
		let weekResult = await request({
			method:'post',
			url: `http://localhost:${port}/api/schedule/executeStartRule`,
			data: {ruleType:2}
		});
		if (weekResult.data.msg) {
			logger.info("每周五的任务启动成功!");
		}else{
			loggerError.error("每周五的任务启动失败!");
		}
	})();

	(async function (){
		let weekResult = await request({
			method:'post',
			url: `http://localhost:${port}/api/schedule/executeStartRule`,
			data: {ruleType: 4}
		});
		if (weekResult.data.msg) {
			logger.info("每周五发邮件的任务启动成功!");
		}else{
			loggerError.error("每周五发邮件的任务启动失败!");
		}
	})();
}
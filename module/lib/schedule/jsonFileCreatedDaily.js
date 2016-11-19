/**
 * Created by zhangmike on 16/9/10.
 */
import db from '../../dbmodel';
import fs from 'fs';
import moment from 'moment';
import constants from '../../../config/constants';
import {logger,loggerError} from '../../../lib/log';
export default function () {
	logger.info("开始执行日常数据JSON文件生成");
	console.log("开始执行日常数据JSON文件生成", global.dayScheduleTaskIds);
	db.speedInfo.$aggregate(
		[
			{
				$match: {
					taskid: {$in: global.dayScheduleTaskIds},
					$or: [
						{
							type: "coach.summary"
						},
						{
							type: "pagexray.summary"
						},
						{
							type: "browsertime.summary"
						}
					]
				}
			},
			{
				$group: {
					_id: {
						url: "$url"
					},
					item: {
						$push: {
							type: "$type",
							data: "$data",
							timestamp: "$timestamp"
						}
					}
				}
			}
		], function (err, data) {
			console.log("data....", data);
			var js = {};
			var jsonData = {};

			function rev(cx, obj) {
				Object.keys(obj).forEach(function (c) {
					if (obj[c].max === undefined) {
						rev(c, obj[c])
					} else {
						if (cx != null) {
							if (jsonData[cx]) {
								jsonData[cx][c] = obj[c].max;
							} else {
								jsonData[cx] = {}
								jsonData[cx][c] = obj[c].max;
							}
						} else {
							jsonData[c] = obj[c].max
						}
					}
				});
			};
			data.forEach(rec => {// 循环所有数据
				rec.item.forEach(item => {//循环item
					var itemData = item.data;
					jsonData = {};
					rev(null, itemData);
					js[item.type] = jsonData;
					js["tasktimestamp"] = item.timestamp;
				});
				// let d = new Date();
				// let date = moment(d).format('YYYY-MM-DD-HH-mm-ss');
				// let urlType = rec._id.url.replace(/http(s?):\/\//g, "");

				// let fileName = urlType.replace(/\//g, '-');
				global.dayScheduleTaskIds = [];

				/*let finalJsonpath = global.$g.config.sitespeedpath +
					fileName + date + '.json';*/
				let finalJsonpath = global.$g.config.sitespeedpath + constants.JSONFILENAME;

				Object.keys(js).forEach(function (current) {
					if (/\./g.test(current)) {
						let k = current.replace(/\./g, '_');
						js[k] = js[current];
						delete js[current];
					}
				});
				js["taskurl"] = rec._id.url;

				//console.log(finalJsonpath);
				// console.log("@cee:" + JSON.stringify(js))

				// \r\n 特为windows下换行,\n为linux下换行
				fs.appendFileSync(finalJsonpath, "@cee:" + JSON.stringify(js) + "\r\n", "utf8");
			});
			logger.info("执行日常数据JSON文件生成完毕");
		});
}
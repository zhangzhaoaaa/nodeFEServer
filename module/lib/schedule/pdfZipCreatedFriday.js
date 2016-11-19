/**
 * Created by zhangmike on 16/9/10.
 */
import db from '../../dbmodel';
import fs from 'fs';
import moment from 'moment';
import constants from '../../../config/constants';
import {logger,loggerError} from '../../../lib/log';
import generatePdf from '../generatePdf';
export default async function() {
	global.zipSet = new Set();
	logger.info("开始执行每周数据聚合");
	console.log("开始执行每周数据聚合");
	let urlsResult = await db.urls.$findData({_status: constants.availableStatus});
	var urls = [];

	urlsResult.forEach(function(c) {
		urls.push(c.url.url);
	});
	var now = new Date();
	var endDate = moment(now).format('YYYY-MM-DD');
	var startDate = moment(now).add(constants.staticPeriod, 'day').format('YYYY-MM-DD');
	await db.speedInfo.$aggregate([
		{
			$match:{
				url: {
					$in: urls
				},
				timestamp:{
					$gte: startDate,
					$lte: endDate
				},
				$or: [
					{
						type: "coach.summary"
					},
					{
						type: "pagexray.summary"
					},
					{
						type: "browsertime.summary"
					},
					{
						type:"coach.pageSummary"
					}
				]
			}
		},
		{
			$group:{
				_id:{
					url:"$url"
				},
				totalAvg:{
					$avg:"$data.score.max"
				},
				performanceAvg:{
					$avg:"$data.performance.score.max"
				},
				accessibilityAvg:{
					$avg:"$data.accessibility.score.max"
				},
				totalSizeAvg:{
					$avg:"$data.transferSize.max"
				},
				imageSizeAvg:{
					$avg:"$data.contentTypes.image.transferSize.max"
				},
				javaScriptSizeAvg:{
					$avg:"$data.contentTypes.javascript.transferSize.max"
				},
				cssSizeAvg:{
					$avg:"$data.contentTypes.css.transferSize.max"
				},
				totalRequestCountAvg:{
					$avg:"$data.requests.max"
				},
				imageRequestCountAvg:{
					$avg:"$data.contentTypes.image.requests.max"
				},
				javaScriptRequestCountAvg:{
					$avg:"$data.contentTypes.javascript.requests.max"
				},
				cssRequestCountAvg:{
					$avg:"$data.contentTypes.css.requests.max"
				},
				request200Avg:{
					$avg:"$data.responseCodes.200.max"
				},
				rumSpeedIndexAvg:{
					$avg:"$data.rumSpeedIndex.max"
				},
				firstPaintAvg:{
					$avg:"$data.firstPaint.max"
				},
				backendTimeAvg:{
					$avg:"$data.timings.backEndTime.max"
				},
				frontEndTimeAvg:{
					$avg:"$data.timings.frontEndTime.max"
				},
				item:{
					$push:{
						timestamp:"$timestamp",
						data:"$data"
					}
				}
			}
		}
	], async function (err, data) {
		// console.log(data);
		logger.info("准备生成每周数据聚合pdf.zip");
		let p = [];
		for (let rec of data){
			let url = rec._id.url;
			let pdfName = url.replace(/http(s?):\/\//g,"");
			let pi = generatePdf(rec, {
				url: url,
				pdfName: pdfName,
				startDate: startDate,
				endDate:endDate
			}).then(function(data){
				global.zipSet.add(data);
				//console.log("global.zipSet...",global.zipSet)
			});
			p.push(pi);
		}
		await Promise.all(p).then(()=>{
			logger.info("每周数据聚合pdf.zip生成完毕");
		});
	});
}
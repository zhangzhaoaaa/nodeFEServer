/**
 * Created by zhangmike on 16/8/12.
 */
import db from '../dbmodel';
import schedule from '../lib/schedule';
import fs from 'fs';
import mongoose from 'mongoose';
import moment from 'moment';
import generatePdf from '../lib/generatePdf';
import sendEmail from '../lib/sendEmail';
import mkdirp from 'mkdirp';
import path from 'path';
import constants from '../../config/constants';
import {logger,loggerError} from '../../lib/log';
import infoInserMongoDaily from '../lib/schedule/infoInsertMongoDaily';
import jsonFileCreatedDaily from '../lib/schedule/jsonFileCreatedDaily';
import pdfZipCreatedFriday from '../lib/schedule/pdfZipCreatedFriday';
import emailZipFileFriday from '../lib/schedule/emailZipFileFriday';
module.exports = function(Router) {
	Router.post('/createRule', async function(req, res, next){
		try {
			let result = await db.schedule.$createRule(req.body);
			res.json(result);
		} catch(err) {
			next(err);
		}
	});
	Router.get('/findRule', async function(req, res, next){
		try {
			let result = await db.schedule.$findOneRule(req.body);
			res.json(result);
		} catch(err) {
			next(err);
		}
	});
	Router.post('/executeStartRule', async function(req, res, next){
		try {
			let result = await db.schedule.$findOneRule({ruleType:req.body.ruleType});
			// console.log('urlsResult...', urlsResult);
			var msg = false;
			if (result && req.body.ruleType == constants.dailySchedule){
				schedule.scheduleDayStart(result.rule, async ()=>{
					let urlsResult = await db.urls.aggregate([
						{
							$lookup:
							{
								from: "platforms",
								localField: "platid",
								foreignField: "_id",
								as: "plat"
							}
						},
						{ "$unwind": "$plat" },
						{
							$match:{
								_status: constants.availableStatus
							}
						},
						{
							$match:{
								"plat._status": constants.availableStatus
							}
						}
					]);
					await infoInserMongoDaily(urlsResult);
				});
				let sendRule = await db.schedule.$findOneRule({
					ruleType: constants.dailyAggregate
				});
				//console.log("global.dayScheduleTaskIds...", global.dayScheduleTaskIds)
				schedule.scheduleDayAggregate(sendRule.rule, async ()=>{
					await jsonFileCreatedDaily();
				});
				msg = true;
			} else if (result && req.body.ruleType == constants.weekReport) {
				logger.info("coming in..." + result.rule);
				schedule.scheduleWeekReportStart(result.rule, async ()=>{
					logger.info("pdfZip schedule开始执行...");
					await pdfZipCreatedFriday();
				});
				msg = true;
			} else if (result && req.body.ruleType == constants.weekSendEmail) {
				logger.info("准备send email每周数据聚合pdf.zip" + result.rule);
				schedule.scheduleSendEmailStart(result.rule, async ()=> {
					logger.info("send email schedule开始执行...");
					await emailZipFileFriday();
				});
				msg = true;
			}
			res.json({
				msg:msg,
				data:result
			});
		} catch(err) {
			next(err);
		}
	});
	Router.post('/testExecuteStartRule/:ruleType', async function(req, res, next){
		try {
			var msg = false;
			if (req.params.ruleType == constants.dailySchedule){
				await infoInserMongoDaily(constants.testScheduleUrls);
				await setTimeout(()=>jsonFileCreatedDaily(), constants.waitForTime);
				msg = true;
			} else if (req.params.ruleType == constants.weekReport) {
				await pdfZipCreatedFriday();
				msg = true;
			} else if (req.params.ruleType == constants.weekSendEmail) {
				await emailZipFileFriday();
				msg = true;
			}
			res.json({
				msg:msg
			});
		} catch(err) {
			next(err);
		}
	});
	Router.post('/executeCloseRule', async function(req, res, next){
		try {
			let result = await db.schedule.$findOneRule(req.body);
			var msg = false;
			if (req.body.ruleType == constants.dailySchedule){
				schedule.scheduleDayClose(result.rule);
				let resultGroup = await db.schedule.$findOneRule({
					ruleType: constants.dailyAggregate
				});
				schedule.scheduleDayAggregateClose(resultGroup.rule);
				msg = true;
			}else if (req.body.ruleType == constants.weekReport) {
				schedule.scheduleWeekReportClose(result.rule);
				msg = true;
			}else if (req.body.ruleType == constants.weekSendEmail) {
				schedule.scheduleSendEmailClose(result.rule);
				msg = true;
			}
			res.json({
				msg: msg,
				data: result
			});
		} catch(err) {
			next(err);
		}
	});
	return Router;
}
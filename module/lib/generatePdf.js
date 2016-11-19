/**
 *
 * Created by zhangmike on 16/8/17.
 */
import PdfPrinter from 'pdfmake';
import fs from 'fs';
import path from "path";
import moment from 'moment';
import {logger,loggerError} from '../../lib/log';
import crypto from 'crypto';
import mkdirp from 'mkdirp';
var JSZip = require("jszip");
var today = moment(new Date()).format('YYYY-MM-DD');
logger.info("pdf 日期文件....",today);
function mp(relFontPath) {
	return path.resolve(__dirname, relFontPath)
}

let fonts = {
	msyh: {
		normal: mp('../../lib/fonts/msyh.ttf'),
		bold:  mp('../../lib/fonts/msyh.ttf'),
		italics:  mp('../../lib/fonts/msyh.ttf'),
		bolditalics:  mp('../../lib/fonts/msyh.ttf')
	}
};
let printer = new PdfPrinter(fonts);
let rmap = {};

function insertReturn(text){
	var newText = text;
	for (var i = 0,length = newText.length; i < length; i++){
		if (i % 15 === 0){
			newText = newText.substring(0, i) + "\n" + newText.substring(i, newText.length);
		}
	}
	return newText;
};

function filterAdvice(adviceList, data, advices) {
	let keyArray = Object.keys(adviceList);
	for (var i = 0, len = keyArray.length; i < len; i++) {
		var arr = [];
		var key = keyArray[i];
		if (adviceList[key].advice.trim() === '') {
			continue;
		}
		arr[0] = insertReturn(adviceList[key].title);
		arr[1] = insertReturn(adviceList[key].advice);
		arr[2] = moment(data.timestamp).format('YYYY-MM-DD HH:mm:ss');
		advices.push(arr);
	}
}
function filterWhiteList(info){
	var obj = {};
	if (info.domDepth){
		obj["domDepthAvg"] = info.domDepth.avg;
		obj["domDepthMax"] = info.domDepth.max;
	}
	/*if (info.head){
		obj["headCss"] = info.head.css.join(",");
		obj["headJSAsync"] = info.head.jsasync.join(",");
		obj["headJSSync"] = info.head.jssync.join(",");
	}*/
	return obj;
};

function filterObject(obj, data, advices) {
	try {
		let keyArray = Object.keys(obj);
		for (var i = 0, len = keyArray.length; i < len; i++) {
			var arr = [];
			var key = keyArray[i];
			if (typeof obj[key] === 'object') {
				filterObject(filterWhiteList(obj), data, advices);
			}else {
				arr[0] = key;
				if (key === 'localStorageSize') {
					arr[1] = (obj[key] / 1024).toFixed(2).toString() + " KB";
				}else {
					arr[1] = obj[key].toString();
				}

				arr[2] = moment(data.timestamp).format('YYYY-MM-DD HH:mm:ss');
			}

			advices.push(arr);
		}
	}catch(e){
		console.log(e)
	}
}
function createAdvice(data,
					  accAdvices,
					  performanceAdvices,
					  bestPracticeAdvices,
					  infos) {

	let d = data.data;
	if (d.advice) {
		if (d.advice.accessibility &&
			d.advice.accessibility.adviceList) {
			let adviceList = d.advice.accessibility.adviceList;
			filterAdvice(adviceList, data, accAdvices);
		}

		if (d.advice.performance &&
			d.advice.performance.adviceList) {
			let adviceList = d.advice.performance.adviceList;
			filterAdvice(adviceList, data, performanceAdvices);
		}

		if (d.advice.bestpractice &&
			d.advice.bestpractice.adviceList) {
			let adviceList = d.advice.bestpractice.adviceList;
			filterAdvice(adviceList, data, bestPracticeAdvices);
		}

		if (d.advice.info) {
			filterObject(d.advice.info, data, infos);
		}
	}
};

function compositePdfData(data,
						  option,
						  type,
						  accAdvices,
						  performanceAdvices,
						  bestPracticeAdvices,
						  infos) {
	let avgScoreName = '平均分: ',
		avgValueName = '平均值: ',
		avgTimeName = '平均时间: ',
		docDefinition;
	switch (type){
		case 'total' :
			docDefinition = {
				content: [
					{
						text: data._id.url + ' 本周前端性能监控均值',
						style: 'header'
					},
					'\n开始时间:' + option.startDate + ' 结束时间: ' + option.endDate,
					{
						ol: [
							'总体' + avgScoreName + data.totalAvg.toFixed(2),
							'性能'  + avgScoreName + data.performanceAvg.toFixed(2),
							'可用性' + avgScoreName + data.accessibilityAvg.toFixed(2),
							'页面总请求大小' + avgValueName + (data.totalSizeAvg / 1024).toFixed(2) + "KB",
							'图片总请求大小' + avgValueName + (data.imageSizeAvg / 1024).toFixed(2) + "KB",
							'JS总请求大小' + avgValueName + (data.javaScriptSizeAvg / 1024).toFixed(2) + "KB",
							'CSS总请求大小' + avgValueName + (data.cssSizeAvg / 1024).toFixed(2) + "KB",
							'页面总请求数量' + avgValueName + data.totalRequestCountAvg.toFixed(2) + "个",
							'图片总请求数量' + avgValueName + data.imageRequestCountAvg .toFixed(2)+ "个",
							'JS总请求数量' + avgValueName + data.javaScriptRequestCountAvg.toFixed(2) + "个",
							'CSS总请求数量' + avgValueName + data.cssRequestCountAvg.toFixed(2) + "个",
							'请求成功的资源总' + avgValueName + data.request200Avg.toFixed(2) + "个",
							'首屏可视时间' +avgTimeName + data.rumSpeedIndexAvg.toFixed(2) + "ms",
							'首屏渲染' + avgTimeName + data.firstPaintAvg.toFixed(2) + "ms",
							'服务器响应' + avgTimeName + data.backendTimeAvg.toFixed(2) + "ms",
							'前端' + avgTimeName + data.frontEndTimeAvg.toFixed(2) + "ms"
						]
					}
				],
				defaultStyle: {
					font: 'msyh'
				}
			};
			break;
		case 'accessibility' :
			docDefinition = {
				content: [
					{
						text: data._id.url + ' 本周前端性能监控均值',
						style: 'header'
					},
					'\n开始时间:' + option.startDate + ' 结束时间: ' + option.endDate,
					{ text: '\n可用性建议', style: 'header' },
					{
						table: {
							body: accAdvices
						}
					}
				],
				defaultStyle: {
					font: 'msyh'
				}
			};
			break;
		case 'performance' :
			docDefinition = {
				content: [
					{
						text: data._id.url + ' 本周前端性能监控均值',
						style: 'header'
					},
					'\n开始时间:' + option.startDate + ' 结束时间: ' + option.endDate,
					{ text: '\n性能建议', style: 'header' },
					{
						style: 'tableExample',
						table: {
							body: performanceAdvices
						}
					}
				],
				defaultStyle: {
					font: 'msyh'
				}
			};
			break;
		case 'info' :
			docDefinition = {
				content: [
					{
						text: data._id.url + ' 本周前端性能监控均值',
						style: 'header'
					},
					'\n开始时间:' + option.startDate + ' 结束时间: ' + option.endDate,
					{ text: '\n页面信息', style: 'header' },
					{
						style: 'tableExample',
						table: {
							body: infos
						}
					}
				],
				defaultStyle: {
					font: 'msyh'
				}
			};
			break;
	}

	return docDefinition;
};

function generateZip(option){
	return new Promise(function(resolve, reject){
		var zip = new JSZip();
		var zipName = 'week_' +
				today + option.pdfName + '_pdf.zip';

		var weekpath = global.$g.config.pdfweekpath + option.pdfName + path.sep + today;
		var files = fs.readdirSync(weekpath);//需要用到同步读取
		files.forEach(walk);

		function walk(file) {
			if (!file.startsWith('.')) {
				logger.log(global.$g.config.pdfweekpath + option.pdfName + path.sep +
						today + path.sep + file);
				zip.file(file,
						fs.readFileSync(global.$g.config.pdfweekpath + option.pdfName + path.sep +
								today + path.sep + file));
			}
		}
		try {
			zipName = zipName.replace(/\//g,'-');
			let zipFilePath = global.$g.config.pdfweekpath + zipName;
			zip.generateNodeStream({type: 'nodebuffer', streamFiles: true})
					.pipe(fs.createWriteStream(zipFilePath))
					.on('finish', function () {
						var ret = {
							url: option.url,
							zipDir: option.pdfName,
							zipFile: zipName
						};
						resolve(ret);
						console.log("pdf.zip written.");
					});
		}catch(e){
			loggerError.error("生成weekPdf.zip出错:",e);
		}
	});
};

function removeDuplicates(adviceList) {
	try {
		var ret = adviceList.filter(function(cur){
			if (cur.length > 0) {
				var flag = false;
				var md5Key = crypto.createHash('md5').update(cur[0]);
				var MD5Key = md5Key.digest('hex');  //获取文件的MD5值
				var md5Value = crypto.createHash('md5').update(cur[1].toString());
				var MD5Value = md5Value.digest('hex');  //获取文件的MD5值
				if (cur){
					if (!rmap[MD5Key]) {
						rmap[MD5Key] = MD5Value;
						flag = true;
					}
					if (rmap[MD5Key] !== MD5Value) {
						rmap[MD5Key] = MD5Value;
						flag = true;
					}
					return flag;
				}else {
					return false;
				}
			} else{
				return false;
			}
		});
		return ret;
	}catch(e){
		console.log(e)
	}

};

function generatePdfFile(data,
					 option,
					 type,
					 newAccAdvices,
					 newPerformanceAdvices,
					 newBestPracticeAdvices,
					 newInfos) {
	return new Promise(async function(resolve, reject){
		let docData = compositePdfData(
				data,
				option,
				type,
				newAccAdvices,
				newPerformanceAdvices,
				newBestPracticeAdvices,
				newInfos);

		var pdfDoc = printer.createPdfKitDocument(docData);

		mkdirp.sync(global.$g.config.pdfweekpath + option.pdfName + path.sep + today);

		let wStream = fs.createWriteStream(global.$g.config.pdfweekpath +
				option.pdfName + path.sep + today + path.sep + 'week_'
				+ "_" + type + ".pdf");
		await pdfDoc.pipe(wStream);

		wStream.on('finish', function(){
			resolve(true);
		});
		await pdfDoc.end();
	});
};

function sortTime(a, b){
	if (a[2] > b[2]) {
		return 1;
	}else if (a[2] < b[2]) {
		return -1
	}else {
		return 0;
	}
};

function generatePdf(data, option) {
	return new Promise(function(resolve, reject){
		let adviceHead = ['名称','说明', '时间'],
				accAdvices = [],
				performanceAdvices = [],
				bestPracticeAdvices = [],
				info = [];

		data.item.forEach(function(itemData){
			createAdvice(
					itemData,
					accAdvices,
					performanceAdvices,
					bestPracticeAdvices,
					info);
		});
		let newAccAdvices = removeDuplicates(accAdvices.sort(sortTime));
		let newPerformanceAdvices = removeDuplicates(performanceAdvices.sort(sortTime));
		let newBestPracticeAdvices = removeDuplicates(bestPracticeAdvices.sort(sortTime));
		let newInfos = removeDuplicates(info.sort(sortTime));

		newAccAdvices.unshift(adviceHead);
		newPerformanceAdvices.unshift(adviceHead);
		newBestPracticeAdvices.unshift(adviceHead);
		newInfos.unshift(adviceHead);

		let pluginArray = ['total', 'accessibility','performance','info'];
		let pi = [];
		pluginArray.forEach(async function(type, index){
			pi.push(generatePdfFile(data,
					option,
					type,
					newAccAdvices,
					newPerformanceAdvices,
					newBestPracticeAdvices,
					newInfos));
		});
		Promise.all(pi).then(function(data){
			let v = data.every(ele=>ele === true);
			if (v) {
				generateZip(option).then(function(ret){
					resolve(ret);
				});
			}else {
				loggerError.error("生成pdf.zip文件失败");
			}
		});
	});
};

export default generatePdf;
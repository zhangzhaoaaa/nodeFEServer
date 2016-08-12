/**
 * Created by zhangmike on 16/8/8.
 */
var log4js = require('log4js');
var path = require('path');
let logPath = path.resolve(__dirname,"../logs/");
log4js.configure({
	"appenders": [
		{
			"type": "file",
			"filename": logPath + "/logs.log",
			"maxLogSize": 1024 * 1024 * 5,
			"backups": 10,
			"category": "logs"
		},
		{
			"type": "file",
			"filename": logPath + "/logerror.log",
			"maxLogSize": 1024 * 1024 * 5,
			"backups": 10,
			"category": "logserror"
		}
	]
});
var logger = log4js.getLogger('logs');
logger.setLevel("INFO");

var loggerError = log4js.getLogger('logserror');
loggerError.setLevel("ERROR");

export {logger, loggerError}
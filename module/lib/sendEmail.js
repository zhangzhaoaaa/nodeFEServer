/**
 * Created by zhangmike on 16/8/22.
 */
import email from "emailjs";
import path from 'path';
import {logger,loggerError} from '../../lib/log'
function sendEmail(option){
	return new Promise((resolve, reject) => {
		var server = email.server.connect({
			user: global.$g.config.emailName,
			password: global.$g.config.emailPassword,
			host: global.$g.config.emailHost/*,
			ssl: true*/
		});
		var pdfPaths = option.pdfPath;
		let sendArg = {
			text: "希望能够帮到您",
			from: global.$g.config.emailFrom,
			to: option.sendTo, //option.sendTo
			subject: "本周性能监控报告", //option.sendSubject
			attachment: [  //attachment
				{data: "<html>希望能够帮到您</html>", alternative: true}
			]
		};
		logger.info('pdfPath...', pdfPaths.size, option.sendTo);
		for (let item of pdfPaths){
			var attach = {};
			attach["path"] = global.$g.config.pdfweekpath + item.zipFile;
			attach["name"] = item.zipFile;
			sendArg.attachment.push(attach);
		}
		try {
			server.send(sendArg, function (err, message) {
				if (!err) {
					logger.log("发送报告成功!");
					resolve(true);
				}else {
					loggerError.error("发送报告出错!", err);
					reject(false);
				}
			});
		} catch (e) {
			loggerError.error("发送报告出错!", err);
			reject(false);
		}
	});
};

export default sendEmail;
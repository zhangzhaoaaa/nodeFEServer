/**
 * Created by zhangmike on 16/8/11.
 */

var email = require("emailjs");
var server = email.server.connect({
	user: "yourname",
	password: "yourpassword",
	host: "smtp.163.com",
	ssl: true
});
server.send({
	text: "i hope this works",
	from: "your@email",
	to: "your@email",
	subject: "testing emailjs",
	attachment: [
		{data: "<html>i <i>hope</i> this works!</html>", alternative: true},
		{path: "./attach.json", type: "application/json", name: "attach.json"}
	]
}, function (err, message) {
	console.log(err || message)
});

/**
 * Created by zhangmike on 16/8/11.
 */

var email = require("emailjs");
var server = email.server.connect({
	user: "femonitor",
	password: "T<n>@P.0}xG?5tEs",
	host: "mail.gomeplus.com",
	ssl: true
});
var sendTo =[
	/*"fuqiang@gomeplus.com",
	"luoye@gomeplus.com",
	"liangxiao@gomeplus.com",*/
	"zhangzhao@gomeplus.com"
];
server.send({
	text: "来自前端性能监控平台的问候",
	from: "femonitor@gomeplus.com",
	to: sendTo.join(","),
	subject: "美信前端性能监控平台欢迎您",
	attachment: [
		{data: "<html>目瞪口呆</html>", alternative: true},
		{path: "./attach.json", name: "attach.json"}
	]
}, function (err, message) {
	console.log(err || message)
});

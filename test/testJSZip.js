/**
 * Created by zhangmike on 16/8/23.
 */
var JSZip = require("jszip");
var fs = require('fs');
var zip = new JSZip();
/*fs.readdir(__dirname+"/pdfs", function(err, files){
	files.forEach(function(c){
		console.log(c)
		if (!c.startsWith('.')){
			console.log(__dirname+"/pdfs/"+c)
			zip.file(c,
					fs.readFileSync(__dirname+"/pdfs/"+c));
		}
	});
	zip
			.generateNodeStream({type:'nodebuffer',streamFiles:true})
			.pipe(fs.createWriteStream('out.zip'))
			.on('finish', function () {
				// JSZip generates a readable stream with a "end" event,
				// but is piped here in a writable stream which emits a "finish" event.
				console.log("out.zip written.");
			});
	//zip.folder("p").file("basics.pdf",fs.readFileSync(__dirname+"/pdfs/basics.pdf"));
});*/
var path = __dirname+"/pdfs";
var files = fs.readdirSync(path);//需要用到同步读取
var filesList = [];
files.forEach(walk);

function walk(file)
{
	var states = fs.statSync(path+'/'+file);
	if(states.isDirectory())
	{
		readFile(path+'/'+file,filesList);
	}
	else
	{
		//创建一个对象保存信息
		var obj = new Object();
		obj.size = states.size;//文件大小，以字节为单位
		obj.name = file;//文件名
		obj.path = path+'/'+file; //文件绝对路径
		filesList.push(obj);
	}
}

console.log(filesList)


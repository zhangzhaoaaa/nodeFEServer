/**
 * Created by zhangmike on 16/8/22.
 */

/*var JSZip = require('jszip');

var zip = new JSZip();

//zip.file("Hello.txt", "Hello World\n");
console.log(__dirname)
//zip.folder(__dirname + "/pdfs");
zip.folder(__dirname + "/util").generateAsync({type:"nodebuffer"})
	.then(function (content) {
		console.log(content)
		require("fs").writeFile(__dirname + "/hello.zip", content, function(err){/!*...*!/});
	});*/
/*
var zlib = require('zlib');
var gzip = zlib.createGzip();
var fs = require('fs');
var inp = fs.createReadStream('./pdfs');
var inp2 = fs.createReadStream('testInsert.js');
var out = fs.createWriteStream('input.txt.zip');

inp.pipe(gzip).pipe(out);*/

var fs = require('fs');

var archiver = require('archiver');

var output = fs.createWriteStream(__dirname + '/example-output.zip');
var archive = archiver('zip');

output.on('close', function() {
	console.log(archive.pointer() + ' total bytes');
	console.log('archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', function(err) {
	throw err;
});

archive.pipe(output);

/*var file1 = __dirname + '/pdfs/basics.pdf';
var file2 = __dirname + '/pdfs/tables.pdf';

archive
		.append(fs.createReadStream(file1), { name: 'basics.pdf' })
		.append(fs.createReadStream(file2), { name: 'tables.pdf' })
		.finalize();*/
archive.bulk([
	{ expand: true, cwd: 'pdfs/', src: ['*.pdf'] }
]);
/*archive.directory(__dirname+ "/pdfs/", __dirname +"a.zip", function(){
	console.log('ok');
});*/
archive.finalize();
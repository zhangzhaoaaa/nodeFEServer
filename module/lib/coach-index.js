
import  fs from 'fs';
import  path from 'path';
import errors   from '../error';
//read data from coach
let str = fs.readFileSync(path.join(__dirname, '../../node_modules/webcoach-zh/dist/coach.js'),'utf8');

// console.log(`${result}`);

let results=str.match(/return {[\r|\n|\s]+?id:[\s\S]+?title:[\s\S]+?tags:[\s\S]+?}/g);

//remove redundant words
results=results.map((x) => {
   return x.replace(/^return|advice\s*:.+?,\s*\r?\n|score\s*:.+?,\s*\r?\n|offending\s*:.+?,\s*\r?\n/g,'');

});

//results=`[ ${results.join(',')}]`;
try{
    results = eval(`([ ${results.join(',')}])`);
    results = errors.success({
            result  : results
        });
}
catch(err){
    results= errors.format(err);
}
 

module.exports= results;

//generate json file
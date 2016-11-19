import {run} from 'gome-sitespeed.io'
import {addTask} from './task'

import _ from 'lodash';
let EventEmitter = require('events').EventEmitter; 

const default_options={ 
	  version: false,
	  debug: false,
	  graphite:
	   { includeQueryParams: false,
	     port: 2003,
	     namespace: 'sitespeed_io' },
	  plugins: { list: false },
	  html: { showWaterfallSummary: false },
	  mobile: true,
	  utc: false,
	  help: false,
	  browsertime:
	   { browser: 'chrome',
	     screenshot: true,
	     iterations: 1,
	     connectivity: { profile: 'native', config: undefined, engine: 'tsproxy' },
	     viewPort: '1366x708',
	     delay: 0 },
	  browser: 'chrome',
	  n: 3,
	  connectivity: 'native',
	  webpagetest:
	   { host: 'www.webpagetest.org',
	     location: 'Dulles:Chrome',
	     connectivity: 'Cable',
	     runs: 3 },
	  slack: { userName: 'Sitespeed.io' },
	  outputFolder: 'sitespeed-result',
	  verbose: 0,
	  resultBaseDir:'../log/sitespeed-result/',
	  staticUrl:'./views/static/',
	  firstParty: undefined,
	  config: undefined,

}
const default_pluginNames=[ 
	  'analysisStorer',
	  'assets',
	  'browsertime',
	  'coach',
	  'domains',
	  'eventemitter',
	  'gome-screenshot'
	  ];
const emitter = new EventEmitter(); 

export async function runSitespeedTask({url,options,pluginNames}) {
	//TODO 正则匹配过滤url
	//console.log("start coming.....",pluginNames,options);
	let _reject;
    let res=new Promise((resolve,reject)=>{
    	_reject = reject;
      emitter.once(`${options.taskid}-speed`,(dataArray)=>{
        console.log(`${options.taskid} event data received`);
        resolve(dataArray);
     });

    })

	options=_.assign({
		emitter
	},
	  default_options,options);
	pluginNames=pluginNames||_.cloneDeep(default_pluginNames);

	if(options.store){
		options.mongo={
		  	dburl:global.$g.config.server_ip,
		  	coll:global.$g.config.server_coll
		  };
		pluginNames.push('mongo');
	}
	//if deviceType===0 or undefined
	if(options.deviceType){
		options.mobile = false;
	}

	options._=[url];
	let result;
	//在此步骤，将非标promise转化为标准Promise，从而可以用try catch 捕获
	run(pluginNames,options).catch((err) => {
		console.log('Printing gome-sitespeed.io error');
		console.log(err);
		_reject(err);
		//return Promise.reject(err)
	});

	try{
		result=await res;
	}
	catch(err){
		return Promise.reject(err)
	}
	options.pluginNames=pluginNames;
	return {options,result};
}

export async function addSitespeedTask(options){
	let taskid=options.taskid;
	let results;
	let _option={
		taskid,
		run:async ()=>{
			console.log(`Now running ${taskid}!`);
			try{
				results = await runSitespeedTask({url:options.url,options,pluginNames:options.pluginNames});
			}
			catch(err){
				console.log('error catched in task callback');
				return Promise.reject(err);
			}
			}
	}
	try{
		 await addTask(_option);
	}
	catch(err){
		console.log('error catched in addSitespeedTask');
		return Promise.reject(err);
	}
	
	return results;
}
// export {runSitespeedTask}


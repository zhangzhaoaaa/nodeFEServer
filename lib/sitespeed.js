import {run} from 'gome-sitespeed.io'
import _ from 'lodash'

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
	     iterations: 3,
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
	  firstParty: undefined,
	  config: undefined,

}
 const default_pluginNames=[ 
	  'analysisStorer',
	  'assets',
	  'browsertime',
	  'coach',
	  'domains',
	  'mongo',
	  'screenshot' ];

let runSitespeedTask=async ({url,options,pluginNames}) => {
	//TODO 正则匹配过滤url
	options=_.assign({
		mongo:{
	  	dburl:global.$g.config.server_ip,
	  	coll:global.$g.config.server_coll
	  }
	},
	  default_options,options);
	pluginNames=pluginNames||default_pluginNames;

	options._=[url];
	try{
		await run(pluginNames,options);
	}
	catch(err){
		console.log('Printing FEMonitor error');
		console.log(err);
	}
	options.pluginNames=pluginNames;
	return options;
}


export {runSitespeedTask}


import {run} from 'gome-sitespeed.io'
import {runSitespeedTask} from '../module/lib/sitespeed'
import test from 'ava';
require('../app');


test('demo', async (x) => {
	let url='https://m.gomeplus.com';
	let result=await runSitespeedTask({url});
    x.is(url,result._[0]);
});


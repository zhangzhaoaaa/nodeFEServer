
import test from 'ava';
require('../app');
import request from './util/request';
test('record', async (x) => {
	let result = await request({
        url: `http://localhost:8088/api/record/findByUrl`,
        params: { url: 'https://m.gomeplus.com'}
    });
    //console.log(result);
    x.is(1,1);
});

test('index', async (x) => {
	let result = await request({
        url: `http://localhost:8088/`,
        headers:{
        	'Content-Type' : 'text/html,application/xhtml+xml,application/xml'
        }
    });
    //console.log(result);
    x.is(1,1);
});
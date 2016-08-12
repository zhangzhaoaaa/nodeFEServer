/*
 * APP Entrance
 */

import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);

import VueAjax from 'vue-resource';
Vue.use(VueAjax);

//import env from 'env'; // set in webpack config of alias
//import httpConfig from './config/http.json';
Vue.http.options.root = "http://localhost:8088";

const router = new Router({
	saveScrollPosition: true,
	linkActiveClass: 'active'
});


import App from './component/app.vue';

import Login from './component/login/index.vue';

//import Dashboard from './component/dashboard/index.vue';


router.map({
	'/login': {
		name: 'Login',
		component: Login
	}/*,
	'/dashboard': {
		component: Dashboard
	}*/
});

//router.redirect({
//	'*': '/dashboard'
//});

router.start(App, '#app');

<template>
	<div class="wrap-box clearfix">
		<div class="password login">
			<input type="text" placeholder="用户名戳这里" v-model="account" @focus="resetErrMsg()">
			<input type="password" placeholder="接下来是密码" v-model="password" @focus="resetErrMsg()">
			<div class="error-box">
				<p class="error" v-show="erroMsg">{{erroMsg}}</p>
			</div>
			<div class="btn-password"><a href="javascript:void(0)" class="btn btn-big btn-block btn-blue" @click="login()">登  录</a></div>
		</div>
	</div>
</template>
<script>

import { alert,modal } from 'vue-strap'

export default {
	name: 'login',
	data() {
		return {
			account: '',
			password: '',
			erroMsg: ''
		};
	},
	methods: {
		login() {
			if (!this.checkInput()) {
				return;
			}
			this.erroMsg = '';
			this.$route.router.go('/dashboard');
		},
		checkInput() {
			if (this.account === '') {
				this.erroMsg = '用户名不能为空';
				return false;
			}
			if (this.password === '') {
				this.erroMsg = '密码不能为空';
				return false;
			}
			return true;
		},
		resetErrMsg() {
			this.erroMsg = '';
		}
	}
};
</script>
<template>
	<div>
		<router-view keep-alive></router-view>
	</div>
</template>
<script>

export default {
	name: 'App',
	ready() {
		this.$route.router.go('/login');
	}
};
</script>

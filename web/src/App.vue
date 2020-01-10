<template>
  <div id="app">
		<router-view/>
  </div>
</template>

<script>
	import jwt_decode from 'jwt-decode'
	import $ from 'jquery'
	
	export default{
		name: 'app',
		created(){
			if(localStorage.eleToken){
				var decoded = jwt_decode(localStorage.eleToken);
				this.$store.dispatch('setAuthenticated', !this.isEmpty(decoded));
				this.$store.dispatch('setUser', decoded);
			}
		},
		methods:{
			isEmpty(value){
				return (
					value === undefined ||
					value === null ||
					(typeof value === 'object' && Object.keys(value).length === 0) ||
					(typeof value === 'string' && value.trim().length === 0)
				)
			}
		},
		mounted(){
			$('#app').width($(window).width());
		}
	}
</script>

<style>
	html,body,#app{
		/* width: 100%; */
		height: 100%;
		background: url(./assets/background.jpg) no-repeat center center; 
		background-size: cover; 
		background-attachment: fixed;
		/* overflow-x: hidden; */
		overflow-y: auto;
	}
</style>

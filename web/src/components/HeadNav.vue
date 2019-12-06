<template>
	<header class="head-nav">
		<el-row>
			<el-col :span='18' class='logo-container'>
				<img src="../assets/logo.png" class="logo"/>
				<span class="title">浙江大学城市学院选课系统</span>
			</el-col>
			<el-col class='user'>
				<div class="welcome">
					<span class="name">欢迎&nbsp;<span class="avatarname">{{ user.name }}</span></span>
				</div>
				<span class="username" @click="logout">
					<i class="el-icon-switch-button el-icon--right"></i>
				</span>
			</el-col>
		</el-row>
	</header>
</template>

<script>
	export default{
		name: 'head-nav',
		computed: {
			user(){
				return this.$store.getters.user;
			}
		},
		methods: {
			logout(){
				localStorage.removeItem('eleToken');
				this.$store.dispatch('clearCurrentState');
				this.$router.push('/login');
			}
		}
	}
</script>

<style scoped>
	.head-nav{
		width: 100%;
		height: 40px;
		min-width: 600px;
		background: #fff;
		box-shadow: 0px 0px 20px #ccc;
	}
	.logo{
		width: 40px;
		height: 40px;
		margin-right: 10px;
		margin-left: 10px;
		vertical-align: middle;
		display: inline-block;
	}
	.title{
		line-height: 40px;
		font-size: 20px;
		font-weight: bolder;
		font-family: 'KaiTi';
		color: #01579b;
		vertical-align: middle;
		display: inline-block;
	}
	.user{
		width: auto;
		float: right;
	}
	.welcome{
		width: auto;
		display: inline-block;
		vertical-align: middle;
		padding: 0 5px;
	}
	.name{
		line-height: 40px;
		text-align: center;
		font-size: 16px;
	}
	.avatarname{
		color: #01579b;
		font-weight: bolder;
	}
	.username{
		display: inline-block;
		vertical-align: middle;
		cursor: pointer;
		margin-right: 5px;
	}
</style>
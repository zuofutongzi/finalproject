<template>
	<div class="login">
		<el-row>
			<el-col :md="{span:8,offset:8}" :sm="{span:10,offset:7}">
				<section>
					<div class="title"><span>浙大城院选课系统</span></div>
				</section>
				<div style="padding: 20px;">
					<el-form :model="loginUser" status-icon :rules="rules" ref="loginForm" label-width="80px" class="loginForm">
						<el-form-item label="用户名" prop="name">
				    		<el-input v-model="loginUser.name" placeholder="请输入用户名"></el-input>
					  	</el-form-item>
					  	<el-form-item label="密码" prop="password">
				    		<el-input type="password" v-model="loginUser.password" placeholder="请输入密码"></el-input>
					  	</el-form-item>
					  	<!--<el-row :gutter="10">
					  		<el-col :span="18">
					  			<el-form-item label="验证码" prop="identify" :inline="true">
					  				<el-input v-model="loginUser.identify" placeholder="请输入验证码"></el-input>
							  	</el-form-item>
					  		</el-col>
					  		<el-col :span="6">
					  			<div class="code" @click="refreshCode">
					    			<SIdentify :identifyCode="identifyCode" :contentWidth="contentWidth"></SIdentify>
						    	</div>
					  		</el-col>
					  	</el-row>-->
					  	<!--<el-form-item label="验证码" prop="identify" :inline="true">
			  				<el-input v-model="loginUser.identify" placeholder="请输入验证码"></el-input>
				  			<div class="code" @click="refreshCode">
				    			<SIdentify :identifyCode="identifyCode"></SIdentify>
					    	</div>
					  	</el-form-item>-->
					  	<el-form-item label="身份">
				    		<el-select v-model="loginUser.identity" placeholder="请选择身份">
				    			<el-option label="学生" value="student"></el-option>
				    			<el-option label="教师" value="teacher"></el-option>
				    			<el-option label="管理员" value="manager"></el-option>
				    		</el-select>
					  	</el-form-item>
					  	<el-form-item>
					    	<el-button type="primary" class="submit_btn" @click="submitForm('loginForm')">登陆</el-button>
					  	</el-form-item>
					  	
					</el-form>
				</div>
			</el-col>
		</el-row>
	</div>
</template>

<script>
	import SIdentify from '../components/identify.vue'
	import $ from 'jquery'
	
	export default{
		name: 'login',
		components: {
			SIdentify
		},
		data(){
			return{
				loginUser:{
					name: '',
					password: '',
					identity: 'student',
					identify: ''
				},
				identifyCode: '',
				contentWidth: 112,
				rules:{
					name:[
					{
						required: true,
						message: '用户名不能为空',
						trigger: 'blur'
					},
					{
						min: 2,
						max: 20,
						message: '长度在2-20个字符之间'
					}],
					password:[
					{
						required: true,
						message: '密码不能为空',
						trigger: 'blur'
					},
					{
						min: 6,
						max: 20,
						message: '长度在6-20个字符之间',
						trigger: 'blur'
					}],
					identify:[
					{
						required: true,
						message: '验证码不能为空'
					}]
				}
			}
		},
		methods:{
			randomNum(min,max){
				return Math.floor(Math.random()*(max-min)+min);
			},
			refreshCode(){
				this.contentWidth = $('.code').parent().width();
				var _this = this;
				setTimeout(function(){
					_this.identifyCode = '';
					_this.makeCode();
				},100);
			},
			makeCode(){
				this.$axios
					.get('/api/server-user/identify')
					.then(res => {
						var data = res.data;
						if(res.status == 200){
							this.identifyCode = data.code;
							//console.log(this.identifyCode)
						}
						else{
							this.$message({
								message: "账号或密码错误！",
								type: "error"
							});
						}
					})
			}
		},
		mounted(){
			this.contentWidth = $('.code').parent().width();
			var _this = this;
			setTimeout(function(){
				_this.identifyCode = '';
				_this.makeCode();
			},100);
            window.onresize = function(){ // 定义窗口大小变更通知事件
                _this.screenWidth = document.documentElement.clientWidth; //窗口宽度
                _this.screenHeight = document.documentElement.clientHeight; //窗口高度
            };
		}
	}
</script>

<style scoped>
	.login{
		position: relative;
		width: 100%;
		height: 100%;
		background: url(../assets/background.jpg) no-repeat center center;
		background-size: cover;
	}
	.title{
		text-align: center;
		padding-top: 20%;
		font-family: '微软雅黑';
		font-weight: bold;
		font-size: 26px;
		color: #fff;
	}
	.loginForm{
		margin-top: 20px;
		background-color: #fff;
		padding: 20px 40px 20px 20px;
		border-radius: 5px;
		box-shadow: 0px 0px 20px #ccc;
	}
	.code{
		float: right;
	}
	.submit_btn{
		width: 100%;
	}
	.el-select{
		width: 100%;
	}
</style>
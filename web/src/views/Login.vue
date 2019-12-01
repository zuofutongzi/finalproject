<template>
	<div class="login">
		<el-row>
			<el-col :lg="{span:8,offset:8}" :md="{span:10,offset:7}">
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
					  	<el-form-item label="身份">
				    		<el-select v-model="loginUser.identity" placeholder="请选择身份">
				    			<el-option label="学生" value="student"></el-option>
				    			<el-option label="教师" value="teacher"></el-option>
				    			<el-option label="管理员" value="manager"></el-option>
				    		</el-select>
					  	</el-form-item>
					  	<el-row :gutter="10">
					  		<el-col :span="18">
					  			<el-form-item label="验证码" prop="code" :inline="true">
					  				<el-input v-model="loginUser.code" placeholder="请输入验证码"></el-input>
							  	</el-form-item>
					  		</el-col>
					  		<el-col :span="6">
					  			<div class="code" @click="refreshCode"></div>
					  		</el-col>
					  	</el-row>
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
				contentWidth: 112,
				contentHeight: 40,
				rules:{
					name:[
					{
						required: true,
						message: '用户名不能为空',
						trigger: 'blur'
					},
					{
						min: 2,
						max: 12,
						message: '长度在2-12个字符之间'
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
			refreshCode(){
				this.contentWidth = $('.code').parent().width();
				this.makeCode(this.contentWidth,this.contentHeight);
			},
			makeCode(width,height){
				var options = {
					width: width,
					height: height
				}
				this.$axios
					.post('/api/identify', options)
					.then(res => {
						var data = res.data;
						if(res.status == 200){
							$('.code').empty();
							$('.code').append(data);
						}
						else{
							this.$message({
								message: res.msg,
								type: "error"
							});
						}
					})
			},
			submitForm(formName){
				this.$refs[formName].validate(valid => {
					if(valid){
						this.$message({
							message: "登陆成功！",
							type: "success"
						});
					}
					else{
						this.$message({
							message: "账号或密码填写格式错误！",
							type: "error"
						});
						return false;
					}
				})
			}
		},
		mounted(){
			this.contentWidth = $('.code').parent().width();
			this.makeCode(this.contentWidth,this.contentHeight);
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
		width: 100%;
		height: 100%;
	}
	.submit_btn{
		width: 100%;
	}
	.el-select{
		width: 100%;
	}
</style>
<template>
	<div class="login">
		<el-row>
			<el-col :lg="{span:8,offset:8}" :md="{span:10,offset:7}" :sm="{span:14,offset:5}">
				<section>
					<div class="title"><span>浙大城院选课系统</span></div>
				</section>
				<div style="padding: 20px;">
					<el-form :model="loginUser" status-icon :rules="rules" ref="loginForm" label-width="80px" class="loginForm">
						<el-form-item label="用户名" prop="userid">
				    		<el-input v-model="loginUser.userid" placeholder="请输入用户名"></el-input>
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
					  		<el-col :md="{span:16}" :sm="{span:16}" :xs="{span:16}">
					  			<el-form-item label="验证码" prop="identifyCode" :inline="true">
					  				<el-input v-model="loginUser.identifyCode" placeholder="请输入验证码"></el-input>
							  	</el-form-item>
					  		</el-col>
					  		<el-col :md="{span:8}" :sm="{span:8}" :xs="{span:8}">
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
import jwt_decode from 'jwt-decode'
import $ from 'jquery'

export default{
	name: 'login',
	data(){
		return{
			loginUser:{
				userid: '',
				password: '',
				identity: 'student',
				identifyCode: ''
			},
			contentWidth: 112,
			contentHeight: 40,
			rules:{
				userid:[
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
				identifyCode:[
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
			this.$axios
				.get('/api/identify?width='+width+'&height='+height)
				.then(res => {
					var data = res.data;
					if(res.status == 200){
						$('.code').empty();
						$('.code').append(data);
						this.loginUser.identifyCode = '';
					}
				})
		},
		submitForm(formName){
			this.$refs[formName].validate(valid => {
				if(valid){
					this.$axios
						.post('/api/user', this.loginUser)
						.then(res => {
							var data = res.data;
							if(res.status == 200){
								this.$message({
									message: "登陆成功！",
									type: "success"
								});
								
								var { token } = data;
								localStorage.setItem('eleToken', token);
								
								// 解析token
								var decoded = jwt_decode(token);
								this.$store.dispatch('setAuthenticated', !this.isEmpty(decoded));
								this.$store.dispatch('setUser', decoded);
								
								this.$router.push("/index");
							}
						})
				}
				else{
					this.$message({
						message: "填写格式错误！",
						type: "error"
					});
					return false;
				}
			})
		},
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
		this.contentWidth = $('.code').parent().width();
		this.makeCode(this.contentWidth,this.contentHeight);
	}
}
</script>

<style scoped>
	/*.login{
		position: relative;
		width: 100%;
		height: 100%;
		background: url(../assets/background.jpg) no-repeat center center;
		background-size: cover;
	}*/
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
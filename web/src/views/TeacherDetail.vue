<template>
    <div class="teacherDetail">
        <el-row class="user">
            <el-col :lg="{span:16,offset:4}" :md="{span:16,offset:4}">
                <el-form :model="userDetail" :rules="userRules" ref="userForm" label-position="left" label-width="80px" class="userDetailForm">
                    <el-divider content-position="left">个人信息</el-divider>
                    <el-form-item label="教师编号" prop="userid">
                        {{ userDetail.userid }}
                    </el-form-item>
                    <el-form-item label="姓名">
                        {{ userDetail.name }}
                    </el-form-item>
                    <el-form-item label="性别">
                        {{ userDetail.sex }}
                    </el-form-item>
                    <el-form-item label="身份证号">
                        {{ userDetail.IDcard }}
                    </el-form-item>
                    <el-form-item label="出生日期">
                        {{ userDetail.birthday }}
                    </el-form-item>
                    <el-form-item label="民族">
                        {{ userDetail.nation }}
                    </el-form-item>
                    <el-form-item label="政治面貌">
                        {{ userDetail.politicalStatus }}
                    </el-form-item>
                    <el-divider content-position="left">专业信息</el-divider>
                    <el-form-item label="学院">
                        {{ userDetail.college }}
                    </el-form-item>
                    <el-form-item label="教育背景">
                        {{ userDetail.eduBackground }}
                    </el-form-item>
                    <el-form-item label="职称">
                        {{ userDetail.professionalTitle }}
                    </el-form-item>
                    <el-form-item label="入职时间">
                        {{ userDetail.enrol }}
                    </el-form-item>
                    <el-form-item label="班主任">
                        {{ classTeacher }}
                    </el-form-item>
                    <el-form-item label="班级">
                        {{ myclass }}
                    </el-form-item>
                    <el-divider content-position="left">详细信息</el-divider>
                    <el-form-item label="个人荣誉" prop="personalHonor">
                        <el-input
                            type="textarea"
                            :autosize="{ minRows: 2 }"
                            placeholder="请输入内容"
                            v-model="userDetail.personalHonor">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="教学情况" prop="teachingSituation">
                        <el-input
                            type="textarea"
                            :autosize="{ minRows: 2 }"
                            placeholder="请输入内容"
                            v-model="userDetail.teachingSituation">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="科研情况" prop="scientificSituation">
                        <el-input
                            type="textarea"
                            :autosize="{ minRows: 2 }"
                            placeholder="请输入内容"
                            v-model="userDetail.scientificSituation">
                        </el-input>
                    </el-form-item>
                    <el-divider content-position="left">联系信息</el-divider>
                    <el-form-item label="电话" prop="phone">
                        <el-input v-model="userDetail.phone"></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="userDetail.email"></el-input>
                    </el-form-item>
                    <el-form-item label="qq" prop="qq">
                        <el-input v-model="userDetail.qq"></el-input>
                    </el-form-item>
                    <el-form-item label="家庭地址" prop="address">
                        <el-input v-model="userDetail.address"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" plain @click="dialogVisible = true">修改密码</el-button>
                        <el-button type="primary" @click="submitUser('userForm')">提交</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
        <el-dialog title="修改密码" :visible.sync="dialogVisible" :width="dialogWidth">
            <el-form :model="password" :rules="passwordRules" ref="passwordForm" label-position="left" class="userDetailForm">
                <el-form-item label="输入原密码" label-width="100px" prop="oldPassword">
                    <el-input type="password" v-model="password.oldPassword"></el-input>
                </el-form-item>
                <el-form-item label="输入新密码" label-width="100px" prop="newPassword">
                    <el-input type="password" v-model="password.newPassword"></el-input>
                </el-form-item>
                <el-form-item label="确认新密码" label-width="100px" prop="confirmPassword">
                    <el-input type="password" v-model="password.confirmPassword"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" class="passwordBtn" @click="submitPassword('passwordForm')">确定</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import $ from 'jquery'

export default {
    components: {},
    props: {},
    data() {
        var validateConfirmPass = (rule, value, callback) => {
            if(value !== this.password.newPassword){
                callback(new Error('两次输入密码不一致'));
            }
            else{
                callback();
            }
        }
        var validateNewPass = (rule, value, callback) => {
            if(value == this.password.oldPassword){
                callback(new Error('新密码不能和原密码一致'));
            }
            else{
                callback();
            }
        }
        return {
            user: {},
            dialogVisible: false,
            dialogWidth: '',
            classTeacher: '',
            myclass: '',
            userDetail: {},
            password: {
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            },
            userRules: {
                phone: [{
                    min: 11,
                    max: 11,
                    message: '请输入11位手机号码',
                    trigger: 'blur'
                }],
                email: [{
                    type: 'email',
                    message: '邮箱格式不正确',
                    trigger: 'blur'
                }],
                qq: [{
                    min: 5,
                    max: 12,
                    message: '长度在5-12个字符之间',
                    trigger: 'blur'
                }],
                address: [{
                    max: 30,
                    message: '长度小于30个字符',
                    trigger: 'blur'
                }]
            },
            passwordRules: {
                oldPassword: [{
                    required: true,
                    message: '原密码不能为空',
                    trigger: 'blur'
                }],
                newPassword: [
                {
                    required: true,
                    message: '新密码不能为空',
                    trigger: 'blur'
                },
                {
                    min: 5,
					max: 20,
					message: '长度在5-20个字符之间',
					trigger: 'blur'
                },
                {
                    validator: validateNewPass,
                    trigger: 'blur'
                }],
                confirmPassword: [
                {
                    required: true,
                    message: '确认密码不能为空',
                    trigger: 'blur'
                },
                {
                    min: 5,
					max: 20,
					message: '长度在5-20个字符之间',
					trigger: 'blur'
                },
                {
                    validator: validateConfirmPass,
                    trigger: 'blur'
                }]
            }
        };
    },
    watch: {},
    computed: {},
    methods: {
        submitUser(formName){
            this.$refs[formName].validate(valid => {
                if(valid){
                    this.userDetail.identity = this.user.identity;
                    this.$axios
                        .put('/api/user/' + this.user.userid, this.userDetail)
                        .then(res => {
                            if(res.status == 200){
                                var data = res.data;
                                this.$message({
									message: data.msg,
									type: "success"
                                });
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
        submitPassword(formName){
            this.$refs[formName].validate(valid => {
                if(valid){
                    var options = this.password;
                    options.identity = this.user.identity;
                    options.userid = this.user.userid;
                    this.$axios
                        .put('/api/user/' + this.user.userid + '/password', options)
                        .then(res => {
                            if(res.status == 200){
                                var data = res.data;
                                this.$message({
									message: data.msg,
									type: "success"
                                });
                                this.dialogVisible = false;
                                this.password.oldPassword = '';
                                this.password.newPassword = '';
                                this.password.confirmPassword = '';
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
        }
    },
    created() {},
    mounted() {
        this.user = this.$store.getters.user;
        this.$axios
            .get('/api/user/' + this.user.userid, {params: this.user})
            .then(res => {
                if(res.status == 200){
                    this.userDetail = res.data
                    if(this.userDetail.classTeacher == 'false'){
                        this.classTeacher = '否';
                        this.myclass = '无'
                    }
                    else{
                        this.classTeacher = '是';
                        this.myclass = this.userDetail.class;
                    }
                }
            })
        var width = $(window).width();
        if(width < 768){
            this.dialogWidth = '100%';
        }
        else if(width < 1200){
            this.dialogWidth = '50%';
        }
        else{
            this.dialogWidth = '30%';
        }
    }
};
</script>

<style scoped>
    .userDetailForm{
        padding-left: 10px;
        padding-right: 10px;
    }
    .el-divider__text{
        font-weight: bolder;
        left: 0 !important;
        padding-left: 0 !important;
    }
    .user .el-input{
        width: auto;
    }
    .passwordBtn{
        float: right;
    }
</style>
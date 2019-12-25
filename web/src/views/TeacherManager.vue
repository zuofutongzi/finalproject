<template>
    <div class="teacherManager">
        <el-row>
            <el-button type="primary" plain @click="teacherAdd()">教师添加</el-button>
            <el-button type="success" plain @click="teacherImport()">教师导入</el-button>
        </el-row>
        <el-table
            :data="userList"
            :row-class-name="tableRowClassName"
            @row-click="handleRowClick"
            style="width: 100%">
            <el-table-column
                label="姓名"
                prop="name">
            </el-table-column>
            <el-table-column
                label="性别"
                prop="sex"
                min-width="50">
            </el-table-column>
            <el-table-column
                label="学院"
                prop="college"
                min-width="100">
            </el-table-column>
            <el-table-column
                label="教育背景"
                prop="eduBackground">
            </el-table-column>
            <el-table-column
                label="职称"
                prop="professionalTitle">
            </el-table-column>
        </el-table>

        <!-- 教师添加 -->
        <el-dialog
			:visible.sync="addDialogVisible"
			title="教师添加"
            :fullscreen="addDialogFullScreen"
			center>
			<el-row class="teacherAdd">
				<el-col :md='{span: 16, offset: 4}'>
                    <el-form :model="userAdd" :rules="addRules" ref="addForm" label-position="left" label-width="80px" class="addForm">
                        <el-form-item label="教师账号" prop="userid">
                            <el-input v-model="userAdd.userid"></el-input>
                        </el-form-item>
                        <el-form-item label="密码" prop="password">
                            <el-input type="password" v-model="userAdd.password"></el-input>
                        </el-form-item>
                        <el-form-item label="姓名" prop="name">
                            <el-input v-model="userAdd.name"></el-input>
                        </el-form-item>
                        <el-form-item label="性别" prop="sex">
                            <el-radio v-model="userAdd.sex" label="男">男</el-radio>
                            <el-radio v-model="userAdd.sex" label="女">女</el-radio>
                        </el-form-item>
                        <el-form-item label="民族" prop="nation">
                            <el-input v-model="userAdd.nation"></el-input>
                        </el-form-item>
                        <el-form-item label="政治面貌" prop="politicalStatus">
                            <el-input v-model="userAdd.politicalStatus"></el-input>
                        </el-form-item>
                        <el-form-item label="身份证" prop="IDcard">
                            <el-input v-model="userAdd.IDcard"></el-input>
                        </el-form-item>
                        <el-form-item label="学院" prop="collegeid">
                            <el-select id="college" v-model="userAdd.collegeid" placeholder="请选择学院">
                                <el-option
                                    v-for="item in college"
                                    :key="item.collegeid"
                                    :label="item.name" 
                                    :value="item.collegeid">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="教育背景" prop="eduBackground">
                            <el-input v-model="userAdd.eduBackground"></el-input>
                        </el-form-item>
                        <el-form-item label="职称" prop="professionalTitle">
                            <el-input v-model="userAdd.professionalTitle"></el-input>
                        </el-form-item>
                        <el-form-item label="入职年份" prop="enrol">
                            <!-- <el-input v-model="userAdd.enrol"></el-input> -->
                            <el-date-picker
                                v-model="userAdd.enrol"
                                :editable="false"
                                value-format="yyyy"
                                type="year"
                                placeholder="选择年">
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item>
					    	<el-button type="primary" class="submit_btn" @click="submitAddForm('addForm')">添加</el-button>
					  	</el-form-item>
                    </el-form>
				</el-col>
			</el-row>
		</el-dialog>

        <!-- 教师导入dialog -->
        <el-dialog
			:visible.sync="importDialogVisible"
			:fullscreen="true"
			title="教师导入"
			center>
			<el-row class="teacherImport">
				<el-col :xs='{span: 24}' :sm='{span: 16, offset: 4}'>
                    <el-divider content-position="left"><span>* </span>导入格式</el-divider>
                    <el-image :src="require('../assets/teach/table.jpg')"></el-image><br>
                    <el-image :src="require('../assets/teach/teacher.jpg')"></el-image><br>
                    <div class="tag-group">
                        <span class="tag-group__title">学院选择如下：</span>
                        <el-tag
                            v-for="item in items"
                            :key="item.label"
                            :type="item.type">
                            {{ item.label }}
                        </el-tag>
                    </div>
                    <el-divider content-position="left">文件导入</el-divider>
					<el-upload
                        class="upload-demo"
                        ref="upload"
                        action="/api/user/import"
                        accept=".xls,.xlsx"
                        :headers="headers"
                        :data="uploadOption"
                        :on-error="handleError"
                        :on-success="handleSuccess"
                        :limit="1"
                        :auto-upload="false">
                        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                        <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
                        <div slot="tip" class="el-upload__tip">只接收.xls/.xlsx文件，上传文件不超过1mb</div>
                    </el-upload>
				</el-col>
			</el-row>
		</el-dialog>

        <!-- 教师信息dialog -->
        <el-dialog
			:visible.sync="detailDialogVisible"
            :fullscreen="true"
			title="教师信息"
			center>
			<el-row class="teacherImport">
				<el-col :xs='{span: 24}' :sm='{span: 16, offset: 4}'>
                    <el-collapse v-model="collapse" accordion>
                        <el-collapse-item title="个人信息" name="1">
                            <el-form :model="userDetail" label-position="left" label-width="100px" class="userDetailForm">
                                <el-form-item label="教师编号">
                                    {{ userDetail.userid }}
                                </el-form-item>
                                <el-form-item label="姓名">
                                    {{ userDetail.name }}
                                </el-form-item>
                                <el-form-item label="性别">
                                    {{ userDetail.sex }}
                                </el-form-item>
                                <el-form-item label="民族">
                                    {{ userDetail.nation }}
                                </el-form-item>
                                <el-form-item label="政治面貌">
                                    {{ userDetail.politicalStatus }}
                                </el-form-item>
                            </el-form>
                        </el-collapse-item>
                        <el-collapse-item title="专业信息" name="2">
                            <el-form :model="userDetail" label-position="left" label-width="100px" class="userDetailForm">
                                <el-form-item label="学院">
                                    {{ userDetail.college }}
                                </el-form-item>
                                <el-form-item label="学历">
                                    {{ userDetail.eduBackground }}
                                </el-form-item>
                                <el-form-item label="职称">
                                    {{ userDetail.professionalTitle }}
                                </el-form-item>
                                <el-form-item label="入职时间">
                                    {{ userDetail.enrol }}
                                </el-form-item>
                                <el-form-item label="班主任">
                                    {{ userDetail.classTeacher }}
                                </el-form-item>
                                <el-form-item label="班级">
                                    {{ userDetail.class }}
                                </el-form-item>
                            </el-form>
                        </el-collapse-item>
                        <el-collapse-item title="详细信息" name="3">
                            <el-form :model="userDetail" label-position="left" label-width="100px" class="userDetailForm">
                                <el-form-item label="个人荣誉">
                                    {{ userDetail.personalHonor }}
                                </el-form-item>
                                <el-form-item label="教学情况">
                                    {{ userDetail.teachingSituation }}
                                </el-form-item>
                                <el-form-item label="科研情况">
                                    {{ userDetail.scientificSituation }}
                                </el-form-item>
                            </el-form>
                        </el-collapse-item>
                        <el-collapse-item title="联系方式" name="4">
                            <el-form :model="userDetail" label-position="left" label-width="100px" class="userDetailForm">
                                <el-form-item label="电话">
                                    {{ userDetail.phone }}
                                </el-form-item>
                                <el-form-item label="邮箱">
                                    {{ userDetail.email }}
                                </el-form-item>
                                <el-form-item label="qq">
                                    {{ userDetail.qq }}
                                </el-form-item>
                                <el-form-item label="家庭地址">
                                    {{ userDetail.address }}
                                </el-form-item>
                            </el-form>
                        </el-collapse-item>
                    </el-collapse>
				</el-col>
			</el-row>
		</el-dialog>
    </div>
</template>

<script>
import $ from 'jquery'

export default {
    components: {},
    props: {},
    data() {
        var validateIDcard = (rule, value, callback) => {
            var reg = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
            if(reg.test(value)){
                callback();
            }
            else{
                callback(new Error('请填写18位有效身份证'));
            }
        }
        return {
            headers: {
                Authorization: localStorage.eleToken
            },
            items: [
                { type: '', label: '计算机与计算科学学院' },
                { type: 'success', label: '信息与电气工程学院' },
                { type: 'info', label: '工程学院' },
                { type: 'danger', label: '医学院' },
                { type: 'warning', label: '外国语学院' },
                { type: '', label: '商学院' },
                { type: 'success', label: '传媒与人文学院' },
                { type: 'info', label: '法学院' },
                { type: 'danger', label: '创意与艺术设计学院' },
                { type: 'warning', label: '新西兰UW学院' }
            ],
            college: [],
            user: {},
            userList: [],
            userDetail: {},
            userAdd: {
                sex: '男'
            },
            uploadOption:{
                identity: 'teacher'
            },
            importDialogVisible: false,
            detailDialogVisible: false,
            addDialogVisible: false,
            addDialogFullScreen: false,
            collapse: '1',
            loading: null,
            addRules: {
                userid: [
                    {
                        required: true,
                        message: '用户名不能为空',
                        trigger: 'blur'
                    },
                    {
                        min: 2,
                        max: 12,
                        message: '长度在2-12个字符之间'
                    }
                ],
                password: [
                    {
                        required: true,
                        message: '密码不能为空',
                        trigger: 'blur'
                    },
                    {
                        min: 5,
                        max: 20,
                        message: '长度在5-20个字符之间',
                        trigger: 'blur'
                    }
                ],
                name: [
                    {
                        required: true,
                        message: '姓名不能为空',
                        trigger: 'blur'
                    },
                    {
                        max: 10,
                        message: '长度不超过10个字符',
                        trigger: 'blur'
                    }
                ],
                sex: [{
                    required: true,
                    message: '性别必选',
                    trigger: 'blur'
                }],
                nation: [
                    {
                        required: true,
                        message: '民族不能为空',
                        trigger: 'blur'
                    },
                    {
                        max: 10,
                        message: '长度不超过10个字符',
                        trigger: 'blur'
                    }
                ],
                politicalStatus: [
                    {
                        required: true,
                        message: '政治面貌不能为空',
                        trigger: 'blur'
                    },
                    {
                        max: 10,
                        message: '长度不超过10个字符',
                        trigger: 'blur'
                    }
                ],
                IDcard: [
                    {
                        required: true,
                        message: '身份证不能为空',
                        trigger: 'blur'
                    },
                    {
                        validator: validateIDcard,
                        trigger: 'blur'
                    }
                ],
                collegeid: [{
                    required: true,
                    message: '学院不能为空',
                    trigger: 'blur'
                }],
                eduBackground: [{
                    required: true,
                    message: '教育背景不能为空',
                    trigger: 'blur'
                }],
                professionalTitle: [{
                    required: true,
                    message: '职称不能为空',
                    trigger: 'blur'
                }],
                enrol: [{
                    required: true,
                    message: '入职年份不能为空',
                    trigger: 'blur'
                }]
            },
        };
    },
    watch: {},
    computed: {},
    methods: {
        tableRowClassName({row, rowIndex}) {
            if (rowIndex % 2 === 0) {
                return 'success-row';
            }
            return '';
        },
        teacherAdd(){
            // 教师添加dialog弹出
            this.addDialogVisible = true;
        },
        teacherImport(){
            // 教师导入dialog弹出
            this.importDialogVisible = true;
        },
        submitAddForm(formName){
			this.$refs[formName].validate(valid => {
				if(valid){
                    this.userAdd.identity = 'teacher';
                    this.$axios
                        .post('/api/user', this.userAdd)
                        .then(res => {
                            if(res.status == 200){
                                var data = res.data;
                                this.$message({
                                    message: data.msg,
                                    type: "success"
                                });

                                this.college.forEach(item => {
                                    if(item.collegeid == this.userAdd.collegeid){
                                        this.userAdd.college = item.name;
                                        this.userList.push(this.userAdd);
                                    }
                                })
                                
                                this.addDialogVisible = false;
                                this.userAdd = {
                                    userid: '',
                                    password: '',
                                    name: '',
                                    sex: '男',
                                    nation: '',
                                    politicalStatus: '',
                                    IDcard: '',
                                    collegeid: '',
                                    eduBackground: '',
                                    professionalTitle: '',
                                    enrol: ''
                                }
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
        submitUpload() {
            this.$refs.upload.submit();
            this.loading = this.$loading({
                lock: true,
                text: "数据较大，请耐性等待",
                background: 'rgba(0,0,0,0.7)'
            });
        },
        handleError(err, file, fileList){
            // 文件上传失败
            this.loading.close();
            this.$message({
                message: err.message,
                type: "error"
            });
        },
        handleSuccess(response, file, fileList){
            // 文件上传成功
            this.loading.close();
            this.importDialogVisible = false;
            this.$refs.upload.clearFiles();
            this.$message({
                message: response.msg,
                type: "success"
            });
            var options = {
                identity: 'teacher',
                filter: {
                    isPage: false
                }
            }
            // 后端采用redis+mysql，canal监听binlog，数据同步需要时间，所以这里停顿1秒后再读取数据，否则，数据任然未空
            var _this = this;
            setTimeout(function(){
                _this.$axios
                    .get('/api/user', {params: options})
                    .then(res => {
                        if(res.status == 200){
                            _this.userList = res.data;
                        }
                    })
            },1000);
        },
        handleRowClick(row){
			// 教师详情dialog弹出
            this.detailDialogVisible = true;
            this.userDetail = row;
            if(this.userDetail.classTeacher == 'false'){
                this.userDetail.classTeacher = '否';
                this.userDetail.class = '无'
            }
            else{
                this.userDetail.classTeacher = '是';
            }
		}
    },
    created() {},
    mounted() {
        this.user = this.$store.getters.user;
        var options = {
            identity: 'teacher',
            filter: {
                isPage: false
            }
        }
        this.$axios
            .get('/api/user', {params: options})
            .then(res => {
                if(res.status == 200){
                    this.userList = res.data;
                }
            })
        this.$axios
            .get('/api/school/college')
            .then(res => {
                if(res.status == 200){
                    this.college = res.data;
                }
            })
        var width = $(window).width();
        if(width < 768){
            this.addDialogFullScreen = true;
        }
    }
};
</script>

<style>
    .teacherManager .el-divider__text{
        font-weight: bolder;
        left: 0 !important;
        padding-left: 0 !important;
    }
    .teacherManager .el-divider__text span{
        color: red;
    }
    .teacherManager .el-table .success-row {
        background: #f0f9eb;
    }
    .teacherManager .tag-group{
        margin-top: 15px;
    }
    .teacherManager .tag-group__title{
        margin-right: 10px;
    }
    .teacherManager .el-tag{
        margin-right: 10px;
        margin-bottom: 10px;
    }
    .teacherManager .el-select{
        width: 100%;
    }
    .teacherManager .el-date-editor.el-input, .el-date-editor.el-input__inner{
        width: 100%;
    }
    .teacherManager .submit_btn{
		width: 100%;
	}
</style>
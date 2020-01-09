<template>
    <div class="studentManager">
        <el-row class="studentTop">
            <el-button type="primary" :size="buttonSize" plain @click="studentAdd()">学生添加</el-button>
            <el-button type="success" :size="buttonSize" plain @click="studentImport()">学生导入</el-button>
            <el-button type="danger" :size="buttonSize" plain @click="studentDelete()">学生删除</el-button>
            <el-cascader class="hidden-xs-only" :props="{ checkStrictly: true }" v-model="filterCollege" :options="majorList" @change="handleSelectChange" :show-all-levels="false" clearable placeholder="根据分院专业班级筛选"></el-cascader>
        </el-row>
        <el-row class="studentXsTop">
            <el-cascader class="hidden-sm-and-up" :props="{ checkStrictly: true }" v-model="filterCollege" :options="majorList" @change="handleSelectChange" :show-all-levels="false" clearable placeholder="根据分院专业班级筛选"></el-cascader>
        </el-row>
        <el-table
            :data="userList"
            :row-class-name="tableRowClassName"
            ref="multipleTable"
            @selection-change="handleSelectionChange"
            @row-click="handleRowClick"
            :row-key="getRowKeys"
            style="width: 100%">
            <el-table-column
                type="selection"
                width="55"
                :reserve-selection="true">
            </el-table-column>
            <el-table-column
                label="姓名"
                prop="name"
                min-width="70">
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
                label="专业"
                prop="major"
                min-width="100">
            </el-table-column>
            <el-table-column
                label="班级"
                prop="class"
                min-width="100">
            </el-table-column>
        </el-table>
        <el-pagination
            layout="prev, pager, next"
            @current-change="handleCurrentChange"
            :small="pageSmall"
            :hide-on-single-page="true"
            :current-page.sync="currentPage"
            :page-size="listPageSize"
            :total="listTotal">
        </el-pagination>

        <!-- 学生添加 -->
        <el-dialog
			:visible.sync="addDialogVisible"
			title="学生添加"
            :fullscreen="addDialogFullScreen"
			center>
			<el-row class="studentAdd">
				<el-col :md='{span: 16, offset: 4}'>
                    <el-form :model="userAdd" :rules="addRules" ref="addForm" label-position="left" label-width="80px" class="addForm">
                        <el-form-item label="学生账号" prop="userid">
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
                        <el-form-item label="班级" prop="classid">
                            <el-cascader v-model="userAdd.classid" :options="majorList" @change="studentAddMajorChange" :show-all-levels="false"></el-cascader>
                        </el-form-item>
                        <el-form-item>
					    	<el-button type="primary" class="submit_btn" @click="submitAddForm('addForm')">添加</el-button>
					  	</el-form-item>
                    </el-form>
				</el-col>
			</el-row>
		</el-dialog>

        <!-- 学生导入 -->
        <el-dialog
			:visible.sync="importDialogVisible"
			:fullscreen="true"
			title="学生导入"
			center>
			<el-row class="studentImport">
				<el-col :xs='{span: 24}' :sm='{span: 16, offset: 4}'>
                    <el-divider content-position="left"><span>* </span>导入格式</el-divider>
                    <el-image :src="require('../assets/teach/table.jpg')"></el-image><br>
                    <el-image :src="require('../assets/teach/student.jpg')"></el-image><br>
                    <p style="color: red;">学生账号必须由英文或数字组成</p>
                    <el-divider content-position="left">文件导入</el-divider>
					<el-upload
                        class="upload-demo"
                        ref="upload"
                        action="/api/user/import"
                        accept=".xls,.xlsx"
                        :headers="headers"
                        :data="uploadOption"
                        :on-error="handleError"
                        :on-change="handleChange"
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

        <!-- 学生信息 -->
        <el-dialog
			:visible.sync="detailDialogVisible"
            :fullscreen="true"
			title="学生信息"
			center>
			<el-row class="studentDetail">
				<el-col :xs='{span: 24}' :sm='{span: 16, offset: 4}'>
                    <el-collapse v-model="collapse" accordion>
                        <el-collapse-item name="1">
                            <template slot="title">
                                <div class="marker blue"></div>个人信息
                            </template>
                            <el-form :model="userDetail" label-position="left" label-width="100px" class="userDetailForm">
                                <el-form-item label="学生编号">
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
                        <el-collapse-item name="2">
                            <template slot="title">
                                <div class="marker green"></div>专业信息
                            </template>
                            <el-form :model="userDetail" label-position="left" label-width="100px" class="userDetailForm">
                                <el-form-item label="学院">
                                    {{ userDetail.college }}
                                </el-form-item>
                                <el-form-item label="专业">
                                    {{ userDetail.major }}
                                </el-form-item>
                                <el-form-item label="入学年份">
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
                        <el-collapse-item name="3">
                            <template slot="title">
                                <div class="marker red"></div>联系方式
                            </template>
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
        var validateUserid = (rule, value, callback) => {
            var reg = new RegExp("^[a-zA-Z0-9]+$"); 
            if(reg.test(value)){
                callback();
            }
            else{
                callback(new Error('请填写由英文或数字组成的账号'))
            }
        }
        return {
            headers: {
                Authorization: localStorage.eleToken
            },
            uploadOption:{
                identity: 'student'
            },
            getRowKeys(row){
                return row.userid
            },
            user: {},
            userList: [],
            userDetail: [],
            majorList: [],
            classList: [],
            multipleSelection: [],
            userAdd: {
                sex: '男'
            },
            currentPage: 1,
            listTotal: 0,
            listPageSize: 20,
            collapse: '1',
            buttonSize: 'medium',
            file: '',
            filterCollege: [],
            pageSmall: false,
            addDialogVisible: false,
            addDialogFullScreen: false,
            importDialogVisible: false,
            detailDialogVisible: false,
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
                    },
                    {
                        validator: validateUserid,
                        trigger: 'blur'
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
                classid: [{
                    required: true,
                    message: '班级不能为空',
                    trigger: 'blur'
                }]
            }
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
        handleCurrentChange(val) {
            // 分页切换
            this.currentPage = val;
            var options = {
                identity: 'student',
                filter: {
                    isFirst: false,
                    isPage: true,
                    page: val,
                    size: this.listPageSize,
                    college: this.filterCollege
                }
            }
            this.$axios
                .get('/api/user', {params: options})
                .then(res => {
                    if(res.status == 200){
                        this.userList = res.data.data;
                    }
                })
        },
        handleSelectChange(){
            // 筛选切换
             var options = {
                identity: 'student',
                filter: {
                    isFirst: true,
                    isPage: true,
                    page: 1,
                    size: this.listPageSize,
                    college: this.filterCollege
                }
            }
            this.$axios
                .get('/api/user', {params: options})
                .then(res => {
                    if(res.status == 200){
                        this.userList = res.data.data;
                        this.listTotal = res.data.count;
                        this.currentPage = 1;
                    }
                })
                .catch(err => {
                    this.userList.splice(0, this.userList.length);
                    this.listTotal = 0;
                    this.currentPage = 1;
                })
        },
        handleSelectionChange(val){
            // 表格选择
            this.multipleSelection = val;
        },
        handleRowClick(row){
            // 学生详情dialog弹出
            this.detailDialogVisible = true;
            this.userDetail = row;
		},
        studentAdd(){
            // 学生添加
            this.addDialogVisible = true;
        },
        studentAddMajorChange(value){
            // 学生添加
            // 专业切换获取班级列表
            var options = {
                filter: {
                    isFirst: false,
                    isPage: false,
                    college: value
                }
            }
            this.$axios
                .get('/api/school/class', {headers: {'showLoading': false}, params: options})
                .then(res => {
                    if(res.status == 200){
                        var data = res.data.data;
                        data.forEach(item => {
                            this.classList.push({
                                value: item.classid,
                                label: item.name
                            })
                        })
                    }
                })
        },
        submitAddForm(formName){
            // 学生添加
			this.$refs[formName].validate(valid => {
				if(valid){
                    this.userAdd.identity = 'student';
                    this.userAdd.classid = this.userAdd.classid[2];
                    this.$axios
                        .post('/api/user', this.userAdd)
                        .then(res => {
                            if(res.status == 200){
                                var data = res.data;
                                this.$message({
                                    message: data.msg,
                                    type: "success"
                                });

                                this.addDialogVisible = false;
                                this.userAdd = {
                                    userid: '',
                                    password: '',
                                    name: '',
                                    sex: '男',
                                    nation: '',
                                    politicalStatus: '',
                                    IDcard: '',
                                    classid: []
                                }

                                var options = {
                                    identity: 'student',
                                    filter: {
                                        isFirst: true,
                                        isPage: true,
                                        page: 1,
                                        size: this.listPageSize,
                                        college: this.filterCollege
                                    }
                                }
                                var _this = this;
                                setTimeout(() => {
                                    _this.$axios
                                        .get('/api/user', {params: options})
                                        .then(res => {
                                            if(res.status == 200){
                                                _this.userList = res.data.data;
                                                _this.listTotal = res.data.count;
                                                _this.currentPage = 1;
                                            }
                                        })
                                },1000)
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
        studentImport(){
            // 学生导入
            this.importDialogVisible = true;
        },
        submitUpload() {
            // 教师导入
            if(this.isEmpty(this.file)){
                this.$message({
                    message: '文件不能为空',
                    type: "error"
                });
            }
            else{
                this.$refs.upload.submit();
                this.loading = this.$loading({
                    lock: true,
                    text: "数据较大，请耐性等待",
                    background: 'rgba(0,0,0,0.7)'
                });
            }
        },
        handleChange(file,fileList){
			// 文件添加
            if(!this.isEmpty(file) && file.status == 'ready'){
				this.file = file.name;
            }
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
            this.file = '';
            this.$refs.upload.clearFiles();
            this.$message({
                message: response.msg,
                type: "success"
            });
            this.filterCollege = [];
            var options = {
                identity: 'student',
                filter: {
                    isFirst: true,
                    isPage: true,
                    page: 1,
                    size: this.listPageSize
                }
            }
            // 后端采用redis+mysql，canal监听binlog，数据同步需要时间，所以这里停顿1秒后再读取数据，否则，数据任然未空
            var _this = this;
            setTimeout(function(){
                _this.$axios
                    .get('/api/user', {params: options})
                    .then(res => {
                        if(res.status == 200){
                            _this.userList = res.data.data;
                            _this.listTotal = res.data.count;
                            _this.currentPage = 1;
                        }
                    })
            },1000);
        },
        studentDelete(){
            // 学生删除
            var userid = [];
            this.multipleSelection.forEach(item => {
                userid.push(item.userid);
            })
            if(this.isEmpty(userid)){
				this.$message({
					message: "选项不能为空",
					type: "error"
				});
            }
            else{
                var options = {
                    userid: userid,
                    identity: 'student'
                }
                this.$axios
                    .delete('/api/user', {data: options})
                    .then(res => {
                        if(res.status == 200){
                            var data = res.data;
                            this.$message({
                                message: data.msg,
                                type: "success"
                            });
                            
                            var options = {
                                identity: 'student',
                                filter: {
                                    isFirst: true,
                                    isPage: true,
                                    page: 1,
                                    size: this.listPageSize,
                                    college: this.filterCollege
                                }
                            }
                            var _this = this;
                            setTimeout(function(){
                                _this.$axios
                                    .get('/api/user', {params: options})
                                    .then(res => {
                                        if(res.status == 200){
                                            _this.userList = res.data.data;
                                            _this.listTotal = res.data.count;
                                            _this.currentPage = 1;
                                        }
                                    })
                                    .catch(err => {
                                        _this.userList.splice(0, _this.userList.length);
                                        _this.listTotal = 0;
                                        _this.currentPage = 1;
                                    })
                            },1000);

                            this.$refs.multipleTable.clearSelection();
                        }
                    })
            }
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
    created() {},
    mounted() {
        this.user = this.$store.getters.user;
        var options = {
            identity: 'student',
            filter: {
                isFirst: true,
                isPage: true,
                page: 1,
                size: this.listPageSize
            }
        }
        this.$axios
            .get('/api/user', {params: options})
            .then(res => {
                if(res.status == 200){
                    this.userList = res.data.data;
                    this.listTotal = res.data.count;
                    this.currentPage = 1;
                }
            })
        this.$axios
            .get('/api/school/college')
            .then(res => {
                if(res.status == 200){
                    var data = res.data;
                    var temp = [];
                    data.forEach(item => {
                        if(parseInt(item.collegeid) <= 10){
                            var index = this.majorList.push({
                                value: item.collegeid,
                                label: item.name,
                                children: []
                            })
                            temp[item.collegeid] = index - 1;
                        }
                    })
                    this.$axios
                        .get('/api/school/major')
                        .then(res => {
                            if(res.status == 200){
                                var major = res.data;
                                major.forEach(item => {
                                    var child = {
                                        value: item.majorid,
                                        label: item.name
                                    }
                                    this.majorList[temp[item.collegeid]].children.push(child);
                                })

                                var options = {
                                    filter: {
                                        isFirst: false,
                                        isPage: false
                                    }
                                }
                                this.$axios
                                    .get('/api/school/class', {params: options})
                                    .then(res => {
                                        if(res.status == 200){
                                            var myclass = res.data.data;
                                            myclass.forEach(item => {
                                                this.majorList = this.majorList.map(value => {
                                                    value.children = value.children.map(childvalue => {
                                                        if(!childvalue['children']){
                                                            childvalue.children = [];
                                                        }
                                                        if(childvalue.value == item.majorid){
                                                            var child = {
                                                                value: item.classid,
                                                                label: item.name
                                                            }
                                                            childvalue.children.push(child)
                                                        }
                                                        return childvalue
                                                    })
                                                    return value
                                                })
                                            })
                                        }
                                    })
                            }
                        })
                }
            })

        var width = $(window).width();
        if(width < 768){
            this.addDialogFullScreen = true;
            this.pageSmall = true;
            var buttonParentWidth = $('.studentTop .el-button').parent().width() - 20;
            var buttonWith = buttonParentWidth/3;
            $('.studentTop .el-button').eq(0).css({'margin-left':'0','width':buttonWith.toString(),'padding':'12px 10px'});
            $('.studentTop .el-button').eq(1).css({'margin-left':'10px','width':buttonWith.toString(),'padding':'12px 10px'});
            $('.studentTop .el-button').eq(2).css({'margin-left':'10px','width':buttonWith.toString(),'padding':'12px 10px'});
            var buttonTextWidth = $('.studentTop .el-button span').width();
            if(buttonWith-20 < buttonTextWidth){
                this.buttonSize = 'mini';
            }
        }
    }
};
</script>

<style>
    .studentManager .el-divider__text{
        font-weight: bolder;
        left: 0 !important;
        padding-left: 0 !important;
    }
    .studentManager .el-divider__text span{
        color: red;
    }
    .studentManager .el-table .success-row {
        background: #f0f9eb;
    }
    .studentManager .tag-group{
        margin-top: 15px;
    }
    .studentManager .tag-group__title{
        margin-right: 10px;
    }
    .studentManager .el-tag{
        margin-right: 10px;
        margin-bottom: 10px;
    }
    .studentManager .studentAdd .el-select{
        width: 100%;
    }
    .studentManager .studentAdd .el-cascader{
        width: 100%;
    }
    .studentManager .el-date-editor.el-input, .el-date-editor.el-input__inner{
        width: 100%;
    }
    .studentManager .submit_btn{
		width: 100%;
	}
    .studentManager .studentTop .el-cascader{
        margin-left: 10px;
    }
    .studentManager .studentXsTop .el-cascader{
        margin-top: 10px;
        width: 100%;
    }
    .studentManager .studentDetail .marker {      
        width: 10px;      
        height: 10px;    
        border-radius: 100px;
        opacity: 0.5;
        margin: 0 10px;
    }
    .studentManager .studentDetail .blue{
        background-color: #409EFF;
    }
    .studentManager .studentDetail .green{
        background-color: #67C23A;
    }
    .studentManager .studentDetail .yellow{
        background-color: #E6A23C;
    }
    .studentManager .studentDetail .red{
        background-color: #F56C6C;
    }
    .studentManager .studentDetail .el-input{
        width: auto;
    }
    .studentManager .studentDetail .el-button{
        padding: 0 10px;
    }
</style>
<template>
    <div class="teacherManager">
        <el-row class="teacherTop">
            <el-button type="primary" :size="buttonSize" plain @click="teacherAdd()">教师添加</el-button>
            <el-button type="success" :size="buttonSize" plain @click="teacherImport()">教师导入</el-button>
            <el-button type="danger" :size="buttonSize" plain @click="teacherDelete()">教师删除</el-button>
            <el-select class="hidden-xs-only" v-model="filterCollege" @change="handleSelectChange" clearable placeholder="根据分院筛选">
                <el-option
                    v-for="item in college"
                    :key="item.collegeid"
                    :label="item.name"
                    :value="item.collegeid">
                </el-option>
            </el-select>
        </el-row>
        <el-row class="teacherXsTop">
            <el-select class="hidden-sm-and-up" v-model="filterCollege" @change="handleSelectChange" clearable placeholder="根据分院筛选">
                <el-option
                    v-for="item in college"
                    :key="item.collegeid"
                    :label="item.name"
                    :value="item.collegeid">
                </el-option>
            </el-select>
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
        <el-pagination
            layout="prev, pager, next"
            @current-change="handleCurrentChange"
            :small="pageSmall"
            :hide-on-single-page="true"
            :current-page.sync="currentPage"
            :page-size="listPageSize"
            :total="listTotal">
        </el-pagination>

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
                    <p style="color: red;">教师账号必须由英文或数字组成</p>
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

        <!-- 教师信息dialog -->
        <el-dialog
			:visible.sync="detailDialogVisible"
            :fullscreen="true"
			title="教师信息"
			center>
			<el-row class="teacherDetail">
				<el-col :xs='{span: 24}' :sm='{span: 16, offset: 4}'>
                    <el-collapse v-model="collapse" accordion>
                        <el-collapse-item name="1">
                            <template slot="title">
                                <div class="marker blue"></div>个人信息
                            </template>
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
                        <el-collapse-item name="2">
                            <template slot="title">
                                <div class="marker green"></div>专业信息
                            </template>
                            <el-form :model="userDetail" label-position="left" label-width="100px" class="userDetailForm">
                                <el-form-item label="学院">
                                    {{ userDetail.college }}
                                </el-form-item>
                                <el-form-item label="学历">
                                    <span v-show="eduBackgroundShow">
                                        {{ userDetail.eduBackground }} 
                                    </span>
                                    <el-input v-show="!eduBackgroundShow" v-model="eduBackground"></el-input>
                                    <el-button type="text" @click="handleEdit('edu')">
                                        <i :class="{'el-icon-edit': eduBackgroundShow, 'el-icon-check': !eduBackgroundShow}"></i>
                                    </el-button>
                                </el-form-item>
                                <el-form-item label="职称">
                                    <span v-show="professionalTitleShow">
                                        {{ userDetail.professionalTitle }} 
                                    </span>
                                    <el-input v-show="!professionalTitleShow" v-model="professionalTitle"></el-input>
                                    <el-button type="text" @click="handleEdit('title')">
                                        <i :class="{'el-icon-edit': professionalTitleShow, 'el-icon-check': !professionalTitleShow}"></i>
                                    </el-button>
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
                        <el-collapse-item name="3">
                            <template slot="title">
                                <div class="marker yellow"></div>详细信息
                            </template>
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
                        <el-collapse-item name="4">
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
            items: [],
            college: [],
            filterCollege: '',
            user: {},
            userList: [],
            multipleSelection: [],
            currentPage: 1,
            listTotal: 0,
            listPageSize: 20,
            professionalTitle: '',
            eduBackground: '',
            file: '',
            userDetail: {},
            userDetailOptions: {},
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
            pageSmall: false,
            eduBackgroundShow: true,
            professionalTitleShow: true,
            collapse: '1',
            buttonSize: 'medium',
            loading: null,
            getRowKeys(row){
                return row.userid
            },
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
        handleCurrentChange(val) {
            // 分页切换
            this.currentPage = val;
            var options = {
                identity: 'teacher',
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
        handleSelectionChange(val){
            // 表格选择
            this.multipleSelection = val;
        },
        handleSelectChange(){
            // 分院筛选切换
            var options = {
                identity: 'teacher',
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
        handleEdit(button){
            this.userDetailOptions.identity = 'teacher';
            switch(button){
                case 'edu':
                    if(!this.eduBackgroundShow){
                        this.userDetailOptions.eduBackground = this.eduBackground;
                        this.$axios
                            .put('/api/user/' + this.userDetailOptions.userid, this.userDetailOptions)
                            .then(res => {
                                if(res.status == 200){
                                    var data = res.data;
                                    this.$message({
                                        message: data.msg,
                                        type: "success"
                                    });
                                    this.userDetail.eduBackground = this.eduBackground;
                                    this.eduBackgroundShow = !this.eduBackgroundShow;
                                }
                            })
                    }
                    else{
                        this.eduBackgroundShow = !this.eduBackgroundShow;
                    }
                    break;
                case 'title':
                    if(!this.professionalTitleShow){
                        this.userDetailOptions.professionalTitle = this.professionalTitle;
                        this.$axios
                            .put('/api/user/' + this.userDetailOptions.userid, this.userDetailOptions)
                            .then(res => {
                                if(res.status == 200){
                                    var data = res.data;
                                    this.$message({
                                        message: data.msg,
                                        type: "success"
                                    });
                                    this.userDetail.professionalTitle = this.professionalTitle;
                                    this.professionalTitleShow = !this.professionalTitleShow;
                                }
                            })
                    }
                    else{
                        this.professionalTitleShow = !this.professionalTitleShow;
                    }
                    break; 
            }
        },
        teacherAdd(){
            // 教师添加dialog弹出
            this.addDialogVisible = true;
        },
        teacherImport(){
            // 教师导入dialog弹出
            this.importDialogVisible = true;
        },
        teacherDelete(){
            // 教师删除
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
            var options = {
                userid: userid,
                identity: 'teacher'
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
                            identity: 'teacher',
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
        },
        handleRowClick(row){
			// 教师详情dialog弹出
            this.detailDialogVisible = true;
            this.userDetail = row;
            this.userDetailOptions = JSON.parse(JSON.stringify(row));
            if(this.userDetail.classTeacher == 'false'){
                this.userDetail.classTeacher = '否';
                this.userDetail.class = '无'
            }
            else{
                this.userDetail.classTeacher = '是';
            }
            this.professionalTitle = this.userDetail.professionalTitle;
            this.eduBackground = this.userDetail.eduBackground;
		},
        submitAddForm(formName){
            // 教师添加
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
            this.filterCollege = '';
            var options = {
                identity: 'teacher',
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
            identity: 'teacher',
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
                    this.college = res.data;
                    var type = ['', 'success', 'info', 'danger', 'warning'];
                    this.college.forEach((item, index) => {
                        this.items.push({
                            type: type[index%5],
                            label: item.name
                        })
                    })
                }
            })
        var width = $(window).width();
        if(width < 768){
            this.addDialogFullScreen = true;
            this.pageSmall = true;
            var buttonParentWidth = $('.teacherTop .el-button').parent().width() - 20;
            var buttonWith = buttonParentWidth/3;
            $('.teacherTop .el-button').eq(0).css({'margin-left':'0','width':buttonWith.toString(),'padding':'12px 10px'});
            $('.teacherTop .el-button').eq(1).css({'margin-left':'10px','width':buttonWith.toString(),'padding':'12px 10px'});
            $('.teacherTop .el-button').eq(2).css({'margin-left':'10px','width':buttonWith.toString(),'padding':'12px 10px'});
            var buttonTextWidth = $('.teacherTop .el-button span').width();
            if(buttonWith-20 < buttonTextWidth){
                this.buttonSize = 'mini';
            }
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
    .teacherManager .teacherAdd .el-select{
        width: 100%;
    }
    .teacherManager .el-date-editor.el-input, .el-date-editor.el-input__inner{
        width: 100%;
    }
    .teacherManager .submit_btn{
		width: 100%;
	}
    .teacherManager .teacherTop .el-select{
        margin-left: 10px;
    }
    .teacherManager .teacherXsTop .el-select{
        margin-top: 10px;
        width: 100%;
    }
    .teacherManager .teacherDetail .marker {      
        width: 10px;      
        height: 10px;    
        border-radius: 100px;
        opacity: 0.5;
        margin: 0 10px;
    }
    .teacherManager .teacherDetail .blue{
        background-color: #409EFF;
    }
    .teacherManager .teacherDetail .green{
        background-color: #67C23A;
    }
    .teacherManager .teacherDetail .yellow{
        background-color: #E6A23C;
    }
    .teacherManager .teacherDetail .red{
        background-color: #F56C6C;
    }
    .teacherManager .teacherDetail .el-input{
        width: auto;
    }
    .teacherManager .teacherDetail .el-button{
        padding: 0 10px;
    }
</style>
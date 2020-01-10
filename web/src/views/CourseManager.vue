<template>
    <div class="courseManager">
        <el-row class="courseTop">
            <el-button type="primary" :size="buttonSize" plain @click="courseAdd()">课程添加</el-button>
            <el-button type="success" :size="buttonSize" plain @click="courseImport()">课程导入</el-button>
            <el-button type="danger" :size="buttonSize" plain @click="courseDelete()">课程删除</el-button>
            <el-select class="hidden-xs-only" v-model="filterCollege" @change="handleSelectChange" clearable placeholder="根据分院筛选">
                <el-option
                    v-for="item in college"
                    :key="item.collegeid"
                    :label="item.name"
                    :value="item.collegeid">
                </el-option>
            </el-select>
        </el-row>
        <el-row class="courseXsTop">
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
            :data="courseList"
            :row-class-name="tableRowClassName"
            :row-key="getRowKeys"
            @selection-change="handleSelectionChange"
            ref="multipleTable"
            style="width: 100%">
            <el-table-column
                type="selection"
                width="55"
                :reserve-selection="true">
            </el-table-column>
            <el-table-column
                label="课程号"
                prop="courseid"
                min-width="100">
            </el-table-column>
            <el-table-column
                label="课程名"
                prop="name"
                min-width="140">
            </el-table-column>
            <el-table-column
                label="开设分院"
                prop="college"
                min-width="120">
            </el-table-column>
            <el-table-column
                label="学分"
                prop="credit"
                min-width="70">
            </el-table-column>
            <el-table-column
                label="学时"
                prop="classHour"
                min-width="90">
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

        <!-- 课程添加 -->
        <el-dialog
			:visible.sync="addDialogVisible"
			title="课程添加"
            :fullscreen="addDialogFullScreen"
			center>
			<el-row class="courseAddForm">
				<el-col :md='{span: 16, offset: 4}'>
                    <el-form :model="courseAddForm" :rules="addRules" ref="addForm" label-position="left" label-width="80px" class="addForm">
                        <el-form-item label="开设分院" prop="collegeid">
                            <el-select v-model="courseAddForm.collegeid" placeholder="根据分院筛选">
                                <el-option
                                    v-for="item in college"
                                    :key="item.collegeid"
                                    :label="item.name"
                                    :value="item.collegeid">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="课程号" prop="courseid">
                            <el-input v-model="courseAddForm.courseid"></el-input>
                        </el-form-item>
                        <el-form-item label="课程名" prop="name">
                            <el-input v-model="courseAddForm.name"></el-input>
                        </el-form-item>
                        <el-form-item label="学分" prop="credit">
                            <el-input v-model="courseAddForm.credit"></el-input>
                        </el-form-item>
                        <el-form-item label="学时" prop="classHour">
                            <el-input v-model="courseAddForm.classHour"></el-input>
                        </el-form-item>
                        <el-form-item>
					    	<el-button type="primary" class="submit_btn" @click="submitAddForm('addForm')">添加</el-button>
					  	</el-form-item>
                    </el-form>
				</el-col>
			</el-row>
		</el-dialog>

        <!-- 课程导入 -->
        <el-dialog
			:visible.sync="importDialogVisible"
			:fullscreen="true"
			title="班级导入"
			center>
			<el-row class="courseImport">
				<el-col :xs='{span: 24}' :sm='{span: 16, offset: 4}'>
                    <el-divider content-position="left"><span>* </span>导入格式</el-divider>
                    <el-image :src="require('../assets/teach/table.jpg')"></el-image><br>
                    <el-image :src="require('../assets/teach/course.jpg')"></el-image><br>
                    <div class="tag-group">
                        <span class="tag-group__title">学院选择如下：</span>
                        <el-tag
                            v-for="item in items"
                            :key="item.label"
                            :type="item.type">
                            {{ item.label }}
                        </el-tag>
                    </div>
                    <p style="color: red;">班级编号必须由英文或数字组成</p>
                    <el-divider content-position="left">文件导入</el-divider>
					<el-upload
                        class="upload-demo"
                        ref="upload"
                        action="/api/course/import"
                        accept=".xls,.xlsx"
                        :headers="headers"
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
    </div>
</template>

<script>
import $ from 'jquery'

export default {
    components: {},
    props: {},
    data() {
        var validateCourseid = (rule, value, callback) => {
            var reg = new RegExp("^[a-zA-Z0-9]+$"); 
            if(reg.test(value)){
                callback();
            }
            else{
                callback(new Error('请填写由英文或数字组成的课程号'))
            }
        }
        var validateCredit = (rule, value, callback) => {
            var reg = /^\d+(\.\d+)?$/;
            if(reg.test(value)){
                callback();
            }
            else{
                callback(new Error('请填写数字'))
            }
        }
        return {
            headers: {
                Authorization: localStorage.eleToken
            },
            user: {},
            courseAddForm: {},
            courseList: [],
            college: [],
            items: [],
            multipleSelection: [],
            filterCollege: '',
            currentPage: 1,
            listTotal: 0,
            listPageSize: 20,
            file: '',
            buttonSize: 'medium',
            loading: null,
            pageSmall: false,
            addDialogVisible: false,
            addDialogFullScreen: false,
            importDialogVisible: false,
            getRowKeys(row){
                return row.courseid
            },
            addRules: {
                collegeid: [
                    {
                        required: true,
                        message: '开设分院不能为空',
                        trigger: 'blur'
                    }
                ],
                courseid: [
                    {
                        required: true,
                        message: '课程号不能为空',
                        trigger: 'blur'
                    },
                    {
                        max: 12,
                        message: '长度不超过12个字符',
                        trigger: 'blur'
                    },
                    {
                        validator: validateCourseid,
                        trigger: 'blur'
                    }
                ],
                name: [
                    {
                        required: true,
                        message: '课程名不能为空',
                        trigger: 'blur'
                    },
                    {
                        max: 20,
                        message: '长度不超过20个字符',
                        trigger: 'blur'
                    }
                ],
                credit: [
                    {
                        required: true,
                        message: '学分不能为空',
                        trigger: 'blur'
                    },
                    {
                        validator: validateCredit,
                        trigger: 'blur'
                    }
                ],
                classHour: [
                    {
                        required: true,
                        message: '课时不能为空',
                        trigger: 'blur'
                    },
                    {
                        max: 15,
                        message: '长度不超过15个字符',
                        trigger: 'blur'
                    }
                ]
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
                filter: {
                    isFirst: false,
                    isPage: true,
                    page: val,
                    size: this.listPageSize,
                    college: this.filterCollege
                }
            }
            this.$axios
                .get('/api/course', {params: options})
                .then(res => {
                    if(res.status == 200){
                        this.courseList = res.data.data;
                    }
                })
        },
        handleSelectChange(){
            // 分院筛选切换
            var options = {
                filter: {
                    isFirst: true,
                    isPage: true,
                    page: 1,
                    size: this.listPageSize,
                    college: this.filterCollege
                }
            }
            this.$axios
                .get('/api/course', {params: options})
                .then(res => {
                    if(res.status == 200){
                        this.courseList = res.data.data;
                        this.listTotal = res.data.count;
                        this.currentPage = 1;
                    }
                })
                .catch(err => {
                    this.courseList.splice(0, this.courseList.length);
                    this.listTotal = 0;
                    this.currentPage = 1;
                })
        },
        handleSelectionChange(val){
            // 表格选择
            this.multipleSelection = val;
        },
        courseAdd(){
            // 课程添加
            this.addDialogVisible = true;
        },
        submitAddForm(formName){
            // 课程添加
			this.$refs[formName].validate(valid => {
				if(valid){
                    this.$axios
                        .post('/api/course', this.courseAddForm)
                        .then(res => {
                            if(res.status == 200){
                                var data = res.data;
                                this.$message({
                                    message: data.msg,
                                    type: "success"
                                });

                                this.addDialogVisible = false;
                                this.courseAddForm = {
                                    courseid: '',
                                    name: '',
                                    credit: '',
                                    classHour: ''
                                }

                                var options = {
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
                                        .get('/api/course', {params: options})
                                        .then(res => {
                                            if(res.status == 200){
                                                var data = res.data;
                                                _this.courseList = data.data;
                                                _this.listTotal = data.count;
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
        courseImport(){
            // 课程导入
            this.importDialogVisible = true;
        },
        submitUpload() {
            // 课程导入
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
            this.$refs.upload.clearFiles();
            this.$message({
                message: response.msg,
                type: "success"
            });
            
            var options = {
                filter: {
                    isFirst: true,
                    isPage: true,
                    page: 1,
                    size: this.listPageSize
                }
            }
            var _this = this;
            setTimeout(() => {
                _this.$axios
                    .get('/api/course', {params: options})
                    .then(res => {
                        if(res.status == 200){
                            var data = res.data;
                            _this.courseList = data.data;
                            _this.listTotal = data.count;
                            _this.filterCollege = '';
                        }
                    })
            },1000)
        },
        courseDelete(){
            // 课程删除
            var course = [];
            this.multipleSelection.forEach(item => {
                course.push(item.courseid);
            })
            if(this.isEmpty(course)){
				this.$message({
					message: "选项不能为空",
					type: "error"
				});
            }
            else{
                var options = {
                    course: course
                }
                this.$axios
                    .delete('/api/course', {data: options})
                    .then(res => {
                        if(res.status == 200){
                            var data = res.data;
                            this.$message({
                                message: data.msg,
                                type: "success"
                            });
                            
                            var options = {
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
                                    .get('/api/course', {params: options})
                                    .then(res => {
                                        if(res.status == 200){
                                            _this.courseList = res.data.data;
                                            _this.listTotal = res.data.count;
                                            _this.currentPage = 1;
                                        }
                                    })
                                    .catch(err => {
                                        _this.courseList.splice(0, _this.courseList.length);
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
            filter: {
                isFirst: true,
                isPage: true,
                page: 1,
                size: this.listPageSize
            }
        }
        this.$axios
            .get('/api/course', {params: options})
            .then(res => {
                if(res.status == 200){
                    var data = res.data;
                    this.courseList = data.data;
                    this.listTotal = data.count;
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
            var buttonParentWidth = $('.courseTop .el-button').parent().width() - 20;
            var buttonWith = buttonParentWidth/3;
            $('.courseTop .el-button').eq(0).css({'margin-left':'0','width':buttonWith.toString(),'padding':'12px 10px'});
            $('.courseTop .el-button').eq(1).css({'margin-left':'10px','width':buttonWith.toString(),'padding':'12px 10px'});
            $('.courseTop .el-button').eq(2).css({'margin-left':'10px','width':buttonWith.toString(),'padding':'12px 10px'});
            var buttonTextWidth = $('.courseTop .el-button span').width();
            if(buttonWith-20 < buttonTextWidth){
                this.buttonSize = 'mini';
            }
        }
    }
};
</script>

<style>
    .courseManager .el-divider__text{
        font-weight: bolder;
        left: 0 !important;
        padding-left: 0 !important;
    }
    .courseManager .el-divider__text span{
        color: red;
    }
    .courseManager .el-table .success-row {
        background: #f0f9eb;
    }
    .courseManager .tag-group{
        margin-top: 15px;
    }
    .courseManager .tag-group__title{
        margin-right: 10px;
    }
    .courseManager .el-tag{
        margin-right: 10px;
        margin-bottom: 10px;
    }
    .courseManager .courseAddForm .el-select{
        width: 100%;
    }
    .courseManager .el-date-editor.el-input, .el-date-editor.el-input__inner{
        width: 100%;
    }
    .courseManager .submit_btn{
		width: 100%;
	}
    .courseManager .courseTop .el-select{
        margin-left: 10px;
    }
    .courseManager .courseXsTop .el-select{
        margin-top: 10px;
        width: 100%;
    }
    .courseManager .courseDetail .marker {      
        width: 10px;      
        height: 10px;    
        border-radius: 100px;
        opacity: 0.5;
        margin: 0 10px;
    }
    .courseManager .courseDetail .blue{
        background-color: #409EFF;
    }
    .courseManager .courseDetail .green{
        background-color: #67C23A;
    }
    .courseManager .courseDetail .yellow{
        background-color: #E6A23C;
    }
    .courseManager .courseDetail .red{
        background-color: #F56C6C;
    }
    .courseManager .courseDetail .el-input{
        width: auto;
    }
    .courseManager .courseDetail .el-button{
        padding: 0 10px;
    }
</style>
<template>
    <div class="classSelectManager">
        <el-row class="classSelectTop">
            <el-button type="primary" :size="buttonSize" plain @click="classAdd()">开课添加</el-button>
            <el-button type="success" :size="buttonSize" plain @click="classImport()">开课导入</el-button>
            <el-button type="danger" :size="buttonSize" plain @click="classDelete()">开课删除</el-button>
            <el-button type="primary" :size="buttonSize" plain @click="selectSet()">选课设置</el-button>
            <el-button type="success" :size="buttonSize" plain @click="drawLots()">课程抽签</el-button>
            <el-card shadow="always" style="margin-top: 10px;">
                最近没有选课
            </el-card>
        </el-row>

        <!-- 开课添加 -->
        <el-dialog
			:visible.sync="addDialogVisible"
			title="开课添加"
            :fullscreen="addDialogFullScreen"
            :before-close="handleCloseAddDialog"
			center>
			<el-row class="classSelectAddForm">
				<el-col :md='{span: 16, offset: 4}'>
                    <el-form :model="classSelectAddForm" :rules="addRules" ref="addForm" label-position="left" label-width="80px" class="addForm">
                        <el-form-item label="课程" prop="course">
                            <el-cascader v-model="classSelectAddForm.course" :options="courseList" @change="classSelectCourseChange" :show-all-levels="false" filterable></el-cascader>
                        </el-form-item>
                        <el-form-item label="教师" prop="teacher">
                            <el-select v-model="classSelectAddForm.teacher" filterable placeholder='请先选择课程'>
                                <el-option
                                    v-for="item in teacherList"
                                    :key="item.userid"
                                    :label="item.name"
                                    :value="item.userid">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="开课学年" prop="schoolYear">
                            <el-select v-model="classSelectAddForm.schoolYear" filterable>
                                <el-option
                                    v-for="item in schoolYearSelect"
                                    :key="item"
                                    :label="item"
                                    :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="开课学期" prop="schoolTerm">
                            <el-select v-model="classSelectAddForm.schoolTerm" filterable>
                                <el-option
                                    v-for="item in 2"
                                    :key="item"
                                    :label="item"
                                    :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="课程容量" prop="capacityLimit">
                            <el-input v-model="classSelectAddForm.capacityLimit" placeholder="请填写数字"></el-input>
                        </el-form-item>
                        <div style="margin-bottom: 22px;">
                            <course-table
                                ref="courseTable"
                                :topbar="courseTableTopBar" 
                                :selectChangeColor="true" 
                                v-model="courseTableSelect">
                            </course-table>
                        </div>
                        <el-form-item>
					    	<el-button type="primary" class="submit_btn" @click="submitAddForm('addForm')">添加</el-button>
					  	</el-form-item>
                    </el-form>
				</el-col>
			</el-row>
		</el-dialog>

        <!-- 开课导入 -->
        <el-dialog
			:visible.sync="importDialogVisible"
			:fullscreen="true"
			title="开课导入"
			center>
			<el-row class="classImport">
				<el-col :xs='{span: 24}' :sm='{span: 16, offset: 4}'>
                    <el-divider content-position="left"><span>* </span>导入格式</el-divider>
                    <el-image :src="require('../assets/teach/table.jpg')"></el-image><br>
                    <el-image :src="require('../assets/teach/classCourse.jpg')"></el-image><br>
                    <p style="color: red">时间设置如下：[星期]-[第x节]，多个课时用分号隔开（例：Mon-1;Mon-2;Fri-6;Fri-7;）</p>
                    <div class="tag-group">
                        <span class="tag-group__title">星期选择如下：</span>
                        <el-tag
                            v-for="item in weekday"
                            :key="item.label"
                            :type="item.type">
                            {{ item.label }}
                        </el-tag>
                    </div>
                    <p>学年：2020-2010</p>
                    <p>学期：1</p>
                    
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
import Timetables from 'timetables'
import CourseTable from '../components/CourseTable'

export default {
    components: {
        CourseTable
    },
    props: {},
    data() {
        var validateCapacity = (rule, value, callback) => {
            var reg = new RegExp("^[0-9]+$"); 
            if(reg.test(value)){
                callback();
            }
            else{
                callback(new Error('请填写数字'))
            }
        }
        return {
            user: {},
            headers: {
                Authorization: localStorage.eleToken
            },
            classSelectAddForm: {
                session: []
            },
            courseTableSelect: [],
            courseList: [],
            teacherList: [],
            schoolYearSelect: [],
            weekday: [],
            courseTableTopBar: ['一', '二', '三', '四', '五'],
            buttonSize: 'medium',
            file: '',
            loading: null,
            addDialogFullScreen: false,
            addDialogVisible: false,
            importDialogVisible: false,
            addRules: {
                course: [
                    {
                        required: true,
                        message: '课程不能为空',
                        trigger: 'blur'
                    }
                ],
                teacher: [
                    {
                        required: true,
                        message: '教师不能为空',
                        trigger: 'blur'
                    }
                ],
                schoolYear: [
                    {
                        required: true,
                        message: '开课学年不能为空',
                        trigger: 'blur'
                    }
                ],
                schoolTerm: [
                    {
                        required: true,
                        message: '开课学年不能为空',
                        trigger: 'blur'
                    }
                ],
                capacityLimit: [
                    {
                        required: true,
                        message: '课程容量不能为空',
                        trigger: 'blur'
                    },
                    {
                        validator: validateCapacity,
                        trigger: 'blur'
                    }
                ]
            }
        };
    },
    watch: {},
    computed: {},
    methods: {
        classAdd(){
            // 开课添加
            this.addDialogVisible = true;
        },
        handleCloseAddDialog(done){
            // 开课添加dialog关闭前
            var nowYear = (new Date()).getFullYear();
            this.classSelectAddForm = {
                course: '',
                teacher: '',
                schoolYear: nowYear.toString() + '-' + (nowYear + 1).toString(),
                schoolTerm: '',
                capacityLimit: ''
            }
            this.$refs.courseTable.cleanSelect();
            done();
        },
        classSelectCourseChange(value){
            // 开课添加
            // 课程选择变化
            var collegeid = value[0];
            var options = {
                identity: 'teacher',
                filter: {
                    isFirst: false,
                    isPage: false,
                    college: collegeid
                }
            }
            this.$axios
                .get('/api/user', {headers: {'showLoading': false}, params: options})
                .then(res => {
                    if(res.status == 200){
                        this.teacherList = res.data.data;
                    }
                })
        },
        submitAddForm(formName){
            // 开课添加
			this.$refs[formName].validate(valid => {
                var session = [];
                this.courseTableSelect.forEach(item => {
                    session.push(item.coordinate);
                })
                if(this.isEmpty(session)){
                    this.$message({
						message: "请选择上课时间！",
						type: "error"
					});
                }
				else if(valid){
                    var options = {
                        courseid: this.classSelectAddForm.course[1],
                        teacherid: this.classSelectAddForm.teacher,
                        schoolYear: this.classSelectAddForm.schoolYear,
                        schoolTerm: this.classSelectAddForm.schoolTerm,
                        capacityLimit: this.classSelectAddForm.capacityLimit,
                        session: session
                    }
                    this.$axios
                        .post('/api/class', options)
                        .then(res => {
                            if(res.status == 200){
                                var data = res.data;
                                this.$message({
                                    message: data.msg,
                                    type: "success"
                                });

                                var nowYear = (new Date()).getFullYear();
                                this.classSelectAddForm = {
                                    course: '',
                                    teacher: '',
                                    schoolYear: nowYear.toString() + '-' + (nowYear + 1).toString(),
                                    schoolTerm: '',
                                    capacityLimit: ''
                                }
                                this.$refs.courseTable.cleanSelect();

                                this.addDialogVisible = false;
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
        classImport(){
            // 开课导入
            this.importDialogVisible = true;
        },
        submitUpload() {
            // 开课导入
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

        this.$axios
            .get('/api/school/college')
            .then(res => {
                if(res.status == 200){
                    var data = res.data;
                    var tempCourse = [];
                    data.forEach(item => {
                        var indexCourse = this.courseList.push({
                            value: item.collegeid,
                            label: item.name,
                            children: []
                        })
                        tempCourse[item.collegeid] = indexCourse - 1;
                    })
                    // 课程获取
                    var options = {
                        filter: {
                            isFirst: true,
                            isPage: false
                        }
                    }
                    this.$axios
                        .get('/api/course', {params: options})
                        .then(res => {
                            if(res.status == 200){
                                var course = res.data.data;
                                course.forEach(item => {
                                    var child = {
                                        value: item.courseid,
                                        label: item.name
                                    }
                                    this.courseList[tempCourse[item.collegeid]].children.push(child);
                                })
                            }
                        })
                }
            })

        // 开课学年选择器设置
        var nowYear = (new Date()).getFullYear();
        for(var i = 0; i <= nowYear - 1949; i++){
            this.schoolYearSelect.push((1949+i).toString() + '-' + (1950+i).toString());
        }
        this.classSelectAddForm.schoolYear = nowYear.toString() + '-' + (nowYear + 1).toString();

        // 时间选择设置
        var week = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
        var type = ['', 'success', 'info', 'danger', 'warning'];
        week.forEach((item, index) => {
            this.weekday.push({
                label: item,
                type: type[index%5]
            })
        })

        var width = $(window).width();
        if(width < 768){
            this.addDialogFullScreen = true;
            var buttonParentWidth = $('.classSelectTop .el-button').parent().width() - 20;
            var buttonWith = buttonParentWidth/3;
            $('.classSelectTop .el-button').eq(0).css({'margin-left':'0','width':buttonWith.toString(),'padding':'12px 10px'});
            $('.classSelectTop .el-button').eq(1).css({'margin-left':'10px','width':buttonWith.toString(),'padding':'12px 10px'});
            $('.classSelectTop .el-button').eq(2).css({'margin-left':'10px','width':buttonWith.toString(),'padding':'12px 10px'});
            $('.classSelectTop .el-button').eq(3).css({'margin-left':'0','margin-top':'10px','width':'100%','padding':'12px 10px'});
            $('.classSelectTop .el-button').eq(4).css({'margin-left':'0','margin-top':'10px','width':'100%','padding':'12px 10px'});
            var buttonTextWidth = $('.classSelectTop .el-button span').width();
            if(buttonWith-20 < buttonTextWidth){
                this.buttonSize = 'mini';
            }
        }
    }
};
</script>

<style scoped>
    .el-divider__text{
        font-weight: bolder;
        left: 0 !important;
        padding-left: 0 !important;
    }
    .el-divider__text span{
        color: red;
    }
    .classImport .tag-group{
        margin-top: 15px;
    }
    .classImport .tag-group__title{
        margin-right: 10px;
    }
    .classImport .el-tag{
        margin-right: 10px;
        margin-bottom: 10px;
    }
    .el-timeline{
        padding-left: 0;
    }
    .classSelectTop .el-cascader{
        margin-left: 10px;
    }
    .classSelectTop .el-cascader{
        margin-top: 10px;
        width: 100%;
    }
    .classSelectDetail .tag-courseid{
        width: 130px;
        cursor:pointer;
    }
    .classSelectDetail .tag-course{
        margin-bottom: 10px;
        margin-left: 10px;
        width: calc(100% - 140px);
        cursor:pointer;
    }
    .classSelectAddForm .el-cascader{
        width: 100%;
    }
    .classSelectAddForm .el-select{
        width: 100%;
    }
    .classSelectAddForm .submit_btn{
		width: 100%;
	}
    .classSelectImport .tag-group{
        margin-top: 15px;
    }
    .classSelectImport .tag-group__title{
        margin-right: 10px;
    }
    .classSelectImport .el-tag{
        margin-right: 10px;
        margin-bottom: 10px;
    }
</style>
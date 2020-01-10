<template>
    <div class="courseScheduleManager">
        <el-row class="scheduleTop">
            <el-button type="primary" :size="buttonSize" plain @click="scheduleAdd()">计划添加</el-button>
            <el-button type="success" :size="buttonSize" plain @click="scheduleImport()">计划导入</el-button>
            <el-button type="danger" :size="buttonSize" plain @click="scheduleDelete()">计划删除</el-button>
        </el-row>
        <el-row style="margin-top: 20px;">
            <el-timeline>
                <el-timeline-item color="#a0cfff" timestamp="通识必修课程" placement="top">
                    <el-card>
                        <h4>更新 Github 模板</h4>
                        <p>王小虎 提交于 2018/4/12 20:46</p>
                    </el-card>
                </el-timeline-item>
                <el-timeline-item color="#b3e19d" timestamp="通识选修课程" placement="top">
                    <el-card>
                        <h4>更新 Github 模板</h4>
                        <p>王小虎 提交于 2018/4/3 20:46</p>
                    </el-card>
                </el-timeline-item>
                <el-timeline-item color="#f3d19e" timestamp="大类基础课程" placement="top">
                    <el-card>
                        <h4>更新 Github 模板</h4>
                        <p>王小虎 提交于 2018/4/2 20:46</p>
                    </el-card>
                </el-timeline-item>
                <el-timeline-item color="#fab6b6" timestamp="学科基础课程" placement="top">
                    <el-card>
                        <h4>更新 Github 模板</h4>
                        <p>王小虎 提交于 2018/4/2 20:46</p>
                    </el-card>
                </el-timeline-item>
                <el-timeline-item color="#a0cfff" timestamp="专业必修课程" placement="top">
                    <el-card>
                        <h4>更新 Github 模板</h4>
                        <p>王小虎 提交于 2018/4/2 20:46</p>
                    </el-card>
                </el-timeline-item>
                <el-timeline-item color="#b3e19d" timestamp="专业选修课程" placement="top">
                    <el-card>
                        <h4>更新 Github 模板</h4>
                        <p>王小虎 提交于 2018/4/2 20:46</p>
                    </el-card>
                </el-timeline-item>
                <!-- <el-timeline-item color="#f3d19e" placement="top"></el-timeline-item> -->
            </el-timeline>
        </el-row>

        <!-- 计划添加 -->
        <el-dialog
			:visible.sync="addDialogVisible"
			title="计划添加"
            :fullscreen="addDialogFullScreen"
			center>
			<el-row class="scheduleAddForm">
				<el-col :md='{span: 16, offset: 4}'>
                    <el-form :model="scheduleAddForm" :rules="addRules" ref="addForm" label-position="left" label-width="80px" class="addForm">
                        <el-form-item label="专业" prop="major">
                            <el-cascader v-model="scheduleAddForm.major" :options="majorList" :show-all-levels="false"></el-cascader>
                        </el-form-item>
                        <el-form-item label="课程" prop="course">
                            <el-cascader v-model="scheduleAddForm.course" :options="courseList" :show-all-levels="false" filterable></el-cascader>
                        </el-form-item>
                        <el-form-item label="课程类型" prop="type">
                            <el-select v-model="scheduleAddForm.type" filterable>
                                <el-option
                                    v-for="item in typeList"
                                    :key="item"
                                    :label="item"
                                    :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
					    	<el-button type="primary" class="submit_btn" @click="submitAddForm('addForm')">添加</el-button>
					  	</el-form-item>
                    </el-form>
				</el-col>
			</el-row>
		</el-dialog>

        <!-- 计划导入 -->
        <el-dialog
			:visible.sync="importDialogVisible"
			:fullscreen="true"
			title="计划导入"
			center>
			<el-row class="scheduleImport">
				<el-col :xs='{span: 24}' :sm='{span: 16, offset: 4}'>
                    <el-divider content-position="left"><span>* </span>导入格式</el-divider>
                    <el-image :src="require('../assets/teach/table.jpg')"></el-image><br>
                    <el-image :src="require('../assets/teach/schedule.jpg')"></el-image><br>
                    <div class="tag-group">
                        <span class="tag-group__title">学院选择如下：</span>
                        <el-tag
                            v-for="item in items"
                            :key="item.label"
                            :type="item.type">
                            {{ item.label }}
                        </el-tag>
                    </div>
                    <p>专业选择如下：</p>
                    <el-tree :data="majorList"></el-tree>
                    <p style="color: red;">班级编号必须由英文或数字组成</p>
                    <el-divider content-position="left">文件导入</el-divider>
					<el-upload
                        class="upload-demo"
                        ref="upload"
                        action="/api/course/schedule/import"
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
import $ from 'jquery';

export default {
    components: {},
    props: {},
    data() {
        return {
            headers: {
                Authorization: localStorage.eleToken
            },
            user: {},
            items: [],
            majorList: [],
            courseList: [],
            typeList: [],
            scheduleAddForm: {},
            loading: null,
            file: '',
            buttonSize: 'medium',
            addDialogFullScreen: false,
            addDialogVisible: false,
            importDialogVisible: false,
            addRules: {
                major: [{
                    required: true,
                    message: '专业不能为空',
                    trigger: 'blur'
                }],
                course: [{
                    required: true,
                    message: '课程不能为空',
                    trigger: 'blur'
                }],
                type: [{
                    required: true,
                    message: '课程类型不能为空',
                    trigger: 'blur'
                }]
            }
        };
    },
    watch: {},
    computed: {},
    methods: {
        scheduleAdd(){
            // 计划添加
            this.addDialogVisible = true;
        },
        submitAddForm(formName){
            // 计划添加
			this.$refs[formName].validate(valid => {
				if(valid){
                    this.scheduleAddForm.major = this.scheduleAddForm.major[1];
                    this.scheduleAddForm.course = this.scheduleAddForm.course[1];
                    this.$axios
                        .post('/api/course/schedule', this.scheduleAddForm)
                        .then(res => {
                            if(res.status == 200){
                                var data = res.data;
                                this.$message({
                                    message: data.msg,
                                    type: "success"
                                });

                                this.addDialogVisible = false;
                                this.scheduleAddForm = {
                                    major: [],
                                    course: [],
                                    type: ''
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
        scheduleImport(){
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

            // var options = {
            //     filter: {
            //         isFirst: true,
            //         isPage: true,
            //         page: 1,
            //         size: this.listPageSize
            //     }
            // }
            // var _this = this;
            // setTimeout(function(){
            //     _this.$axios
            //         .get('/api/school/class', {params: options})
            //         .then(res => {
            //             if(res.status == 200){
            //                 var data = res.data;
            //                 _this.listTotal = data.count;
            //                 _this.classList = data.data;
            //             }
            //         })
            // },1000);
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
                    var tempMajor = [];
                    var tempCourse = [];
                    data.forEach(item => {
                        if(parseInt(item.collegeid) <= 10){
                            var indexMajor = this.majorList.push({
                                value: item.collegeid,
                                label: item.name,
                                children: []
                            })
                            tempMajor[item.collegeid] = indexMajor - 1;
                        }
                        var indexCourse = this.courseList.push({
                            value: item.collegeid,
                            label: item.name,
                            children: []
                        })
                        tempCourse[item.collegeid] = indexCourse - 1;
                    })
                    // 专业获取
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
                                    this.majorList[tempMajor[item.collegeid]].children.push(child);
                                })
                            }
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
        this.$axios
            .get('/api/type')
            .then(res => {
                if(res.status == 200){
                    this.typeList = res.data;
                    var type = ['', 'success', 'info', 'danger', 'warning'];
                    this.typeList.forEach((item, index) => {
                        this.items.push({
                            type: type[index%5],
                            label: item
                        })
                    })
                }
            })

        var width = $(window).width();
        if(width < 768){
            this.addDialogFullScreen = true;
            // this.pageSmall = true;
            var buttonParentWidth = $('.scheduleTop .el-button').parent().width() - 20;
            var buttonWith = buttonParentWidth/3;
            $('.scheduleTop .el-button').eq(0).css({'margin-left':'0','width':buttonWith.toString(),'padding':'12px 10px'});
            $('.scheduleTop .el-button').eq(1).css({'margin-left':'10px','width':buttonWith.toString(),'padding':'12px 10px'});
            $('.scheduleTop .el-button').eq(2).css({'margin-left':'10px','width':buttonWith.toString(),'padding':'12px 10px'});
            var buttonTextWidth = $('.scheduleTop .el-button span').width();
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
    .el-timeline{
        padding-left: 0;
    }
    .scheduleAddForm .el-cascader{
        width: 100%;
    }
    .scheduleAddForm .el-select{
        width: 100%;
    }
    .scheduleAddForm .submit_btn{
		width: 100%;
	}
    .scheduleImport .tag-group{
        margin-top: 15px;
    }
    .scheduleImport .tag-group__title{
        margin-right: 10px;
    }
    .scheduleImport .el-tag{
        margin-right: 10px;
        margin-bottom: 10px;
    }
</style>
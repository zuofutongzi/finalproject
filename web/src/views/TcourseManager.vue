<template>
    <div class="tcourseManager">
        <el-row class="tcourseManagerTop hidden-xs-only">
            <el-button type="primary" plain @click="courseTable()">课表查询</el-button>
            <el-cascader v-model="filterSchoolYear" :options="schoolYearSelect" @change="handleSelectChange" :show-all-levels="true" placeholder="学年选择"></el-cascader>
        </el-row>
        <el-row class="tcourseManagerXsTop hidden-sm-and-up">
            <el-button class="ct-bnt" type="primary" plain @click="courseTable()">课表查询</el-button>
            <el-cascader v-model="filterSchoolYear" :options="schoolYearSelect" @change="handleSelectChange" :show-all-levels="true" placeholder="学年选择"></el-cascader>
        </el-row>
        <div v-for="item in classList" :key="'c' + item.classid" @click="editClass(item)">
            <class-card
                :id="item.classid" 
                :key="item.classid" 
                :data="item">
            </class-card>
        </div>

        <!-- 开课编辑 -->
        <el-dialog
			:visible.sync="editDialogVisible"
			:fullscreen="true"
            :before-close="handleClose"
			title="开课编辑"
			center>
            <el-row>
                <el-col :sm='{span: 24}' :md='{span: 16, offset: 4}'>
                    <el-divider content-position="left"><i class="el-icon-picture" style="margin-right: 10px; color: #409EFF;"></i>图片</el-divider>
                    <el-upload
                        class="upload-demo"
                        ref="upload"
                        action="/api/class/img"
                        accept=".jpg,.png"
                        :headers="headers"
                        :data="uploadOption"
                        :on-error="handleError"
                        :on-change="handleChange"
                        :on-success="handleSuccess"
                        :before-upload="beforeUpload"
                        :limit="1"
                        :auto-upload="false"
                        :file-list="fileList"
                        list-type="picture">
                        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                        <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
                        <div slot="tip" class="el-upload__tip">只接收.jpg/.png文件，上传文件不超过500kb</div>
                    </el-upload>
                    <el-divider content-position="left"><i class="el-icon-menu" style="margin-right: 10px; color: #409EFF;"></i>课程概述</el-divider>
                    <textarea name="courseDescription" id="courseDescription"></textarea>
                    <el-divider content-position="left"><i class="el-icon-s-flag" style="margin-right: 10px; color: #409EFF;"></i>课程目标</el-divider>
                    <textarea name="courseObjectives" id="courseObjectives"></textarea>
                    <el-divider content-position="left"><i class="el-icon-s-management" style="margin-right: 10px; color: #409EFF;"></i>课程大纲</el-divider>
                    <textarea name="courseOutline" id="courseOutline"></textarea>
                    <el-divider content-position="left"><i class="el-icon-s-order" style="margin-right: 10px; color: #409EFF;"></i>预备知识</el-divider>
                    <textarea name="preknowledge" id="preknowledge"></textarea>
                    <el-divider content-position="left"><i class="el-icon-s-claim" style="margin-right: 10px; color: #409EFF;"></i>参考资料</el-divider>
                    <textarea name="referenceMaterial" id="referenceMaterial"></textarea>
                    <el-button type="primary" style="margin-top: 10px; width: 100px;" @click="submitEdit()">提交</el-button>
                </el-col>
            </el-row>
		</el-dialog>

        <!-- 课表 -->
        <el-dialog
            width="760px"
			:visible.sync="courseTableVisible"
			:fullscreen="isFullScreen"
            :before-close="handleCourseTableClose"
			title="课表"
			center>
            <el-row>
                <course-table
                    ref="tcourseTable"
                    id="tcourseTable"
                    :data="courseTableData"
                    :showBackgroundColor="true">
                </course-table>
            </el-row>
		</el-dialog>
    </div>
</template>

<script>
import $ from 'jquery'
import Editor from 'mditor'
import ClassCard from '../components/ClassCard'
import CourseTable from '../components/CourseTable'

export default {
    components: {
        ClassCard,
        CourseTable
    },
    props: {},
    data() {
        return {
            headers: {
                Authorization: localStorage.eleToken
            },
            uploadOption:{
                classid: ''
            },
            user: {},
            classList: [],
            schoolYearSelect: [],
            filterSchoolYear: [],
            myclass: {},
            courseTableData: [],
            activeName: 'edit',
            file: '',
            fileList: [],
            courseDescriptionMditor: null,
            courseObjectiveMditor: null,
            courseOutlineMditor: null,
            preknowledgeMditor: null,
            referenceMaterialMditor: null,
            isFullScreen: false,
            editDialogVisible: false,
            courseTableVisible: false
        };
    },
    watch: {},
    computed: {},
    methods: {
        courseTable(){
            // 课表查询
            this.courseTableData.splice(0, this.courseTableData.length);
            this.courseTableVisible = true;
            var courseid = [];
            this.classList.forEach(item => {
                var session = item.session.split(';');
                courseid.push(item.course.courseid);
                session.forEach(sitem => {
                    if(!this.isEmpty(sitem)){
                        var property = sitem.split('-')[0];
                        var options = {
                            session: sitem.split('-')[1]
                        }
                        var count = courseid.reduce((a, v) => v === item.course.courseid ? a + 1 : a + 0, 0);
                        options[property] = '(' + item.course.courseid + ')' + item.course.name + '-' + count;
                        this.courseTableData.push(options);
                    }
                })
            });
        },
        handleCourseTableClose(done){
            // 课表关闭前的操作
            this.$refs.tcourseTable.cleanSelect();
            done()
        },
        handleSelectChange(){
            // 学年选择切换
            var options = {
                teacherid: this.user.userid,
                schoolYear: this.filterSchoolYear[0],
                schoolTerm: this.filterSchoolYear[1],
                filter: {
                    isPage: false
                }
            }
            this.$axios
                .get('/api/class/teacher', {params: options})
                .then(res => {
                    if(res.status == 200){
                        if(this.isEmpty(res.data.data)){
                            this.$message({
                                message: '当前学期没有开课',
                                type: "error"
                            });
                            this.classList.splice(0, this.classList.length);
                        }
                        else{
                            this.classList = res.data.data;
                        }
                    }
                })
        },
        handleClose(done){
            // dialog关闭前的操作
            this.$refs.upload.clearFiles();
            this.fileList.splice(0, this.fileList.length);
            done();
        },
        editClass(value){
            // 编辑开课信息
            this.myclass = value;
            this.editDialogVisible = true;
            this.fileList.push({
                url: 'http://127.0.0.1:5000/api/class/img/' + this.myclass.img
            })
            // 课程概述
            if(this.isEmpty(this.courseDescriptionMditor)){
				// 延迟，解决elementui组件中dialog的懒渲染问题
				setTimeout(() => {
                    this.courseDescriptionMditor =  Mditor.fromTextarea(document.getElementById('courseDescription'));
                    var _this = this;
                    this.courseDescriptionMditor.on('ready', function(){
                        this.toolbar.removeItem('image');
                        this.value = _this.myclass.courseDescription;
                    });
				},0)
			}else{
				this.courseDescriptionMditor.value = this.myclass.courseDescription;
            }
            // 课程目标
            if(this.isEmpty(this.courseObjectivesMditor)){
				// 延迟，解决elementui组件中dialog的懒渲染问题
				setTimeout(() => {
                    this.courseObjectivesMditor =  Mditor.fromTextarea(document.getElementById('courseObjectives'));
                    var _this = this;
                    this.courseObjectivesMditor.on('ready', function(){
                        this.toolbar.removeItem('image');
                        this.value = _this.myclass.courseObjectives;
                    });
				},0)
			}else{
				this.courseObjectivesMditor.value = this.myclass.courseObjectives;
			}
            // 课程大纲
            if(this.isEmpty(this.courseOutlineMditor)){
				// 延迟，解决elementui组件中dialog的懒渲染问题
				setTimeout(() => {
                    this.courseOutlineMditor =  Mditor.fromTextarea(document.getElementById('courseOutline'));
                    var _this = this;
                    this.courseOutlineMditor.on('ready', function(){
                        this.toolbar.removeItem('image');
                        this.value = _this.myclass.courseOutline;
                    });
				},0)
			}else{
				this.courseOutlineMditor.value = this.myclass.courseOutline;
			}
            // 预备知识
            if(this.isEmpty(this.preknowledgeMditor)){
				// 延迟，解决elementui组件中dialog的懒渲染问题
				setTimeout(() => {
                    this.preknowledgeMditor =  Mditor.fromTextarea(document.getElementById('preknowledge'));
                    var _this = this;
                    this.preknowledgeMditor.on('ready', function(){
                        this.toolbar.removeItem('image');
                        this.value = _this.myclass.preknowledge;
                    });
				},0)
			}else{
				this.preknowledgeMditor.value = this.myclass.preknowledge;
			}
            // 参考资料
            if(this.isEmpty(this.referenceMaterialMditor)){
				// 延迟，解决elementui组件中dialog的懒渲染问题
				setTimeout(() => {
                    this.referenceMaterialMditor =  Mditor.fromTextarea(document.getElementById('referenceMaterial'));
                    var _this = this;
                    this.referenceMaterialMditor.on('ready', function(){
                        this.toolbar.removeItem('image');
                        this.value = _this.myclass.referenceMaterial;
                    });
				},0)
			}else{
				this.referenceMaterialMditor.value = this.myclass.referenceMaterial;
			}
        },
        handleChange(file,fileList){
			// 文件添加
            if(!this.isEmpty(file) && file.status == 'ready'){
                this.file = file.name;
                this.uploadOption.classid = this.myclass.classid;
            }
        },
        beforeUpload(file){
            // 文件上传前
            const isLt500Kb = file.size / 1024 < 500;
            if (!isLt500Kb) {
                this.$message({
                    message: '上传头像图片大小不能超过500KB!',
                    type: "error"
                });
            }
            return isLt500Kb;
        },
        handleError(err, file, fileList){
            // 文件上传失败
            this.$refs.upload.clearFiles();
            this.file = '';
            this.uploadOption.classid = '';
            this.$message({
                message: err.message,
                type: "error"
            });
        },
        handleSuccess(response, file, fileList){
            // 文件上传成功
            this.file = '';
            this.uploadOption.classid = '';
            this.$message({
                message: response.msg,
                type: "success"
            });
        },
        submitUpload() {
            // 文件上传服务器
            if(!this.isEmpty(this.file)){
                this.$refs.upload.submit();
                setTimeout(() => {
                    // 重新获取开课信息
                    this.handleSelectChange();
                }, 1000)
            }
        },
        submitEdit(){
            // 提交修改
            var options = {
                classid: this.myclass.classid,
                courseObjectives: this.courseObjectivesMditor.value,
                courseDescription: this.courseDescriptionMditor.value,
                courseOutline: this.courseOutlineMditor.value,
                preknowledge: this.preknowledgeMditor.value,
                referenceMaterial: this.referenceMaterialMditor.value
            }
            this.$axios
                .put('/api/class', options)
                .then(res => {
                    if(res.status == 200){
                        var data = res.data;
                        this.$message({
                            message: data.msg,
                            type: "success"
                        });
                        this.editDialogVisible = false;
                        setTimeout(() => {
                            // 重新获取开课信息
                            this.handleSelectChange();
                        }, 1000)
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
    created() {},
    mounted() {
        this.user = this.$store.getters.user;

        // 开课学年选择器设置
        var nowYear = (new Date()).getFullYear();
        for(var i = 0; i <= nowYear - 1949; i++){
            this.schoolYearSelect.push({
                value: (1949+i).toString() + '-' + (1950+i).toString(),
                label: (1949+i).toString() + '-' + (1950+i).toString(),
                children: [{
                    value: '1',
                    label: '1'
                },{
                    value: '2',
                    label: '2'
                }]
            });
        }
        this.filterSchoolYear = [nowYear.toString() + '-' + (nowYear + 1).toString(), '1'];

        // 获取教师开课列表
        var options = {
            teacherid: this.user.userid,
            schoolYear: this.filterSchoolYear[0],
            schoolTerm: this.filterSchoolYear[1],
            filter: {
                isPage: false
            }
        }
        this.$axios
            .get('/api/class/teacher', {params: options})
            .then(res => {
                if(res.status == 200){
                    if(this.isEmpty(res.data.data)){
                        this.$message({
                            message: '当前学期没有开课',
                            type: "error"
                        });
                    }
                    else{
                        this.classList = res.data.data;
                    }
                }
            })

        var width = $(window).width();
        if(width < 768){
            this.isFullScreen = true;
        }
    }
};
</script>

<style scoped>
    .tcourseManagerTop .el-cascader{
        margin-left: 10px;
    }
    .tcourseManagerXsTop .el-cascader{
        margin-top: 10px;
        width: 100%;
    }
    .tcourseManagerXsTop .ct-bnt{
        width: 100%;
    }
    .el-divider__text{
        font-weight: bolder;
        left: 0 !important;
        padding-left: 0 !important;
    }
    .el-divider__text span{
        color: red;
    }
</style>
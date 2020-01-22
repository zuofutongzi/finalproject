<template>
    <div class="tcourseManager">
        <el-row class="tcourseManagerTop">
            <el-cascader class="hidden-xs-only" v-model="filterSchoolYear" :options="schoolYearSelect" @change="handleSelectChange" :show-all-levels="true" placeholder="学年选择"></el-cascader>
        </el-row>
        <el-row class="tcourseManagerXsTop">
            <el-cascader class="hidden-sm-and-up" v-model="filterSchoolYear" :options="schoolYearSelect" @change="handleSelectChange" :show-all-levels="true" placeholder="学年选择"></el-cascader>
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
                        :limit="1"
                        :auto-upload="false"
                        list-type="picture">
                        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                        <!-- <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button> -->
                        <div slot="tip" class="el-upload__tip">只接收.xls/.xlsx文件，上传文件不超过1mb</div>
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
    </div>
</template>

<script>
import $ from 'jquery'
import Editor from 'mditor'
import ClassCard from '../components/ClassCard'

export default {
    components: {
        ClassCard
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
            activeName: 'edit',
            file: '',
            currentPage: 1,
            listPageSize: 10,
            listTotal: 0,
            courseDescriptionMditor: null,
            courseObjectiveMditor: null,
            courseOutlineMditor: null,
            preknowledgeMditor: null,
            referenceMaterialMditor: null,
            editDialogVisible: false
        };
    },
    watch: {},
    computed: {},
    methods: {
        handleSelectChange(){
            // 学年选择切换
            this.currentPage = 1;
            var options = {
                teacherid: this.user.userid,
                schoolYear: this.filterSchoolYear[0],
                schoolTerm: this.filterSchoolYear[1],
                isPage: true,
                page: this.currentPage,
                size: this.listPageSize
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
                            this.listTotal = res.data.count;
                        }
                    }
                })
        },
        handleClose(done){
            // dialog关闭前的操作
            this.$refs.upload.clearFiles();
            done();
        },
        editClass(value){
            // 编辑开课信息
            this.myclass = value;
            this.editDialogVisible = true;
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
        // submitUpload() {
        //     // 图片导入
        //     if(this.isEmpty(this.file)){
        //         this.$message({
        //             message: '文件不能为空',
        //             type: "error"
        //         });
        //     }
        //     else{
        //         this.$refs.upload.submit();
        //     }
        // },
        handleChange(file,fileList){
			// 文件添加
            if(!this.isEmpty(file) && file.status == 'ready'){
                this.file = file.name;
                this.uploadOption.classid = this.myclass.classid;
            }
        },
        handleError(err, file, fileList){
            // 文件上传失败
            this.$message({
                message: err.message,
                type: "error"
            });
        },
        handleSuccess(response, file, fileList){
            // 文件上传成功
            this.$refs.upload.clearFiles();
            this.file = '';
            this.uploadOption.classid = '';
            this.$message({
                message: response.msg,
                type: "success"
            });
        },
        submitEdit(){
            // 提交修改
            var options = {
                courseObjectives: this.courseObjectivesMditor.value,
                courseDescription: this.courseDescriptionMditor.value,
                courseOutline: this.courseOutlineMditor.value,
                preknowledge: this.preknowledgeMditor.value,
                referenceMaterial: this.referenceMaterialMditor.value
            }
            console.log(options)
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
            isPage: true,
            page: this.currentPage,
            size: this.listPageSize
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
                        this.listTotal = res.data.count;
                    }
                }
            })
    }
};
</script>

<style scoped>
    .tcourseManagerXsTop .el-cascader{
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
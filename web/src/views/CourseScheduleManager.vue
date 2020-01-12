<template>
    <div class="courseScheduleManager">
        <el-row class="scheduleTop">
            <el-button type="primary" :size="buttonSize" plain @click="scheduleAdd()">计划添加</el-button>
            <el-button type="success" :size="buttonSize" plain @click="scheduleImport()">计划导入</el-button>
            <el-button type="danger" :size="buttonSize" plain @click="scheduleDelete()">计划删除</el-button>
            <el-cascader class="hidden-xs-only" v-model="filterMajor" :options="majorList" @change="handleSelectChange" :show-all-levels="false" placeholder="专业选择"></el-cascader>
        </el-row>
        <el-row class="scheduleXsTop">
            <el-cascader class="hidden-sm-and-up" v-model="filterMajor" :options="majorList" @change="handleSelectChange" :show-all-levels="false" placeholder="专业选择"></el-cascader>
        </el-row>
        <el-row class="scheduleDetail" style="margin-top: 20px;">
            <el-timeline>
                <el-timeline-item v-for="item in items" :key="item.label" :color="item.color" :timestamp="item.label" placement="top">
                    <el-collapse-transition>
                        <el-card v-show="pointShow">
                            <h4>课程计划</h4>
                            <p>选择专业查看专业课程计划</p>
                        </el-card>
                    </el-collapse-transition>
                    <el-collapse-transition>
                        <el-card v-show="detailShow">
                            <template v-for="child in item.children">
                                <el-tag :key="child.courseid" :type="child.tagType" @click="handleTagSelect(child)" class="hidden-xs-only tag-courseid">{{ child.courseid }}</el-tag>
                                <el-tag :key="'d' + child.courseid" :type="child.tagType" @click="handleTagSelect(child)" class="tag-course">{{ child.name }}</el-tag>
                            </template>
                        </el-card>
                    </el-collapse-transition>
                </el-timeline-item>
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
            multipleSelection: [],
            scheduleAddForm: {},
            loading: null,
            filterMajor: [],
            file: '',
            buttonSize: 'medium',
            pointShow: true,
            detailShow: false,
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
        handleSelectChange(){
            // 专业筛选切换
            this.multipleSelection.splice(0, this.multipleSelection.length);
            this.detailShow = false;
            this.pointShow = false;
            var options = {
                major: this.filterMajor[1],
                isAll: true
            }
            this.$axios
                .get('/api/course/schedule', {headers: {'showLoading': false}, params: options})
                .then(res => {
                    if(res.status == 200){
                        var data = res.data;
                        // 设置延时，让动画显示更自然
                        setTimeout(() => {
                            Promise.all(this.items.map(item => {
                                return new Promise((resolve) => {
                                    item.children.splice(0, item.children.length);
                                    resolve(item)
                                })
                            }))
                            .then(result => {
                                data.forEach(item => {
                                    var index = result.findIndex(value => {
                                        return value.label == item.type;
                                    })
                                    if(index != -1){
                                        item.tagType = result[index].tagType;
                                        result[index].children.push(item);
                                    }
                                })
                                setTimeout(() => {
                                    this.detailShow = true;
                                    var width = $(window).width();
                                    if(width < 768){
                                        $('.tag-course').css({'width':'100%', 'margin-left':'0', 'overflow':'hidden', 'text-overflow':'ellipsis', 'white-space':'nowrap'});
                                    }
                                },500)
                            })
                        },500)
                    }
                })
        },
        scheduleAdd(){
            // 计划添加
            this.addDialogVisible = true;
        },
        submitAddForm(formName){
            // 计划添加
			this.$refs[formName].validate(valid => {
				if(valid){
                    var options = {
                        major: this.scheduleAddForm.major[1],
                        course: this.scheduleAddForm.course[1],
                        type: this.scheduleAddForm.type
                    }
                    this.$axios
                        .post('/api/course/schedule', options)
                        .then(res => {
                            if(res.status == 200){
                                var data = res.data;
                                this.$message({
                                    message: data.msg,
                                    type: "success"
                                });

                                if(!this.isEmpty(this.filterMajor) && this.filterMajor[1] == options.major){
                                    setTimeout(() => {
                                        // 获取最新课程计划列表
                                        this.handleSelectChange();
                                    },1000)
                                }

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
        },
        handleTagSelect(value){
            // 课程计划选择
            this.items = this.items.map(item => {
                if(item.label == value.type){
                    item.children = item.children.map(citem => {
                        if(citem.majorid == value.majorid && citem.courseid == value.courseid){
                            if(citem.tagType != 'info'){
                                citem.tagType = 'info';
                                this.multipleSelection.push(citem);
                            }
                            else{
                                citem.tagType = item.tagType;
                                var index = this.multipleSelection.findIndex(mitem => {
                                    return mitem.majorid == citem.majorid && mitem.courseid == citem.courseid;
                                })
                                if(index != -1){
                                    this.multipleSelection.splice(index, 1);
                                }
                            }
                        }
                        return citem;
                    })
                }
                return item;
            })
        },
        scheduleDelete(){
            // 课程计划删除
            this.$axios
                .delete('/api/course/schedule', {data: this.multipleSelection})
                .then(res => {
                    if(res.status == 200){
                        var data = res.data;
                        this.$message({
                            message: data.msg,
                            type: "success"
                        });

                        if(!this.isEmpty(this.filterMajor)){
                            setTimeout(() => {
                                // 获取最新课程计划列表
                                this.handleSelectChange();
                            },1000)
                        }
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
                    var tagType = ['', 'success', 'danger', 'warning'];
                    var color = ['#a0cfff', '#b3e19d', '#f3d19e', '#fab6b6'];
                    this.typeList.forEach((item, index) => {
                        this.items.push({
                            color: color[index%4],
                            type: type[index%5],
                            tagType: tagType[index%4],
                            label: item,
                            children: []
                        })
                    })
                }
            })

        var width = $(window).width();
        if(width < 768){
            this.addDialogFullScreen = true;
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
    .scheduleTop .el-cascader{
        margin-left: 10px;
    }
    .scheduleXsTop .el-cascader{
        margin-top: 10px;
        width: 100%;
    }
    .scheduleDetail .tag-courseid{
        width: 130px;
        cursor:pointer;
    }
    .scheduleDetail .tag-course{
        margin-bottom: 10px;
        margin-left: 10px;
        width: calc(100% - 140px);
        cursor:pointer;
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
<template>
    <div class="classSelectManager">
        <el-row class="classSelectTop">
            <el-button type="primary" :size="buttonSize" plain @click="classAdd()">开课添加</el-button>
            <el-button type="success" :size="buttonSize" plain @click="classImport()">开课导入</el-button>
            <el-button type="danger" :size="buttonSize" plain @click="classDelete()">开课删除</el-button>
            <el-button type="primary" :size="buttonSize" plain @click="classControllSet()">选课设置</el-button>
            <el-cascader class="hidden-xs-only" v-model="filterSchoolYear" :options="schoolYearSelect" @change="handleSelectChange" :show-all-levels="true" placeholder="学年选择"></el-cascader>
        </el-row>
        <el-row class="classSelectXsTop">
            <el-cascader class="hidden-sm-and-up" v-model="filterSchoolYear" :options="schoolYearSelect" @change="handleSelectChange" :show-all-levels="true" placeholder="学年选择"></el-cascader>
        </el-row>
        <el-row class="classSelectDetail" style="margin-top: 20px;">
            <el-collapse-transition>
                <div v-show="detailLineShow">
                    <el-timeline>
                        <el-timeline-item v-for="item in classList" :key="item.course.courseid" :color="item.color" :timestamp="'(' + item.course.courseid + ')' + item.course.name" placement="top">
                            <el-collapse-transition>
                                <el-card v-show="detailShow">
                                    <template v-for="child in item.class">
                                        <el-tag :key="child.classid" :type="child.tagType" @click="handleTagSelect(child)" class="tag-courseid">{{ child.teacher.name }}</el-tag>
                                        <el-tag :key="'c' + child.classid" :type="child.tagType" @click="showClassDetail(item.course,child)" class="hidden-xs-only tag-capacity">{{ child.capacityReal }}/{{ child.capacityLimit }}</el-tag>
                                        <el-tag :key="'t' + child.classid" :type="child.tagType" @click="showClassDetail(item.course,child)" class="tag-course">{{ child.session }}</el-tag>
                                    </template>
                                </el-card>
                            </el-collapse-transition>
                        </el-timeline-item>
                    </el-timeline>
                </div>
            </el-collapse-transition>
        </el-row>
        <el-pagination
            layout="prev, pager, next"
            @current-change="handleCurrentChange"
            :small="pageSmall"
            :hide-on-single-page="true"
            :current-page.sync="currentPage"
            :page-size="listPageSize"
            :total="listTotal">
        </el-pagination>

        <!-- 开课添加 -->
        <el-dialog
            width="760px"
			:visible.sync="addDialogVisible"
			title="开课添加"
            :fullscreen="addDialogFullScreen"
            :before-close="handleCloseAddDialog"
			center>
			<el-row class="classSelectAddForm">
				<el-col :md='{span: 21, offset: 1}'>
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
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
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
                                id="courseTable"
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
                        action="/api/class/import"
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

        <!-- 开课详情 -->
        <el-dialog
            width="760px"
			:visible.sync="detailDialogVisible"
			title="开课详情"
            :fullscreen="addDialogFullScreen"
			center>
			<el-row class="classDetail">
				<el-col :md='{span: 24}'>
                    <el-card class="hidden-xs-only" style="margin-bottom: 10px;">
                        <el-breadcrumb separator="|">
                            <el-breadcrumb-item>课程号：{{ classDetail.course.courseid }}</el-breadcrumb-item>
                            <el-breadcrumb-item>课程：{{ classDetail.course.name }}</el-breadcrumb-item>
                            <el-breadcrumb-item>学分：{{ classDetail.course.credit }}</el-breadcrumb-item>
                            <el-breadcrumb-item>课时：{{ classDetail.course.classHour }}</el-breadcrumb-item>
                            <el-breadcrumb-item>课程容量：{{ classDetail.class.capacityLimit }}</el-breadcrumb-item>
                            <el-breadcrumb-item>选课人数：{{ classDetail.class.capacityReal }}</el-breadcrumb-item>
                        </el-breadcrumb>
                    </el-card>
                    <div class="hidden-sm-and-up">
                        <p>课程号：{{ classDetail.course.courseid }}</p>
                        <p>课程：{{ classDetail.course.name }}</p>
                        <p>学分：{{ classDetail.course.credit }}</p>
                        <p>课时：{{ classDetail.course.classHour }}</p>
                        <p>课程容量：{{ classDetail.class.capacityLimit }}</p>
                        <p>选课人数：{{ classDetail.class.capacityReal }}</p>
                    </div>
                    <course-table
                        ref="classCourseTable"
                        id="classCourseTable"
                        :data="classDetail.session"
                        :topbar="courseTableTopBar"
                        :showBackgroundColor="true">
                    </course-table>
				</el-col>
			</el-row>
		</el-dialog>

        <!-- 选课设置 -->
        <el-dialog
			:visible.sync="controllDialogVisible"
			title="选课设置"
            :fullscreen="addDialogFullScreen"
			center>
			<el-row class="classControll">
				<el-col :md='{span: 16, offset: 4}'>
                    <el-progress :text-inside="true" :stroke-width="20" :percentage="progressPercentage" :format="progressFormat" style="margin-bottom: 30px;"></el-progress>
                    <el-form :model="controllForm" :rules="controllRules" ref="controllForm" label-position="left" label-width="80px" class="controllForm">
                        <el-form-item label="开课学年" prop="schoolYear">
                            <el-select v-model="controllForm.schoolYear" filterable :disabled="isDisabled">
                                <el-option
                                    v-for="item in schoolYearSelect"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="开课学期" prop="schoolTerm">
                            <el-select v-model="controllForm.schoolTerm" filterable :disabled="isDisabled">
                                <el-option
                                    v-for="item in 2"
                                    :key="item"
                                    :label="item"
                                    :value="item">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="起止时间" prop="start2end">
                            <el-date-picker
                                :disabled="isDisabled"
                                v-model="controllForm.start2end"
                                type="datetimerange"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                range-separator="至"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期">
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item label="是否限容" prop="isCapacityLimit">
                            <el-radio-group v-model="controllForm.isCapacityLimit" :disabled="isDisabled">
                                <el-radio label="1">是</el-radio>
                                <el-radio label="0">否</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="是否可退" prop="isDrop">
                            <el-radio-group v-model="controllForm.isDrop" :disabled="isDisabled">
                                <el-radio label="1">是</el-radio>
                                <el-radio label="0">否</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item>
                            <el-popover
                                :disabled="drawLotsTipIsDisabled"
                                placement="top"
                                width="230"
                                v-model="drawLotsTipDialogVisible">
                                <p>上一阶段选课尚未抽签，开启新阶段选课后将无法抽签，是否继续</p>
                                <div style="text-align: right; margin: 0">
                                    <el-button size="mini" type="text" @click="drawLotsTipDialogVisible = false">取消</el-button>
                                    <el-button type="primary" size="mini" @click="submitControllForm('controllForm')">确定</el-button>
                                </div>
                                <el-button slot="reference" type="primary" class="submit_btn" @click="submitSet('controllForm')" :disabled="isDisabled">设置</el-button>
                            </el-popover>
					    	<el-button type="success" class="submit_btn" style="margin-left: 10px;" @click="drawLots()" :disabled="isDisabled">抽签</el-button>
					  	</el-form-item>
                    </el-form>
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
        var validateStart2End = (rule, value, callback) => {
            var now = new Date();
            var start = new Date(value[0]);
            var end = new Date(value[1]);
            if(now < start){
                callback();
            }
            else{
                callback(new Error('开始时间必须晚于当前时间'))
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
            classDetail: {
                course: {},
                class: {},
                session: []
            },
            courseList: [],
            teacherList: [],
            classList: [],
            schoolYearSelect: [],
            weekday: [],
            filterSchoolYear: [],
            multipleSelection: [],
            courseTableTopBar: ['一', '二', '三', '四', '五', '六', '七'],
            buttonSize: 'medium',
            file: '',
            currentPage: 1,
            listPageSize: 10,
            listTotal: 0,
            loading: null,
            detailLineShow: false,
            detailShow: false,
            pageSmall: false,
            addDialogFullScreen: false,
            addDialogVisible: false,
            importDialogVisible: false,
            detailDialogVisible: false,
            controllDialogVisible: false,
            drawLotsTipDialogVisible: false,
            progressPercentage: 0,
            controllForm: {},
            controllDetail: {},
            isDisabled: false,
            drawLotsTipIsDisabled: false,
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
                        message: '开课学期不能为空',
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
            },
            controllRules: {
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
                        message: '开课学期不能为空',
                        trigger: 'blur'
                    }
                ],
                start2end: [
                    {
                        required: true,
                        message: '起止时间不能为空',
                        trigger: 'blur'
                    },
                    {
                        validator: validateStart2End,
                        trigger: 'blur'
                    }
                ],
                isCapacityLimit: [
                    {
                        required: true,
                        message: '是否限容不能为空',
                        trigger: 'blur'
                    }
                ],
                isDrop: [
                    {
                        required: true,
                        message: '是否可退不能为空',
                        trigger: 'blur'
                    }
                ],
            }
        };
    },
    watch: {},
    computed: {},
    methods: {
        handleCurrentChange(val){
            // 分页切换
            this.currentPage = val;
            this.multipleSelection.splice(0, this.multipleSelection.length);
            this.handleSelectChange();
        },
        handleSelectChange(){
            // 学年选择切换
            this.multipleSelection.splice(0, this.multipleSelection.length);
            this.detailShow = false;
            setTimeout(() => {
                this.detailLineShow = false;
            },500)
            var options = {
                schoolYear: this.filterSchoolYear[0],
                schoolTerm: this.filterSchoolYear[1],
                page: this.currentPage,
                size: this.listPageSize
            }
            this.$axios
                .get('/api/class', {headers: {'showLoading': false}, params: options})
                .then(res => {
                    if(res.status == 200){
                        if(this.isEmpty(res.data.data)){
                            this.listTotal = res.data.count;
                            this.$message({
                                message: '当前学期没有开课',
                                type: "error"
                            });
                            setTimeout(() => {
                                this.detailLineShow = false;
                            },500)
                        }
                        else{
                            setTimeout(() => {
                                this.listTotal = res.data.count;
                                this.classList = res.data.data;
                                var color = ['#a0cfff', '#b3e19d', '#f3d19e', '#fab6b6'];
                                var tagType = ['', 'success', 'danger', 'warning'];

                                this.classList.map((item, index) => {
                                    item.tagType = tagType[index%4];
                                    item.color = color[index%4];
                                    item.class.map(citem => {
                                        citem.tagType = item.tagType;
                                        return citem;
                                    })
                                    return item;
                                })

                                setTimeout(() => {
                                    this.detailLineShow = true;
                                    setTimeout(() => {
                                        this.detailShow = true;
                                        var width = $(window).width();
                                        if(width < 768){
                                            $('.tag-courseid').css({'width':'80px', 'margin-bottom':'10px', 'overflow':'hidden', 'text-overflow':'ellipsis', 'white-space':'nowrap'});
                                            $('.tag-course').css({'width':'calc(100% - 90px)', 'margin-bottom':'10px', 'overflow':'hidden', 'text-overflow':'ellipsis', 'white-space':'nowrap'});
                                        }
                                        for(let i in $('.el-card__body')){
                                            $('.el-card__body').eq(i).children('.tag-course:last').css({'margin-bottom':'0'});
                                            if(width < 786){
                                                $('.el-card__body').eq(i).children('.tag-courseid:last').css({'margin-bottom':'0'});
                                            }
                                        }
                                    },500)
                                },500)
                            },500)
                        }
                    }
                })
        },
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
                                this.multipleSelection.splice(0, this.multipleSelection.length);

                                setTimeout(() => {
                                    // 获取最新开课列表
                                    this.handleSelectChange();
                                }, 1000)
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
            this.currentPage = 1;
            this.$refs.upload.clearFiles();
            this.$message({
                message: response.msg,
                type: "success"
            });
            this.multipleSelection.splice(0, this.multipleSelection.length);
            setTimeout(() => {
                // 获取最新开课列表
                this.handleSelectChange();
            }, 1000)
        },
        handleTagSelect(value){
            // 开课选择
            this.classList = this.classList.map(item => {
                if(item.course.courseid == value.courseid){
                    item.class = item.class.map(citem => {
                        if(citem.classid == value.classid){
                            if(citem.tagType != 'info'){
                                citem.tagType = 'info';
                                this.multipleSelection.push({
                                    classid: citem.classid,
                                    schoolTime: citem.schoolYear + '-' + citem.schoolTerm
                                });
                            }
                            else{
                                citem.tagType = item.tagType;
                                var index = this.multipleSelection.findIndex(sitem => {
                                    return sitem.classid == citem.classid;
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
        showClassDetail(course, myclass){
            // 开课详情
            this.detailDialogVisible = true;
            this.classDetail.course = course;
            this.classDetail.class = myclass;
            var session = this.classDetail.class.session.split(';');
            this.classDetail.session.splice(0, this.classDetail.session.length);
            session.forEach(item => {
                if(!this.isEmpty(item)){
                    var weekday = item.split('-')[0];
                    var s = item.split('-')[1];
                    var index = this.classDetail.session.findIndex(citem => {
                        return citem.session == s;
                    })
                    if(index != -1){
                        this.classDetail.session[index][weekday] = true;
                    }
                    else{
                        var option = { session: s };
                        option[weekday] = true;
                        this.classDetail.session.push(option)
                    }
                }
            })
        },
        classDelete(){
            // 开课删除
            var schoolTime = [];
            var classid = [];
            this.multipleSelection.forEach(item => {
                if(schoolTime.indexOf(item.schoolTime) == -1){
                    schoolTime.push(item.schoolTime);
                }
                classid.push(item.classid);
            })
            var now = new Date();
            var start = new Date(this.controllDetail.selectStart);
            var end = new Date(this.controllDetail.selectEnd);
            if(this.isEmpty(this.multipleSelection)){
                this.$message({
                    message: '选项不能为空',
                    type: "error"
                });
            }
            else if(start <= now && now <= end && schoolTime.indexOf(this.controllDetail.schoolYear + '-' + this.controllDetail.schoolTerm) != -1){
                this.$message({
                    message: '所选开课正在进行选课，不能删除',
                    type: "error"
                });
            }
            else{
                var options = {
                    classid: classid
                }
                this.$axios
                    .delete('/api/class', {data: options})
                    .then(res => {
                        if(res.status == 200){
                            var data = res.data;
                            this.$message({
                                message: data.msg,
                                type: "success"
                            });

                            this.multipleSelection.splice(0, this.multipleSelection.length);

                            setTimeout(() => {
                                // 获取最新开课列表
                                this.handleSelectChange();
                            },1000)
                        }
                    })
            }
        },
        progressFormat(percentage){
            // 选课设置
            // 进度条显示
            if(percentage == 0){
                return '选课未开始'
            }
            else if(percentage >= 100){
                return '选课已结束'
            }
            else{
                return '选课进行中'
            }
        },
        classControllSet(){
            // 选课设置
            // 选课情况获取
            this.$axios
                .get('/api/select-controll', {headers: {'showLoading': false}})
                .then(res => {
                    if(res.status == 200){
                        var data = res.data;
                        var now = new Date();
                        var start = new Date(data.selectStart);
                        var end = new Date(data.selectEnd);
                        this.controllDetail = data;
                        if(data.schoolYear == '0'){
                            this.isDisabled = false;
                            this.progressPercentage = 0;
                        }
                        else if(now < start){
                            this.isDisabled = false;
                            this.progressPercentage = 0;
                            this.controllForm = {
                                schoolYear: data.schoolYear,
                                schoolTerm: data.schoolTerm,
                                start2end: [data.selectStart, data.selectEnd],
                                isCapacityLimit: data.isCapacityLimit,
                                isDrop: data.isDrop
                            }
                        }
                        else if(start <= now && now <= end){
                            this.isDisabled = true;
                            this.progressPercentage = ((now - start) / (end - start))*100;
                            this.controllForm = {
                                schoolYear: data.schoolYear,
                                schoolTerm: data.schoolTerm,
                                start2end: [data.selectStart, data.selectEnd],
                                isCapacityLimit: data.isCapacityLimit,
                                isDrop: data.isDrop
                            }
                        }
                        else{
                            this.isDisabled = false;
                            this.progressPercentage = 100;
                        }
                        this.controllDialogVisible = true;
                    }
                })
        },
        submitSet(formName){
            // 选课设置
            var now = new Date();
            var end = new Date(this.controllDetail.selectEnd);
            if(this.controllDetail.schoolYear != '0' && now > end && this.controllDetail.isDrawLots == '0'){
                // 有数据，选课结束，并还未抽签，提醒还未抽签
                this.drawLotsTipIsDisabled = false;
            }
            else{
                this.drawLotsTipIsDisabled = true;
                this.submitControllForm(formName);
            }
        },
        submitControllForm(formName){
            // 选课设置
            this.$refs[formName].validate(valid => {
                if(valid){
                    this.controllForm.selectStart = this.controllForm.start2end[0];
                    this.controllForm.selectEnd = this.controllForm.start2end[1];
                    var options = {
                        schoolYear: this.controllForm.schoolYear,
                        schoolTerm: this.controllForm.schoolTerm,
                        page: 1,
                        size: 1
                    }
                    this.$axios
                        .get('/api/class', {headers: {'showLoading': false}, params: options})
                        .then(res => {
                            if(res.status == 200){
                                var data = res.data;
                                if(data.count == 0){
                                    this.$message({
                                        message: "该学期没有开课，选课设置失败！",
                                        type: "error"
                                    });
                                }
                                else{
                                    this.$axios
                                        .post('/api/select-controll', this.controllForm)
                                        .then(res => {
                                            if(res.status == 200){
                                                var data = res.data;
                                                this.$message({
                                                    message: data.msg,
                                                    type: "success"
                                                });
                                                this.controllDialogVisible = false;
                                            }
                                        })
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
        drawLots(){
            // 课程抽签
            if(this.controllDetail.isDrawLots == '1'){
                this.$message({
                    message: "上一阶段选课已抽过签！",
                    type: "error"
                });
            }
            else{
                // 访问抽签接口
                
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
        this.classSelectAddForm.schoolYear = nowYear.toString() + '-' + (nowYear + 1).toString();
        this.controllForm.schoolYear = nowYear.toString() + '-' + (nowYear + 1).toString();
        this.filterSchoolYear = [nowYear.toString() + '-' + (nowYear + 1).toString(), '1'];

        // 时间选择设置
        var week = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
        var type = ['', 'success', 'info', 'danger', 'warning'];
        week.forEach((item, index) => {
            this.weekday.push({
                label: item,
                type: type[index%5]
            })
        })

        var options = {
            schoolYear: nowYear.toString() + '-' + (nowYear + 1).toString(),
            schoolTerm: '1',
            page: this.currentPage,
            size: this.listPageSize
        }
        this.$axios
            .get('/api/class', {headers: {'showLoading': false}, params: options})
            .then(res => {
                if(res.status == 200){
                    if(this.isEmpty(res.data)){
                        this.$message({
                            message: '当前学期没有开课',
                            type: "error"
                        });
                    }
                    else{
                        this.listTotal = res.data.count;
                        this.classList = res.data.data;
                        var color = ['#a0cfff', '#b3e19d', '#f3d19e', '#fab6b6'];
                        var tagType = ['', 'success', 'danger', 'warning'];

                        this.classList.map((item, index) => {
                            item.tagType = tagType[index%4];
                            item.color = color[index%4];
                            item.class.map(citem => {
                                citem.tagType = item.tagType;
                                return citem;
                            })
                            return item;
                        })

                        this.detailLineShow = true;
                        this.detailShow = true;
                        setTimeout(() => {
                            var width = $(window).width();
                            if(width < 768){
                                $('.tag-courseid').css({'width':'80px', 'margin-bottom':'10px', 'overflow':'hidden', 'text-overflow':'ellipsis', 'white-space':'nowrap'});
                                $('.tag-course').css({'width':'calc(100% - 90px)', 'margin-bottom':'10px', 'overflow':'hidden', 'text-overflow':'ellipsis', 'white-space':'nowrap'});
                            }
                            for(let i in $('.el-card__body')){
                                $('.el-card__body').eq(i).children('.tag-course:last').css({'margin-bottom':'0'});
                                if(width < 786){
                                    $('.el-card__body').eq(i).children('.tag-courseid:last').css({'margin-bottom':'0'});
                                }
                            }
                        },0)
                    }
                }
            })

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

        // 选课情况获取
        this.$axios
            .get('/api/select-controll', {headers: {'showLoading': false}})
            .then(res => {
                if(res.status == 200){
                    var data = res.data;
                    var now = new Date();
                    var start = new Date(data.selectStart);
                    var end = new Date(data.selectEnd);
                    this.controllDetail = data;
                    if(data.schoolYear == '0'){
                        this.isDisabled = false;
                        this.progressPercentage = 0;
                    }
                    else if(now < start){
                        this.isDisabled = false;
                        this.progressPercentage = 0;
                        this.controllForm = {
                            schoolYear: data.schoolYear,
                            schoolTerm: data.schoolTerm,
                            start2end: [data.selectStart, data.selectEnd],
                            isCapacityLimit: data.isCapacityLimit,
                            isDrop: data.isDrop
                        }
                    }
                    else if(start <= now && now <= end){
                        this.isDisabled = true;
                        this.progressPercentage = ((now - start) / (end - start))*100;
                        this.controllForm = {
                            schoolYear: data.schoolYear,
                            schoolTerm: data.schoolTerm,
                            start2end: [data.selectStart, data.selectEnd],
                            isCapacityLimit: data.isCapacityLimit,
                            isDrop: data.isDrop
                        }
                    }
                    else{
                        this.isDisabled = false;
                        this.progressPercentage = 100;
                    }
                }
            })

        setTimeout(() => {
            var width = $(window).width();
            if(width < 768){
                this.addDialogFullScreen = true;
                this.pageSmall = true;
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
            else if(width > 991 && width - 186 - 80 - 98*5 - 50 < 221.4){
                var elcascaderWidth = width - 186 - 80 - 98*5 - 50;
                $('.classSelectTop .el-cascader').css({'width':elcascaderWidth.toString()});
            }
            else if(width - 80 - 98*5 - 50 < 221.4){
                var elcascaderWidth = width - 80 - 98*5 - 50;
                $('.classSelectTop .el-cascader').css({'width':elcascaderWidth.toString()});
            }
        }, 0)
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
    .classSelectXsTop .el-cascader{
        margin-top: 10px;
        width: 100%;
    }
    .classSelectDetail .tag-courseid{
        width: 130px;
        cursor:pointer;
    }
    .classSelectDetail .tag-capacity{
        margin-left: 10px;
        width: 70px;
        cursor:pointer;
    }
    .classSelectDetail .tag-course{
        margin-bottom: 10px;
        margin-left: 10px;
        width: calc(100% - 220px);
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
    .controllForm .el-cascader{
        width: 100%;
    }
    .controllForm .el-select{
        width: 100%;
    }
    .controllForm .el-range-editor{
		width: 100%;
	}
    .controllForm .submit_btn{
		width: calc(50% - 5px);
	}
</style>
<template>
    <div class="courseSelect">
        <el-row class="courseSelectTop hidden-xs-only">
            <el-button type="primary" plain @click="courseTable()">课表查看</el-button>
            <el-cascader v-model="filterMajor" :options="majorList" @change="handleSelectChange" :show-all-levels="false" clearable placeholder="非计划内选课"></el-cascader>
        </el-row>
        <el-row class="courseSelectXsTop hidden-sm-and-up">
            <el-button type="primary" plain @click="courseTable()">课表查看</el-button>
            <el-cascader v-model="filterMajor" :options="majorList" @change="handleSelectChange" :show-all-levels="false" clearable placeholder="非计划内选课"></el-cascader>
        </el-row>
        <el-timeline style="margin-top: 30px;">
            <template v-for="(item, index) in classList">
                <el-timeline-item :key="item.courseid" :color="item.color">
                    <el-tag :type="item.type" @click="showClass(index)">({{ item.courseid }}){{ item.name }}</el-tag>
                    <el-tag :type="item.type" effect="plain" class="hidden-xs-only tag-assist" @click="showClass(index)">{{ item.credit }}</el-tag>
                    <el-tag :type="item.type" effect="plain" class="hidden-xs-only tag-assist" @click="showClass(index)">{{ item.classHour }}</el-tag>
                    <el-collapse-transition>
                        <div v-show="item.show">
                            <div v-for="citem in item.children" :key="'c' + citem.classid" @click="showClassDetail(item, citem)">
                                <el-card shadow="hover" :style="'margin-bottom: 10px; background-color: ' + citem.color">
                                    <el-row>
                                        <el-col :span="4" :xs="{span: 6}">
                                            {{ citem.teacher.name }}
                                        </el-col>
                                        <el-col :span="4" :xs="{span: 6}">
                                            {{ citem.capacityReal }}/{{ citem.capacityLimit }}
                                        </el-col>
                                        <el-col :span="16" :xs="{span: 12}" class="hiddenOutLine">
                                            {{ citem.session }}
                                        </el-col>
                                    </el-row>
                                </el-card>
                            </div>
                        </div>
                    </el-collapse-transition>
                </el-timeline-item>
            </template>
        </el-timeline>
        <el-pagination
            layout="prev, pager, next"
            @current-change="handleCurrentChange"
            :small="pageSmall"
            :hide-on-single-page="true"
            :current-page.sync="currentPage"
            :page-size="listPageSize"
            :total="listTotal">
        </el-pagination>

        <!-- 课程详情 -->
        <el-dialog
			:visible.sync="classDialogVisible"
			:fullscreen="true"
			title="课程详情"
			center>
			<el-row class="classDetail">
                <el-col :span="24" :offset="0" :lg='{span: 16, offset: 4}'>
                    <el-card>
                        <el-row :gutter="20">
                            <el-col :span="12" :xs="{span: 0}">
                                <img style="width: 100%; height: 100%;" :src="'http://127.0.0.1:5000/api/class/img/' + classDetail.img">
                            </el-col>
                            <el-col :span="12" :xs="{span: 24}" class="detailContain">
                                <el-row class="title">
                                    {{ classDetail.course.name }}
                                </el-row>
                                <el-row>
                                    <div class="assist">
                                        <p>课程号：{{ classDetail.course.courseid }}</p>
                                        <p>学分：{{ classDetail.course.credit }}</p>
                                        <p>课时：{{ classDetail.course.classHour }}</p>
                                        <p>上课时间：{{ classDetail.session }}</p>
                                    </div>
                                </el-row>
                                <el-row>
                                    <el-button v-show="selectBtnShow" @click="selectClass()" type="primary" plain style="width: 100px;">选 课</el-button>
                                    <el-button v-show="!selectBtnShow" @click="deleteClass()" type="danger" plain style="width: 100px; margin-left: 0;">退 课</el-button>
                                    <span class="tail">已有{{ classDetail.capacityReal }}人选课，容量上限为{{ classDetail.capacityLimit }}</span>
                                </el-row>
                            </el-col>
                        </el-row>
                    </el-card>
                    <el-card style="margin-top: 10px;">
                        <el-tabs v-model="activeName">
                            <el-tab-pane label="课程信息" name="class" class="markdown-body">
                                <el-divider content-position="left"><i class="el-icon-menu" style="margin-right: 10px; color: #409EFF;"></i>课程概述</el-divider>
                                <p id="courseDescription"></p>
                                <el-divider content-position="left"><i class="el-icon-s-flag" style="margin-right: 10px; color: #409EFF;"></i>课程目标</el-divider>
                                <p id="courseObjectives"></p>
                                <el-divider content-position="left"><i class="el-icon-s-management" style="margin-right: 10px; color: #409EFF;"></i>课程大纲</el-divider>
                                <p id="courseOutline"></p>
                                <el-divider content-position="left"><i class="el-icon-s-order" style="margin-right: 10px; color: #409EFF;"></i>预备知识</el-divider>
                                <p id="preknowledge"></p>
                                <el-divider content-position="left"><i class="el-icon-s-claim" style="margin-right: 10px; color: #409EFF;"></i>参考资料</el-divider>
                                <p id="referenceMaterial"></p>
                            </el-tab-pane>
                            <el-tab-pane label="教师信息" name="teacher" class="userDetailForm">
                                <el-form label-position="left" label-width="100px">
                                    <el-divider content-position="left"><i class="el-icon-s-custom" style="margin-right: 10px; color: #409EFF;"></i>个人信息</el-divider>
                                    <el-form-item label="姓名">
                                        {{ classDetail.teacher.name }}
                                    </el-form-item>
                                    <el-form-item label="性别">
                                        {{ classDetail.teacher.sex }}
                                    </el-form-item>
                                    <el-form-item label="民族">
                                        {{ classDetail.teacher.nation }}
                                    </el-form-item>
                                    <el-form-item label="政治面貌">
                                        {{ classDetail.teacher.politicalStatus }}
                                    </el-form-item>
                                    <el-divider content-position="left"><i class="el-icon-s-opportunity" style="margin-right: 10px; color: #409EFF;"></i>专业信息</el-divider>
                                    <el-form-item label="教育背景">
                                        {{ classDetail.teacher.eduBackground }}
                                    </el-form-item>
                                    <el-form-item label="职称">
                                        {{ classDetail.teacher.professionalTitle }}
                                    </el-form-item>
                                    <el-form-item label="入职时间">
                                        {{ classDetail.teacher.enrol }}
                                    </el-form-item>
                                    <el-divider content-position="left"><i class="el-icon-s-order" style="margin-right: 10px; color: #409EFF;"></i>详细信息</el-divider>
                                    <el-form-item label="个人荣誉">
                                        {{ classDetail.teacher.personalHonor }}
                                    </el-form-item>
                                    <el-form-item label="教学情况">
                                        {{ classDetail.teacher.teachingSituation }}
                                    </el-form-item>
                                    <el-form-item label="科研情况">
                                        {{ classDetail.teacher.scientificSituation }}
                                    </el-form-item>
                                    <el-divider content-position="left"><i class="el-icon-phone" style="margin-right: 10px; color: #409EFF;"></i>联系信息</el-divider>
                                    <el-form-item label="电话">
                                        {{ classDetail.teacher.phone }}
                                    </el-form-item>
                                    <el-form-item label="邮箱">
                                        {{ classDetail.teacher.email }}
                                    </el-form-item>
                                    <el-form-item label="qq">
                                        {{ classDetail.teacher.qq }}
                                    </el-form-item>
                                </el-form>
                            </el-tab-pane>
                            <el-tab-pane label="课表查看" name="courseTable">
                                <course-table 
                                    id="cdcourseTable"
                                    :data="classDetail.sessionData"
                                    :showBackgroundColor="true">
                                </course-table>
                            </el-tab-pane>
                        </el-tabs>
                    </el-card>
				</el-col>
			</el-row>
		</el-dialog>

        <!-- 课表查看 -->
        <el-dialog
            width="760px"
			:visible.sync="courseTableVisible"
			:fullscreen="isFullScreen"
            :before-close="handleCourseTableClose"
			title="课表"
			center>
            <el-row>
                <el-card style="margin-bottom: 10px;">
                    若选课后没有显示，可能是由于还在排队，请稍后重新查看
                </el-card>
                <course-table
                    ref="scourseTable"
                    id="scourseTable"
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
import CourseTable from '../components/CourseTable'

export default {
    components: {
        CourseTable
    },
    props: {},
    data() {
        return {
            user: {},
            selectControll: {},
            classList: [],
            stuSelectClass: [],
            stuSelectSession: [],
            courseTableData: [],
            majorList: [],
            classDetail: {
                course: {},
                teacher: {}
            },
            type: ['', 'success', 'warning', 'danger'],
            color: ['#a0cfff', '#b3e19d', '#f3d19e', '#fab6b6'],
            activeName: 'class',
            filterMajor: '',
            currentPage: 1,
            listTotal: 0,
            listPageSize: 10,
            pageSmall: false,
            classDialogVisible: false,
            courseTableVisible: false,
            isFullScreen: false,
            selectBtnShow: true
        };
    },
    watch: {},
    computed: {},
    methods: {
        handleCurrentChange(val){
            // 切换分页
            this.currentPage = val;
            var options = {
                classid: this.user.classid,
                schoolYear: this.selectControll.schoolYear,
                schoolTerm: this.selectControll.schoolTerm,
                filter: {
                    isFirst: false,
                    isPage: true,
                    page: this.currentPage,
                    size: this.listPageSize
                }
            }
            this.$axios
                .get('/api/course/student', {params: options})
                .then(res => {
                    if(res.status == 200){
                        this.classList = res.data.data;
                        this.classList = this.classList.map((item, index) => {
                            item.type = this.type[index % 4];
                            item.color = this.color[index % 4];
                            item.show = false;
                            item.children = [];
                            return item;
                        })
                    }
                })
        },
        handleSelectChange(){
            // 非计划内选课
            // 获取开课列表
            var options = {
                schoolYear: this.selectControll.schoolYear,
                schoolTerm: this.selectControll.schoolTerm,
                filter: {
                    isFirst: true,
                    isPage: true,
                    page: this.currentPage,
                    size: this.listPageSize
                }
            }
            if(this.isEmpty(this.filterMajor)){
                options.classid = this.user.classid;
            }
            else{
                options.majorid = this.filterMajor[1];
            }
            this.$axios
                .get('/api/course/student', {params: options})
                .then(res => {
                    if(res.status == 200){
                        this.classList = res.data.data;
                        this.listTotal = res.data.count;
                        this.classList = this.classList.map((item, index) => {
                            item.type = this.type[index % 4];
                            item.color = this.color[index % 4];
                            item.show = false;
                            item.children = [];
                            return item;
                        })
                    }
                })
                .catch(err => {
                    this.classList = [];
                    this.listTotal = 0;
                })
        },
        handleCourseTableClose(done){
            // 课表关闭前的操作
            this.$refs.scourseTable.cleanSelect();
            done()
        },
        courseTable(){
            // 课表查看
            // 获取学生选课
            var options = {
                studentid: this.user.userid,
                schoolYear: this.selectControll.schoolYear,
                schoolTerm: this.selectControll.schoolTerm,
            }
            this.$axios
                .get('/api/select', {params: options})
                .then(res => {
                    if(res.status == 200){
                        var myclass = res.data;
                        var courseid = [];
                        myclass.forEach(item => {
                            courseid.push(item.courseid);
                        })
                        this.$axios
                            .get('/api/course/id', {params: {courseid: courseid}})
                            .then(res => {
                                if(res.status == 200){
                                    var course = res.data;
                                    myclass.forEach(item => {
                                        var session = item.session.split(';');
                                        session.forEach(citem => {
                                            if(!this.isEmpty(citem)){
                                                var options = {
                                                    session: citem.split('-')[1]
                                                }
                                                var day = citem.split('-')[0];
                                                var index = course.findIndex(sitem => {
                                                    return sitem.courseid == item.courseid;
                                                })
                                                if(index != -1){
                                                    options[day] = '(' + item.courseid + ')' + course[index].name;
                                                }
                                                this.courseTableData.push(options)
                                            }
                                        })
                                        this.courseTableVisible = true;
                                    })
                                }
                            })
                    }
                })
        },
        showClass(index){
            // 显示开课列表
            if(this.classList[index].show){
                this.classList = this.classList.map((item, cindex) => {
                    item.show = false;
                    return item;
                })
            }
            else{
                var options = {
                    courseid: this.classList[index].courseid,
                    schoolYear: this.selectControll.schoolYear,
                    schoolTerm: this.selectControll.schoolTerm
                }
                this.$axios
                    .get('/api/class/course', {headers: {'showLoading': false}, params: options})
                    .then(res => {
                        if(res.status == 200){
                            var data = res.data;
                            data.sort((a, b) => {
                                if(a.teacherid > b.teacherid){
                                    return 1;
                                }
                                else{
                                    return -1;
                                }
                            })
                            this.classList = this.classList.map((item, cindex) => {
                                if(index == cindex){
                                    item.children = data;
                                    item.children = item.children.map(citem => {
                                        if(this.stuSelectClass.indexOf(citem.classid) != -1){
                                            citem.color = item.color;
                                        }
                                        else{
                                            citem.color = 'white'
                                        }
                                        return citem;
                                    })
                                }
                                item.show = false;
                                return item;
                            })
                            setTimeout(() => {
                                this.classList = this.classList.map((item, cindex) => {
                                    if(index == cindex){
                                        item.show = true;
                                    }
                                    return item;
                                })
                            }, 0)
                        }
                    })
            }
        },
        showClassDetail(item, citem){
            // 显示课程详细信息
            this.classDetail = JSON.parse(JSON.stringify(citem))
            var temp = JSON.parse(JSON.stringify(item))
            delete temp.show
            delete temp.children
            delete temp.type
            delete temp.color
            this.classDetail.course = temp;
            
            var sessionData = this.classDetail.session.split(';');
            this.classDetail.sessionData = [];
            sessionData.forEach(item => {
                if(!this.isEmpty(item)){
                    var detail = item.split('-');
                    var day = detail[0];
                    var session = detail[1];
                    var index = this.classDetail.sessionData.findIndex(citem => {
                        return session == citem.session;
                    })
                    if(index != -1){
                        this.classDetail.sessionData[index][day] = true;
                    }
                    else{
                        var options = {
                            session: session
                        }
                        options[day] = true;
                        this.classDetail.sessionData.push(options);
                    }
                }
            })

            if(this.stuSelectClass.indexOf(this.classDetail.classid) != -1){
                this.selectBtnShow = false;
            }
            else{
                this.selectBtnShow = true;
            }

            this.classDialogVisible = true;
            setTimeout(() => {
                var height = $('.classDetail .detailContain').height();
                $('.classDetail img').height(height);
                $('#courseDescription').empty();
                $('#courseObjectives').empty();
                $('#courseOutline').empty();
                $('#preknowledge').empty();
                $('#referenceMaterial').empty();
                $('#courseDescription').append(new Editor.Parser().parse(this.classDetail.courseDescription));
                $('#courseObjectives').append(new Editor.Parser().parse(this.classDetail.courseObjectives));
                $('#courseOutline').append(new Editor.Parser().parse(this.classDetail.courseOutline));
                $('#preknowledge').append(new Editor.Parser().parse(this.classDetail.preknowledge));
                $('#referenceMaterial').append(new Editor.Parser().parse(this.classDetail.referenceMaterial));
            }, 0)
        },
        selectClass(){
            // 选课
            var flag = true;
            var session = this.classDetail.session.split(';');
            session.forEach(item => {
                if(!this.isEmpty(item) && this.stuSelectSession.indexOf(item) != -1){
                    flag = false;
                }
            })
            if(!flag){
                this.$message({
                    message: '时间冲突，无法选课',
                    type: "error"
                });
            }
            else if(this.selectControll.isCapacityLimit == 1){
                // 限容选课
            }
            else{
                // 不限容选课
                var options = {
                    stuclassid: this.user.classid,
                    studentid: this.user.userid,
                    classid: this.classDetail.classid,
                    teacherid: this.classDetail.teacherid,
                    courseid: this.classDetail.courseid,
                    schoolYear: this.selectControll.schoolYear,
                    schoolTerm: this.selectControll.schoolTerm
                }
                this.$axios
                    .post('/api/select', options, {headers: {'showLoading': false}})
                    .then(res => {
                        if(res.status == 200){
                            this.$message({
                                message: '进入选课队列，请勿重复选课',
                                type: "success"
                            });
                            this.selectBtnShow = false;
                            this.stuSelectClass.push(this.classDetail.classid);
                            var session = this.classDetail.session.split(';');
                            session.forEach(item => {
                                if(!this.isEmpty(item)){
                                    this.stuSelectSession.push(item);
                                }
                            })
                            this.classList = this.classList.map(item => {
                                if(item.courseid == this.classDetail.courseid){
                                    item.children = item.children.map(citem => {
                                        if(citem.classid == this.classDetail.classid){
                                            citem.color = item.color;
                                        }
                                        return citem;
                                    })
                                }
                                return item;
                            })
                        }
                    })
            }
        },
        deleteClass(){
            // 退课
            var options = {
                studentid: this.user.userid,
                classid: this.classDetail.classid
            }
            this.$axios
                .delete('/api/select', {data: options})
                .then(res => {
                    if(res.status == 200){
                        this.$message({
                            message: '进入退课队列，请勿重复退课',
                            type: "success"
                        });
                        this.selectBtnShow = true;
                        var index = this.stuSelectClass.indexOf(this.classDetail.classid);
                        this.stuSelectClass.splice(index, 1);
                        var session = this.classDetail.session.split(';');
                        session.forEach(item => {
                            var index = this.stuSelectSession.indexOf(item);
                            if(index != -1){
                                this.stuSelectSession.splice(index, 1);
                            }
                        })
                        this.classList = this.classList.map(item => {
                            if(item.courseid == this.classDetail.courseid){
                                item.children = item.children.map(citem => {
                                    if(citem.classid == this.classDetail.classid){
                                        citem.color = 'white';
                                    }
                                    return citem;
                                })
                            }
                            return item;
                        })
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

        // 获取选课控制信息
        this.$axios
            .get('/api/select-controll')
            .then(res => {
                if(res.status == 200){
                    var data = res.data;
                    this.selectControll = data;
                    var start = new Date(data.selectStart);
                    var end = new Date(data.selectEnd);
                    var now = new Date();
                    if(start <= now && now <= end){
                        // 获取学生选课
                        var options = {
                            studentid: this.user.userid,
                            schoolYear: data.schoolYear,
                            schoolTerm: data.schoolTerm,
                        }
                        this.$axios
                            .get('/api/select', {params: options})
                            .then(res => {
                                if(res.status == 200){
                                    res.data.forEach(item => {
                                        this.stuSelectClass.push(item.classid);
                                        var session = item.session.split(';');
                                        session.forEach(citem => {
                                            if(!this.isEmpty(citem)){
                                                this.stuSelectSession.push(citem);
                                            }
                                        })
                                    })
                                }
                                // 获取开课列表
                                var options = {
                                    classid: this.user.classid,
                                    schoolYear: data.schoolYear,
                                    schoolTerm: data.schoolTerm,
                                    filter: {
                                        isFirst: true,
                                        isPage: true,
                                        page: this.currentPage,
                                        size: this.listPageSize
                                    }
                                }
                                this.$axios
                                    .get('/api/course/student', {params: options})
                                    .then(res => {
                                        if(res.status == 200){
                                            this.classList = res.data.data;
                                            this.listTotal = res.data.count;
                                            this.classList = this.classList.map((item, index) => {
                                                item.type = this.type[index % 4];
                                                item.color = this.color[index % 4];
                                                item.show = false;
                                                item.children = [];
                                                return item;
                                            })
                                        }
                                    })
                            })
                    }
                    else{
                        this.$message({
                            message: '当前不在选课时间',
                            type: "error"
                        });
                    }
                }
            })
        
        // 分院获取
        this.$axios
            .get('/api/school/college')
            .then(res => {
                if(res.status == 200){
                    var data = res.data;
                    var tempMajor = [];
                    data.forEach(item => {
                        if(parseInt(item.collegeid) <= 10){
                            var indexMajor = this.majorList.push({
                                value: item.collegeid,
                                label: item.name,
                                children: []
                            })
                            tempMajor[item.collegeid] = indexMajor - 1;
                        }
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
                }
            })

        var width = $(window).width();
        if(width < 768){
            this.pageSmall = true;
            this.isFullScreen = true;
        }
    }
};
</script>

<style scoped>
    .courseSelectTop .el-cascader{
        margin-left: 10px;
    }
    .courseSelectXsTop .el-button{
        width: 100%;
        margin-bottom: 10px;
    }
    .courseSelectXsTop .el-cascader{
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
    .markdown-body>:first-child{
        margin-top: 24px !important;
    }
    .hiddenOutLine{
        overflow: hidden; 
        text-overflow: ellipsis; 
        white-space: nowrap;
    }
    .el-timeline{
        padding-left: 0;
    }
    .el-timeline .el-tag{
        margin-bottom: 10px;
        cursor:pointer;
    }
    .el-timeline .tag-assist{
        margin-left: 10px;
    }
    .classDetail .title{
        font-size: 20px;
    }
    .classDetail .assist{
        margin: 10px 0;
        padding: 10px;
        background-color: #cfe7ff;
    }
    .classDetail .tail{
        position: absolute;
        bottom: 0;
        margin-left: 10px;
        color: grey;
    }
</style>
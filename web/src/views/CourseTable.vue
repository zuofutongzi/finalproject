<template>
    <div class="courseTable">
        <el-row class="courseSelectTop hidden-xs-only">
            <el-cascader v-model="filterSchoolYear" :options="schoolYearSelect" @change="handleSelectChange" :show-all-levels="true" placeholder="学年选择"></el-cascader>
        </el-row>
        <el-row class="courseSelectXsTop hidden-sm-and-up">
            <el-cascader v-model="filterSchoolYear" :options="schoolYearSelect" @change="handleSelectChange" :show-all-levels="true" placeholder="学年选择"></el-cascader>
        </el-row>
        <course-table
            style="margin-top: 10px;"
            ref="classCourseTable"
            id="classCourseTable"
            v-model="clickClass"
            :data="courseTableData"
            :showBackgroundColor="true">
        </course-table>

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
            schoolYearSelect: [],
            courseTableData: [],
            filterSchoolYear: '',
            activeName: 'class',
            classDetail: {
                course: {},
                teacher: {}
            },
            clickClass: {},
            classDialogVisible: false
        };
    },
    watch: {},
    computed: {},
    methods: {
        handleSelectChange(){
            // 学年选择切换
            this.courseTableData = [];
            var options = {
                studentid: this.user.userid,
                schoolYear: this.filterSchoolYear[0],
                schoolTerm: this.filterSchoolYear[1]
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
                                                    options[day+'_classid'] = item.classid;
                                                }
                                                this.courseTableData.push(options)
                                            }
                                        })
                                    })
                                }
                            })
                    }
                })
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
            userid: this.user.userid,
            identity: 'student'
        }
        this.$axios
            .get('/api/user/' + this.user.userid, {params: options})
            .then(res => {
                if(res.status == 200){
                    var data = res.data;
                    // 开课学年选择器设置
                    var enrol = parseInt(data.enrol);
                    var nowYear = (new Date()).getFullYear();
                    for(var i = 0; i < 4; i++){
                        this.schoolYearSelect.push({
                            value: (enrol+i).toString() + '-' + (enrol+i+1).toString(),
                            label: (enrol+i).toString() + '-' + (enrol+i+1).toString(),
                            children: [{
                                value: '1',
                                label: '1'
                            },{
                                value: '2',
                                label: '2'
                            }]
                        });
                    }
                }
            })
    },
    watch: {
        clickClass(){
            if(this.clickClass.classid){
                var options = {
                    classid: this.clickClass.classid
                }
                this.$axios
                    .get('/api/class/id', {headers: {'showLoading': false}, params: options})
                    .then(res => {
                        if(res.status == 200){
                            var data = res.data;
                            this.showClassDetail(data.course, data);
                        }
                    })
            }
        }
    }
};
</script>

<style scoped>
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
    .classDetail .title{
        font-size: 20px;
    }
    .classDetail .assist{
        margin-top: 10px;
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
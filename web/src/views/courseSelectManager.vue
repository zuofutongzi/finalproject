<template>
    <div class="classSelectManager">
        <el-row class="classSelectTop">
            <el-button type="primary" :size="buttonSize" plain @click="classAdd()">开课添加</el-button>
            <el-button type="success" :size="buttonSize" plain @click="classImport()">开课导入</el-button>
            <el-button type="danger" :size="buttonSize" plain @click="classDelete()">开课删除</el-button>
            <el-button type="primary" :size="buttonSize" plain @click="selectSet()">选课设置</el-button>
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
                        <div style="margin-bottom: 22px;">
                            <el-table
                                border
                                :highlight-current-row="false"
                                :data="courseTable"
                                :row-class-name="tableRowClassName"
                                @cell-click="courseTableCellClick"
                                style="width: 100%">
                                <el-table-column
                                    header-align="center"
                                    align="center"
                                    prop="session"
                                    label=""
                                    width="50">
                                </el-table-column>
                                <el-table-column
                                    header-align="center"
                                    align="center"
                                    prop="Mon"
                                    label="一">
                                </el-table-column>
                                <el-table-column
                                    header-align="center"
                                    align="center"
                                    prop="Tue"
                                    label="二">
                                </el-table-column>
                                <el-table-column
                                    header-align="center"
                                    align="center"
                                    prop="Wed"
                                    label="三">
                                </el-table-column>
                                <el-table-column
                                    header-align="center"
                                    align="center"
                                    prop="Thur"
                                    label="四">
                                </el-table-column>
                                <el-table-column
                                    header-align="center"
                                    align="center"
                                    prop="Fri"
                                    label="五">
                                </el-table-column>
                            </el-table>
                        </div>
                        <el-form-item>
					    	<el-button type="primary" class="submit_btn" @click="submitAddForm('addForm')">添加</el-button>
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

export default {
    components: {},
    props: {},
    data() {
        return {
            user: {},
            classSelectAddForm: {
                session: []
            },
            courseList: [],
            teacherList: [],
            schoolYearSelect: [],
            courseTable: [],
            buttonSize: 'medium',
            addDialogFullScreen: false,
            addDialogVisible: false,
            addRules: {}
        };
    },
    watch: {},
    computed: {},
    methods: {
        classAdd(){
            // 开课添加
            this.addDialogVisible = true;

            // 课表内数据重置
            this.courseTable.splice(0, this.courseTable.length);
            for(var i = 1; i <= 12; i++){
                this.courseTable.push({
                    session: i,
                    Mon: false,
                    Tue: false,
                    Wed: false,
                    Thur: false,
                    Fri: false
                })
            }

            // 课表内选中颜色去除
            $('.el-table__row td').css({'background':'transparent'})
        },
        handleCloseAddDialog(done){
            // 开课添加dialog关闭前
            this.classSelectAddForm = {
                course: '',
                teacher: '',
                schoolYear: '',
                schoolTerm: '',
                session: []
            }
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
        tableRowClassName({row, rowIndex}){
            row.index = rowIndex;
        },
        courseTableCellClick(row, column){
            // 课表设置
            var day = ['', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri'];
            var cindex = day.indexOf(column.property);
            if(column.property != 'session'){
                if(this.courseTable[row.index][column.property]){
                    // 取消选择
                    this.courseTable[row.index][column.property] = false;
                    $('.el-table__row').eq(row.index).children('td').eq(cindex).css({'background':'transparent'})
                    var sindex = this.classSelectAddForm.session.indexOf(column.property + '-' + row.session);
                    this.classSelectAddForm.session.splice(sindex, 1);
                }
                else{
                    // 选择
                    this.courseTable[row.index][column.property] = true;
                    $('.el-table__row').eq(row.index).children('td').eq(cindex).css({'background':'#a0cfff'})
                    this.classSelectAddForm.session.push(column.property + '-' + row.session);
                }
            }
        },
        submitAddForm(formName){
            // 开课添加
			this.$refs[formName].validate(valid => {
				if(valid){
                    console.log(this.classSelectAddForm)
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

        var width = $(window).width();
        if(width < 768){
            this.addDialogFullScreen = true;
            var buttonParentWidth = $('.courseSelectTop .el-button').parent().width() - 20;
            var buttonWith = buttonParentWidth/3;
            $('.courseSelectTop .el-button').eq(0).css({'margin-left':'0','width':buttonWith.toString(),'padding':'12px 10px'});
            $('.courseSelectTop .el-button').eq(1).css({'margin-left':'10px','width':buttonWith.toString(),'padding':'12px 10px'});
            $('.courseSelectTop .el-button').eq(2).css({'margin-left':'10px','width':buttonWith.toString(),'padding':'12px 10px'});
            $('.courseSelectTop .el-button').eq(3).css({'margin-left':'0','margin-top':'10px','width':'100%','padding':'12px 10px'});
            var buttonTextWidth = $('.courseSelectTop .el-button span').width();
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
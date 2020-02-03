<template>
    <div class="tgradeManager">
        <el-row class="tgradeManagerTop hidden-xs-only">
            <el-cascader v-model="filterSchoolYear" :options="schoolYearSelect" @change="handleSelectChange" :show-all-levels="true" placeholder="学年选择"></el-cascader>
        </el-row>
        <el-row class="tgradeManagerXsTop hidden-sm-and-up">
            <el-cascader v-model="filterSchoolYear" :options="schoolYearSelect" @change="handleSelectChange" :show-all-levels="true" placeholder="学年选择"></el-cascader>
        </el-row>
        <div v-for="item in classList" :key="'c' + item.classid" @click="getGrade(item)">
            <class-card
                :id="item.classid" 
                :key="item.classid" 
                :data="item">
            </class-card>
        </div>

        <!-- 学生成绩 -->
        <el-dialog
			:visible.sync="editDialogVisible"
			:fullscreen="true"
			title="学生成绩"
			center>
			<el-row class="gradeEdit">
				<el-col :xs='{span: 24}' :sm='{span: 16, offset: 4}'>
                    <!-- <el-divider content-position="left"><span>* </span>导入格式</el-divider>
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
                    </el-upload> -->
                    <el-tabs v-model="activeName" @tab-click="handleClick">
                        <el-tab-pane label="成绩录入" name="edit">
                            <el-table
                                :data="stuList"
                                :row-class-name="tableRowClassName"
                                style="width: 100%">
                                <el-table-column
                                    label="学号"
                                    prop="studentid">
                                </el-table-column>
                                <el-table-column
                                    label="姓名"
                                    prop="name">
                                </el-table-column>
                                <el-table-column
                                    label="成绩">
                                    <template slot-scope="scope">
                                        <el-input v-model="stuGrade[scope.row.index]" @blur="editGrade(scope.row)" :disabled="inputDisabled" placeholder="请输入内容"></el-input>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-tab-pane>
                        <el-tab-pane label="成绩导入" name="import">成绩导入</el-tab-pane>
                    </el-tabs>
				</el-col>
			</el-row>
		</el-dialog>
    </div>
</template>

<script>
import $ from 'jquery'
import ClassCard from '../components/ClassCard'

export default {
    components: {
        ClassCard
    },
    props: {},
    data() {
        var validateGrade = (rule, value, callback) => {
            var reg = /^\d+(\.\d+)?$/;
            if(reg.test(value)){
                callback();
            }
            else{
                callback(new Error('请填写数字'))
            }
        }
        return {
            user: {},
            controllDetail: {},
            classDetail: {},
            schoolYearSelect: [],
            classList: [],
            stuList: [],
            filterSchoolYear: '',
            activeName: 'edit',
            editDialogVisible: false,
            inputDisabled: false,
            stuGrade: []
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
        handleSelectChange(){
            // 学年选择切换
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
        },
        handleClick(){
            // 标签切换
            if(this.activeName == 'edit'){
                this.getGrade(this.classDetail);
            }
            else if(this.activeName == 'import'){

            }
        },
        getGrade(value){
            // 获取学生成绩
            this.classDetail = JSON.parse(JSON.stringify(value));
            var now = new Date();
            var start = new Date(this.controllDetail.gradeStart);
            var end = new Date(this.controllDetail.gradeEnd);
            if(value.schoolYear != this.controllDetail.schoolYear || value.schoolTerm != this.controllDetail.schoolTerm || now < start || now > end){
                this.inputDisabled = true;
            }
            else{
                this.inputDisabled = false;
            }
            var options = {
                classid: value.classid
            }
            this.$axios
                .get('/api/grade/class', {headers: {'showLoading': false}, params: options})
                .then(res => {
                    if(res.status == 200){
                        this.stuList = res.data;
                        this.stuList = this.stuList.sort((a, b) => {
                            if(a.studentid > b.studentid){
                                return 1;
                            }
                            else{
                                return -1;
                            }
                        })
                        this.stuList = this.stuList.map((item, index) => {
                            item.index = index;
                            this.stuGrade[index] = item.grade;
                            return item;
                        })
                        this.editDialogVisible = true;
                    }
                })
        },
        editGrade(row){
            // 修改学生成绩
            if(!this.isEmpty(this.stuGrade[row.index])){
                var reg = /^\d+(\.\d)?$/;
                if(!reg.test(this.stuGrade[row.index])){
                    this.$message({
                        message: '请填写整数或一位小数',
                        type: "error"
                    });
                }
                else{
                    var options = {
                        classid: row.classid,
                        studentid: row.studentid,
                        grade: this.stuGrade[row.index]
                    }
                    this.$axios
                        .post('/api/grade', options, {headers: {'showLoading': false}})
                }
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

        // 获取成绩控制
        this.$axios
            .get('/api/grade/controll')
            .then(res => {
                if(res.status == 200){
                    this.controllDetail = res.data;
                }
            })
        
        // 学年选择器设置
        var options = {
            userid: this.user.userid,
            identity: 'teacher'
        }
        this.$axios
            .get('/api/user/' + this.user.userid, {params: options})
            .then(res => {
                if(res.status == 200){
                    var data = res.data;
                    // 学年选择器设置
                    var enrol = parseInt(data.enrol);
                    var nowYear = (new Date()).getFullYear();
                    for(var i = 0; i <= nowYear - enrol; i++){
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
    }
};
</script>

<style>
    .tgradeManager .tgradeManagerXsTop .el-cascader{
        width: 100%;
    }
    .tgradeManager .el-table .success-row{
        background: #f0f9eb;
    }
</style>
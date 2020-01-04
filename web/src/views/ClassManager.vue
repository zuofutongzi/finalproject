<template>
    <div class="classManager">
        <el-row class="classTop">
            <el-button type="primary" :size="buttonSize" plain @click="classAdd()">班级添加</el-button>
            <el-button type="success" :size="buttonSize" plain @click="classImport()">班级导入</el-button>
            <el-button type="danger" :size="buttonSize" plain @click="classDelete()">班级删除</el-button>
            <el-cascader class="hidden-xs-only" :props="{ checkStrictly: true }" v-model="filterCollege" :options="majorList" @change="handleSelectChange" :show-all-levels="false" clearable placeholder="根据分院专业筛选"></el-cascader>
        </el-row>
        <el-row class="classXsTop">
            <el-cascader class="hidden-sm-and-up" :props="{ checkStrictly: true }" v-model="filterCollege" :options="majorList" @change="handleSelectChange" :show-all-levels="false" clearable placeholder="根据分院专业筛选"></el-cascader>
        </el-row>
        <el-table
            :data="classList"
            :row-class-name="tableRowClassName"
            :row-key="getRowKeys"
            @selection-change="handleSelectionChange"
            ref="multipleTable"
            style="width: 100%">
            <el-table-column
                type="selection"
                width="55"
                :reserve-selection="true">
            </el-table-column>
            <el-table-column
                label="编号"
                prop="classid"
                min-width="60">
            </el-table-column>
            <el-table-column
                label="班级"
                prop="name"
                min-width="60">
            </el-table-column>
            <el-table-column
                label="年级"
                prop="enrol"
                min-width="60">
            </el-table-column>
            <el-table-column
                label="班主任"
                prop="teacher"
                min-width="60">
            </el-table-column>
            <el-table-column
                label="专业"
                prop="major">
            </el-table-column>
            <el-table-column
                label="人数"
                prop="number"
                min-width="50">
            </el-table-column>
        </el-table>
        <el-pagination
            layout="prev, pager, next"
            @current-change="handleCurrentChange"
            :small="pageSmall"
            :hide-on-single-page="true"
            :current-page.sync="currentPage"
            :page-size="listPageSize"
            :total="listTotal">
        </el-pagination>

        <!-- 班级添加 -->
        <el-dialog
			:visible.sync="addDialogVisible"
			title="班级添加"
            :fullscreen="addDialogFullScreen"
			center>
			<el-row class="classAddForm">
				<el-col :md='{span: 16, offset: 4}'>
                    <el-form :model="classAddForm" :rules="addRules" ref="addForm" label-position="left" label-width="80px" class="addForm">
                        <el-form-item label="班级编号" prop="classid">
                            <el-input v-model="classAddForm.classid"></el-input>
                        </el-form-item>
                        <el-form-item label="班级名称" prop="name">
                            <el-input v-model="classAddForm.name"></el-input>
                        </el-form-item>
                        <el-form-item label="专业" prop="major">
                            <el-cascader v-model="classAddForm.major" :options="majorList" @change="classAddMajorChange" :show-all-levels="false"></el-cascader>
                        </el-form-item>
                        <el-form-item label="班主任" prop='teacherid'>
                            <el-select v-model="classAddForm.teacherid" filterable placeholder='请先选择专业'>
                                <el-option
                                    v-for="item in teacherList"
                                    :key="item.userid"
                                    :label="item.name"
                                    :value="item.userid">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="入学年份" prop="enrol">
                            <el-date-picker
                                v-model="classAddForm.enrol"
                                :editable="false"
                                value-format="yyyy"
                                type="year"
                                placeholder="选择年">
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item>
					    	<el-button type="primary" class="submit_btn" @click="submitAddForm('addForm')">添加</el-button>
					  	</el-form-item>
                    </el-form>
				</el-col>
			</el-row>
		</el-dialog>

        <!-- 班级导入dialog -->
        <el-dialog
			:visible.sync="importDialogVisible"
			:fullscreen="true"
			title="班级导入"
			center>
			<el-row class="teacherImport">
				<el-col :xs='{span: 24}' :sm='{span: 16, offset: 4}'>
                    <el-divider content-position="left"><span>* </span>导入格式</el-divider>
                    <el-image :src="require('../assets/teach/table.jpg')"></el-image><br>
                    <el-image :src="require('../assets/teach/class.jpg')"></el-image><br>
                    <p>专业选择如下：</p>
                    <el-tree :data="majorList"></el-tree>
                    <p style="color: red;">班级编号必须由英文或数字组成</p>
                    <el-divider content-position="left">文件导入</el-divider>
					<el-upload
                        class="upload-demo"
                        ref="upload"
                        action="/api/school/class/import"
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

export default {
    components: {},
    props: {},
    data() {
        var validateClassid = (rule, value, callback) => {
            var reg = new RegExp("^[a-zA-Z0-9]+$"); 
            if(reg.test(value)){
                callback();
            }
            else{
                callback(new Error('请填写由英文或数字组成的班级编号'))
            }
        }
        return {
            options: [],
            headers: {
                Authorization: localStorage.eleToken
            },
            user: {},
            loading: null,
            classList: [],
            majorList: [],
            teacherList: [],
            classAddForm: {},
            file: '',
            filterCollege: [],
            multipleSelection: [],
            buttonSize: 'medium',
            currentPage: 1,
            listTotal: 0,
            listPageSize: 10,
            addDialogVisible: false,
            addDialogFullScreen: false,
            importDialogVisible: false,
            pageSmall: false,
            getRowKeys(row){
                return row.classid
            },
            addRules: {
                classid: [
                    {
                        required: true,
                        message: '班级编号不能为空',
                        trigger: 'blur'
                    },
                    {
                        max: 10,
                        message: '长度不超过10个字符',
                        trigger: 'blur'
                    },
                    {
                        validator: validateClassid,
                        trigger: 'blur'
                    }
                ],
                name: [
                    {
                        required: true,
                        message: '班级名称不能为空',
                        trigger: 'blur'
                    },
                    {
                        max: 15,
                        message: '长度不超过15个字符',
                        trigger: 'blur'
                    }
                ],
                major: [
                    {
                        required: true,
                        message: '专业不能为空',
                        trigger: 'change'
                    }
                ],
                teacherid: [
                    {
                        required: true,
                        message: '教师不能为空',
                        trigger: 'change'
                    }
                ],
                enrol: [
                    {
                        required: true,
                        message: '入学年份不能为空',
                        trigger: 'blur'
                    }
                ]
            }
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
        handleCurrentChange(val) {
            // 分页切换
            this.currentPage = val;
            var options = {
                filter: {
                    isFirst: false,
                    isPage: true,
                    page: val,
                    size: this.listPageSize,
                    college: this.filterCollege
                }
            }
            this.$axios
                .get('/api/school/class', {params: options})
                .then(res => {
                    if(res.status == 200){
                        this.classList = res.data.data;
                    }
                })
        },
        handleSelectChange(){
            // 分院筛选切换
            var options = {
                filter: {
                    isFirst: true,
                    isPage: true,
                    page: 1,
                    size: this.listPageSize,
                    college: this.filterCollege
                }
            }
            this.$axios
                .get('/api/school/class', {params: options})
                .then(res => {
                    if(res.status == 200){
                        this.classList = res.data.data;
                        this.listTotal = res.data.count;
                        this.currentPage = 1;
                    }
                })
                .catch(err => {
                    this.classList.splice(0, this.classList.length);
                    this.listTotal = 0;
                    this.currentPage = 1;
                })
        },
        handleSelectionChange(val){
            // 表格选择
            this.multipleSelection = val;
        },
        classAdd(){
            // 班级添加dialog
            this.addDialogVisible = true;
        },
        classAddMajorChange(value){
            // 班级添加dialog
            // 专业选择发生变化时
            var collegeid = value[0];
            var majorid = value[1];
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
                        this.teacherList = this.teacherList.filter(item => {
                            return item.classTeacher == 'false';
                        })
                    }
                })
        },
        submitAddForm(formName){
            // 班级添加
			this.$refs[formName].validate(valid => {
				if(valid){
                    this.classAddForm.majorid = this.classAddForm.major[1];
                    this.$axios
                        .post('/api/school/class', this.classAddForm)
                        .then(res => {
                            if(res.status == 200){
                                var data = res.data;
                                this.$message({
                                    message: data.msg,
                                    type: "success"
                                });
                                this.addDialogVisible = false;
                                this.classAddForm = {
                                    classid: '',
                                    name: '',
                                    teacherid: '',
                                    major: [],
                                    majorid: '',
                                    enrol: ''
                                }

                                var options = {
                                    filter: {
                                        isFirst: true,
                                        isPage: true,
                                        page: 1,
                                        size: this.listPageSize,
                                        college: this.filterCollege
                                    }
                                }
                                var _this = this;
                                setTimeout(function(){
                                   _this.$axios
                                        .get('/api/school/class', {params: options})
                                        .then(res => {
                                            if(res.status == 200){
                                                var data = res.data;
                                                _this.listTotal = data.count;
                                                _this.classList = data.data;
                                            }
                                        })
                                },1000);
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
            // 班级导入dialog
            this.importDialogVisible = true;
        },
        submitUpload() {
            // 班级导入
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

            var options = {
                filter: {
                    isFirst: true,
                    isPage: true,
                    page: 1,
                    size: this.listPageSize
                }
            }
            var _this = this;
            setTimeout(function(){
                _this.$axios
                    .get('/api/school/class', {params: options})
                    .then(res => {
                        if(res.status == 200){
                            var data = res.data;
                            _this.listTotal = data.count;
                            _this.classList = data.data;
                        }
                    })
            },1000);
        },
        classDelete(){
            // 班级删除
            var myclass = [];
            this.multipleSelection.forEach(item => {
                myclass.push(item);
            })
            if(this.isEmpty(myclass)){
				this.$message({
					message: "选项不能为空",
					type: "error"
				});
            }
            var options = {
                myclass: myclass
            }
            this.$axios
                .delete('/api/school/class', {data: options})
                .then(res => {
					if(res.status == 200){
						var data = res.data;
						this.$message({
							message: data.msg,
							type: "success"
						});
                        
                        var options = {
                            filter: {
                                isFirst: true,
                                isPage: true,
                                page: 1,
                                size: this.listPageSize,
                                college: this.filterCollege
                            }
                        }
						var _this = this;
                        setTimeout(function(){
                            _this.$axios
                                .get('/api/school/class', {params: options})
                                .then(res => {
                                    if(res.status == 200){
                                        _this.classList = res.data.data;
                                        _this.listTotal = res.data.count;
                                        _this.currentPage = 1;
                                    }
                                })
                                .catch(err => {
                                    _this.classList.splice(0, _this.classList.length);
                                    _this.listTotal = 0;
                                    _this.currentPage = 1;
                                })
                        },1000);

                        this.$refs.multipleTable.clearSelection();
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
        var options = {
            filter: {
                isFirst: true,
                isPage: true,
                page: 1,
                size: this.listPageSize
            }
        }
        this.$axios
            .get('/api/school/class', {params: options})
            .then(res => {
                if(res.status == 200){
                    var data = res.data;
                    this.listTotal = data.count;
                    this.classList = data.data;
                }
            })
        this.$axios
            .get('/api/school/college')
            .then(res => {
                if(res.status == 200){
                    var data = res.data;
                    var temp = [];
                    data.forEach(item => {
                        var index = this.majorList.push({
                            value: item.collegeid,
                            label: item.name,
                            children: []
                        })
                        temp[item.collegeid] = index - 1;
                    })
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
                                    this.majorList[temp[item.collegeid]].children.push(child);
                                })
                            }
                        })
                }
            })

        var width = $(window).width();
        if(width < 768){
            this.addDialogFullScreen = true;
            this.pageSmall = true;
            var buttonParentWidth = $('.classTop .el-button').parent().width() - 20;
            var buttonWith = buttonParentWidth/3;
            $('.classTop .el-button').eq(0).css({'margin-left':'0','width':buttonWith.toString(),'padding':'12px 10px'});
            $('.classTop .el-button').eq(1).css({'margin-left':'10px','width':buttonWith.toString(),'padding':'12px 10px'});
            $('.classTop .el-button').eq(2).css({'margin-left':'10px','width':buttonWith.toString(),'padding':'12px 10px'});
            var buttonTextWidth = $('.classTop .el-button span').width();
            if(buttonWith-20 < buttonTextWidth){
                this.buttonSize = 'mini';
            }
        }
    }
};
</script>

<style>
    .classManager .el-divider__text{
        font-weight: bolder;
        left: 0 !important;
        padding-left: 0 !important;
    }
    .classManager .el-divider__text span{
        color: red;
    }
    .classManager .el-table .success-row {
        background: #f0f9eb;
    }
    .classManager .tag-group{
        margin-top: 15px;
    }
    .classManager .tag-group__title{
        margin-right: 10px;
    }
    .classManager .el-tag{
        margin-right: 10px;
        margin-bottom: 10px;
    }
    .classManager .classAddForm .el-cascader{
        width: 100%;
    }
    .classManager .classAddForm .el-select{
        width: 100%;
    }
    .classManager .el-date-editor.el-input, .el-date-editor.el-input__inner{
        width: 100%;
    }
    .classManager .submit_btn{
		width: 100%;
	}
    .classManager .classTop .el-cascader{
        margin-left: 10px;
    }
    .classManager .classXsTop .el-cascader{
        margin-top: 10px;
        width: 100%;
    }
</style>
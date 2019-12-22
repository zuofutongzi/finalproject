<template>
    <div class="teacherManager">
        <el-row>
            <el-button type="primary" plain>教师添加</el-button>
            <el-button type="success" plain @click="teacherImport()">教师导入</el-button>
        </el-row>
        <el-table
            :data="userList"
            :row-class-name="tableRowClassName"
            @row-click="handleRowClick"
            style="width: 100%">
            <el-table-column
                label="姓名"
                prop="name">
            </el-table-column>
            <el-table-column
                label="性别"
                prop="sex"
                min-width="50">
            </el-table-column>
            <el-table-column
                label="学院"
                prop="college"
                min-width="100">
            </el-table-column>
            <el-table-column
                label="教育背景"
                prop="eduBackground">
            </el-table-column>
            <el-table-column
                label="职称"
                prop="professionalTitle">
            </el-table-column>
        </el-table>

        <!-- 教师导入dialog -->
        <el-dialog
			:visible.sync="importDialogVisible"
			:fullscreen="true"
			title="教师导入"
			center>
			<el-row class="teacherImport">
				<el-col :xs='{span: 24}' :sm='{span: 16, offset: 4}'>
                    <el-divider content-position="left"><span>* </span>导入格式</el-divider>
                    <el-image :src="require('../assets/teach/table.jpg')"></el-image><br>
                    <el-image :src="require('../assets/teach/teacher.jpg')"></el-image>
                    <el-divider content-position="left">文件导入</el-divider>
					<el-upload
                        class="upload-demo"
                        ref="upload"
                        action="/api/user/import"
                        accept=".xls,.xlsx"
                        :data="uploadOption"
                        :on-error="handleError"
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

        <!-- 教师信息dialog -->
        <el-dialog
			:visible.sync="detailDialogVisible"
            :fullscreen="true"
			title="教师信息"
			center>
			<el-row class="teacherImport">
				<el-col :xs='{span: 24}' :sm='{span: 16, offset: 4}'>
                    <el-collapse v-model="collapse" accordion>
                        <el-collapse-item title="个人信息" name="1">
                            <el-form :model="userDetail" label-position="left" label-width="100px" class="userDetailForm">
                                <el-form-item label="教师编号">
                                    {{ userDetail.userid }}
                                </el-form-item>
                                <el-form-item label="姓名">
                                    {{ userDetail.name }}
                                </el-form-item>
                                <el-form-item label="性别">
                                    {{ userDetail.sex }}
                                </el-form-item>
                                <el-form-item label="民族">
                                    {{ userDetail.nation }}
                                </el-form-item>
                                <el-form-item label="政治面貌">
                                    {{ userDetail.politicalStatus }}
                                </el-form-item>
                            </el-form>
                        </el-collapse-item>
                        <el-collapse-item title="专业信息" name="2">
                            <el-form :model="userDetail" label-position="left" label-width="100px" class="userDetailForm">
                                <el-form-item label="学院">
                                    {{ userDetail.college }}
                                </el-form-item>
                                <el-form-item label="学历">
                                    {{ userDetail.eduBackground }}
                                </el-form-item>
                                <el-form-item label="职称">
                                    {{ userDetail.professionalTitle }}
                                </el-form-item>
                                <el-form-item label="入职时间">
                                    {{ userDetail.enrol }}
                                </el-form-item>
                                <el-form-item label="班主任">
                                    {{ userDetail.classTeacher }}
                                </el-form-item>
                                <el-form-item label="班级">
                                    {{ userDetail.class }}
                                </el-form-item>
                            </el-form>
                        </el-collapse-item>
                        <el-collapse-item title="详细信息" name="3">
                            <el-form :model="userDetail" label-position="left" label-width="100px" class="userDetailForm">
                                <el-form-item label="个人荣誉">
                                    {{ userDetail.personalHonor }}
                                </el-form-item>
                                <el-form-item label="教学情况">
                                    {{ userDetail.teachingSituation }}
                                </el-form-item>
                                <el-form-item label="科研情况">
                                    {{ userDetail.scientificSituation }}
                                </el-form-item>
                            </el-form>
                        </el-collapse-item>
                        <el-collapse-item title="联系方式" name="4">
                            <el-form :model="userDetail" label-position="left" label-width="100px" class="userDetailForm">
                                <el-form-item label="电话">
                                    {{ userDetail.phone }}
                                </el-form-item>
                                <el-form-item label="邮箱">
                                    {{ userDetail.email }}
                                </el-form-item>
                                <el-form-item label="qq">
                                    {{ userDetail.qq }}
                                </el-form-item>
                                <el-form-item label="家庭地址">
                                    {{ userDetail.address }}
                                </el-form-item>
                            </el-form>
                        </el-collapse-item>
                    </el-collapse>
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
        return {
            user: {},
            userList: [],
            userDetail: {},
            uploadOption:{
                identity: 'teacher'
            },
            importDialogVisible: false,
            detailDialogVisible: false,
            collapse: '1',
            loading: null
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
        teacherImport(){
            this.importDialogVisible = true;
        },
        submitUpload() {
            this.$refs.upload.submit();
            this.loading = this.$loading({
                lock: true,
                text: "拼命加载中...",
                background: 'rgba(0,0,0,0.7)'
            });
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
        handleRowClick(row){
			// dialog弹出
            this.detailDialogVisible = true;
            this.userDetail = row;
            if(this.userDetail.classTeacher == 'false'){
                this.userDetail.classTeacher = '否';
                this.userDetail.class = '无'
            }
            else{
                this.userDetail.classTeacher = '是';
            }
		}
    },
    created() {},
    mounted() {
        this.user = this.$store.getters.user;
        // 分页获取
        // var options = {
        //     identity: 'teacher',
        //     filter: {
        //         isPage: true,
        //         page: 1,
        //         size: 20
        //     }
        // }
        var options = {
            identity: 'teacher',
            filter: {
                isPage: false
            }
        }
        this.$axios
            .get('/api/user', {params: options})
            .then(res => {
                if(res.status == 200){
                    this.userList = res.data;
                }
            })
    }
};
</script>

<style>
    .teacherManager .el-divider__text{
        font-weight: bolder;
        left: 0 !important;
        padding-left: 0 !important;
    }
    .teacherManager .el-divider__text span{
        color: red;
    }
    .teacherManager .el-table .success-row {
        background: #f0f9eb;
    }
</style>
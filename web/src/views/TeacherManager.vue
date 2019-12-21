<template>
    <div class="teacherManager">
        <el-row>
            <el-button type="primary" plain>教师添加</el-button>
            <el-button type="success" plain @click="teacherImport()">教师导入</el-button>
        </el-row>

        <el-dialog
			:visible.sync="dialogVisible"
			:fullscreen="true"
			title="教师导入"
			center>
			<el-row class="teacherImport">
				<el-col :xs='{span: 24}' :sm='{span: 16, offset: 4}'>
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
                        <div slot="tip" class="el-upload__tip">只接收.xls/.xlsx文件，上传文件不超过1mb，名称不超过50个字符</div>
                    </el-upload>
				</el-col>
			</el-row>
		</el-dialog>
    </div>
</template>

<script>
export default {
    components: {},
    props: {},
    data() {
        return {
            user: {},
            userDetail: {},
            uploadOption:{
                identity: 'teacher'
            },
            dialogVisible: false,
            loading: null
        };
    },
    watch: {},
    computed: {},
    methods: {
        teacherImport(){
            this.dialogVisible = true;
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
            this.dialogVisible = false;
            this.$refs.upload.clearFiles();
            this.$message({
                message: response.msg,
                type: "success"
			});
        }
    },
    created() {},
    mounted() {
        this.user = this.$store.getters.user;
    }
};
</script>

<style scoped>
</style>
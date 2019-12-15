<template>
    <div class="notifyPublish">
        <el-row class="user">
            <el-col :lg="{span:16,offset:4}" :md="{span:16,offset:4}">
                <el-form :model="notify" ref="notifyForm" class="notifyForm">
                    <el-divider content-position="left"><span>* </span>通知标题</el-divider>
                    <el-form-item prop="title">
                        <el-input v-model="notify.title" placeholder="请输入标题"></el-input>
                    </el-form-item>
                    <el-divider content-position="left"><span>* </span>通知内容</el-divider>
                    <textarea name="editor" id="editor"></textarea>
                    <el-divider content-position="left">附件</el-divider>
                    <el-upload
                        class="upload-demo"
                        ref="upload"
                        action="/api/notify/appendix"
                        accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.zip,.rar"
                        :on-error="handleError"
                        :on-remove="handleRemove"
                        :before-upload="handleBeforUpload"
                        :limit="1"
                        :auto-upload="false">
                        <el-button slot="trigger" size="small" type="success">选取文件</el-button>
                        <!-- <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button> -->
                        <div slot="tip" class="el-upload__tip">上传文件不超过1mb</div>
                    </el-upload>
                    <el-divider content-position="left"></el-divider>
                    <el-form-item>
                        <el-button type="primary" class="submit_btn" @click="submitForm">发布公告</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    components: {},
    props: {},
    data() {
        return {
            mditor: null,
            notify: {
                important: '',
                top: '',
                appendix: '',
                title: '',
                content: '',
                time: ''
            }
        };
    },
    watch: {},
    computed: {},
    methods: {
        submitForm(){
            this.$refs.upload.submit();
            // console.log(this.notify)
			// if(this.isEmpty(this.notify.title)){
            //     this.$message({
            //         message: "标题不能为空！",
            //         type: "error"
            //     });
            // }
            // else if(this.isEmpty(this.mditor.value)){
            //     this.$message({
            //         message: "内容不能为空！",
            //         type: "error"
            //     });
            // }
            // else{
            //     this.notify.content = this.mditor.value;
            //     console.log(this.notify);
            // }
        },
        handleError(err, file, fileList){
            this.$message({
                message: err.message,
                type: "error"
            });
        },
        handleRemove(file, fileList) {
            console.log(file, fileList);
        },
        handleBeforUpload(file){
            this.notify.appendix = file.name;
            console.log("handleBeforUpload")
            console.log(file)
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
        this.mditor =  Mditor.fromTextarea(document.getElementById('editor'));
    }
};
</script>

<style scoped>
    .el-divider__text{
        font-weight: bolder;
        left: 0 !important;
        padding-left: 0 !important;
    }
    span{
        color: red;
    }
</style>
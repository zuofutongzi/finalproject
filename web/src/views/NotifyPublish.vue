<template>
    <div class="notifyPublish">
        <el-row class="user">
            <el-col :lg="{span:16,offset:4}" :md="{span:16,offset:4}">
                <el-form :model="notify" ref="notifyForm" class="notifyForm">
                    <el-divider content-position="left"><span>* </span>通知标题</el-divider>
                    <el-form-item prop="title">
                        <el-input v-model="notify.title" placeholder="标题不超过30个字符"></el-input>
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
                        :on-success="handleSuccess"
                        :on-remove="handleRemove"
                        :on-change="handleChange"
                        :limit="1"
                        :auto-upload="false">
                        <el-button slot="trigger" size="small" type="success">选取文件</el-button>
                        <!-- <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button> -->
                        <div slot="tip" class="el-upload__tip">上传文件不超过1mb,名称不超过50个字符</div>
                    </el-upload>
                    <el-divider content-position="left">通知性质</el-divider>
                    <el-form-item prop="type">
                        <el-checkbox v-model="notify.important" true-label="true" false-label="false">重要公告</el-checkbox>
                        <el-checkbox v-model="notify.top" true-label="true" false-label="false">置顶公告</el-checkbox>
                    </el-form-item>
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
                important: 'false',
                top: 'false',
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
        dateFormat(fmt,date) {   
            var o = {   
                "M+" : date.getMonth()+1,                 //月份   
                "d+" : date.getDate(),                    //日   
                "h+" : date.getHours(),                   //小时   
                "m+" : date.getMinutes(),                 //分   
                "s+" : date.getSeconds(),                 //秒   
                "q+" : Math.floor((date.getMonth()+3)/3), //季度   
                "S"  : date.getMilliseconds()             //毫秒   
            };   
            if(/(y+)/.test(fmt)) {
                fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   
            }    
            for(var k in o) {  
                if(new RegExp("("+ k +")").test(fmt))   
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
            }
            return fmt;   
        },
        submitForm(){
			if(this.isEmpty(this.notify.title)){
                this.$message({
                    message: "标题不能为空！",
                    type: "error"
                });
            }
            else if(this.notify.title.length > 30){
                this.$message({
                    message: "标题不能超过30个字符！",
                    type: "error"
                });
            }
            else if(this.isEmpty(this.mditor.value)){
                this.$message({
                    message: "内容不能为空！",
                    type: "error"
                });
            }
            else{
                this.notify.content = this.mditor.value;
                this.notify.time = this.dateFormat('yyyy-MM-dd hh:mm:ss', new Date());
                this.$axios
                    .post('/api/notify', this.notify)
                    .then(res => {
                        if(res.status == 200){
                            var data = res.data;
                            this.$message({
                                message: data.msg,
                                type: "success"
                            });

                            if(!this.isEmpty(this.notify.appendix)){
                                this.$refs.upload.submit();
                            }

                            this.notify = {
                                important: 'false',
                                top: 'false',
                                appendix: '',
                                title: '',
                                content: '',
                                time: ''
                            }
                            this.mditor.value = '';
                        }
                    })
            }
        },
        handleError(err, file, fileList){
            this.$message({
                message: err.message,
                type: "error"
            });
        },
        handleSuccess(response, file, fileList){
            this.$refs.upload.clearFiles();
        },
        handleRemove(file, fileList) {
            this.notify.appendix = '';
        },
        handleChange(file,fileList){
            if(!this.isEmpty(file) && file.status == 'ready'){
                this.notify.appendix = file.name;
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
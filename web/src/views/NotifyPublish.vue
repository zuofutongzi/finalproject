<template>
    <div class="notifyPublish">
        <el-row class="user">
            <el-col :lg="{span:16,offset:4}" :md="{span:16,offset:4}">
                <el-form :model="notify" ref="notifyForm" class="notifyForm">
                    <el-divider content-position="left">通知标题</el-divider>
                    <el-form-item prop="title">
                        <el-input v-model="notify.title" placeholder="请输入标题"></el-input>
                    </el-form-item>
                    <el-divider content-position="left">通知内容</el-divider>
                    <textarea name="editor" id="editor"></textarea>
                    <el-divider content-position="left">附件</el-divider>
                    <el-upload
                        class="upload-demo"
                        ref="upload"
                        action="/api//notify/appendix"
                        :limit="1"
                        :on-preview="handlePreview"
                        :on-remove="handleRemove"
                        :file-list="fileList"
                        :auto-upload="false">
                        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                        <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
                    </el-upload>
                    <el-divider content-position="left"></el-divider>
                    <el-form-item>
                        <el-button type="primary" class="submit_btn" @click="submitForm('notifyForm')">发布公告</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
const mditor=require('mditor')
export default {
    components: {},
    props: {},
    data() {
        return {
            notify: {
                important: '',
                top: '',
                appendix: '',
                title: '',
                content: '',
                time: ''
            },
            fileList: []
        };
    },
    watch: {},
    computed: {},
    methods: {
        submitUpload(){
            this.$refs.upload.submit();
        }
    },
    created() {},
    mounted() {
        var mditor =  Mditor.fromTextarea(document.getElementById('editor'));
    }
};
</script>

<style scoped>
    .el-divider__text{
        font-weight: bolder;
        left: 0 !important;
        padding-left: 0 !important;
    }
</style>
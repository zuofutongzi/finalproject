<template>
    <div class="classManager">
        <el-row class="classTop">
            <el-button type="primary" :size="buttonSize" plain @click="classAdd()">班级添加</el-button>
            <el-button type="success" :size="buttonSize" plain @click="classImport()">班级导入</el-button>
            <el-button type="danger" :size="buttonSize" plain @click="classDelete()">班级删除</el-button>
        </el-row>
        <el-table
            :data="classList"
            :row-class-name="tableRowClassName"
            style="width: 100%">
            <el-table-column
                label="班级"
                prop="name">
            </el-table-column>
            <el-table-column
                label="年级"
                prop="enrol">
            </el-table-column>
            <el-table-column
                label="班主任"
                prop="teacher">
            </el-table-column>
            <el-table-column
                label="专业"
                prop="major">
            </el-table-column>
            <el-table-column
                label="人数"
                prop="number">
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import $ from 'jquery'

export default {
    components: {},
    props: {},
    data() {
        return {
            classList: [],
            buttonSize: 'medium'
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
        }
    },
    created() {},
    mounted() {
        var width = $(window).width();
        if(width < 768){
            // this.addDialogFullScreen = true;
            // this.pageSmall = true;
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

<style scoped>
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
    .classManager .classAdd .el-select{
        width: 100%;
    }
    .classManager .el-date-editor.el-input, .el-date-editor.el-input__inner{
        width: 100%;
    }
    .classManager .submit_btn{
		width: 100%;
	}
    .classManager .classTop .el-select{
        margin-left: 10px;
    }
    .classManager .classXsTop .el-select{
        margin-top: 10px;
        width: 100%;
    }
</style>
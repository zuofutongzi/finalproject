<template>
    <div class="gradeCheck">
        <el-row class="gradeCheckTop hidden-xs-only">
            <el-cascader v-model="filterSchoolYear" :options="schoolYearSelect" @change="handleSelectChange" :show-all-levels="true" clearable placeholder="学年选择"></el-cascader>
        </el-row>
        <el-row class="gradeCheckXsTop hidden-sm-and-up">
            <el-cascader v-model="filterSchoolYear" :options="schoolYearSelect" @change="handleSelectChange" :show-all-levels="true" clearable placeholder="学年选择"></el-cascader>
        </el-row>
        <el-card style="margin: 10px 0;">
            <el-breadcrumb separator="|">
                <el-breadcrumb-item>必修：{{ credit[0] }}学分</el-breadcrumb-item>
                <el-breadcrumb-item>选修：{{ credit[1] }}学分</el-breadcrumb-item>
                <el-breadcrumb-item>公选：{{ credit[2] }}学分</el-breadcrumb-item>
            </el-breadcrumb>
        </el-card>
        <el-table
            :data="gradeList"
            :row-class-name="tableRowClassName"
            style="width: 100%">
            <el-table-column
                label="课程号"
                prop="courseid">
            </el-table-column>
            <el-table-column
                label="课程名"
                prop="name"
                min-width="100">
            </el-table-column>
            <el-table-column
                label="学分"
                prop="credit"
                min-width="50">
            </el-table-column>
            <el-table-column
                label="成绩"
                prop="grade">
            </el-table-column>
            <el-table-column
                label="类型"
                prop="type">
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
export default {
    components: {},
    props: {},
    data() {
        return {
            user: {},
            schoolYearSelect: [],
            gradeList: [],
            credit: [0, 0, 0],
            filterSchoolYear: []
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
            var options = {
                studentid: this.user.userid,
                schoolYear: this.filterSchoolYear[0],
                schoolTerm: this.filterSchoolYear[1]
            }
            this.$axios
                .get('/api/grade', {params: options})
                .then(res => {
                    if(res.status == 200){
                        this.gradeList = res.data;
                        this.credit = [0, 0, 0];
                        this.gradeList.forEach(item => {
                            if(item.type.indexOf('通识选修') != -1){
                                // 公选
                                this.credit[2] += parseFloat(item.credit);
                            }
                            else if(item.type.indexOf('选修') != -1){
                                // 选修
                                this.credit[1] += parseFloat(item.credit);
                            }
                            else{
                                // 必修
                                this.credit[0] += parseFloat(item.credit);
                            }
                        })
                    }
                })
        }
    },
    created() {},
    mounted() {
        this.user = this.$store.getters.user;

        // 学年选择器设置
        var options = {
            userid: this.user.userid,
            identity: 'student'
        }
        this.$axios
            .get('/api/user/' + this.user.userid, {params: options})
            .then(res => {
                if(res.status == 200){
                    var data = res.data;
                    // 学年选择器设置
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
        
        this.handleSelectChange();
    }
};
</script>

<style>
    .gradeCheck .gradeCheckXsTop .el-cascader{
        width: 100%;
    }
    .gradeCheck .el-table .success-row{
        background: #f0f9eb;
    }
</style>
<template>
    <div class="tcourseManager">
        <el-row class="tcourseManagerTop">
            <el-cascader class="hidden-xs-only" v-model="filterSchoolYear" :options="schoolYearSelect" @change="handleSelectChange" :show-all-levels="true" placeholder="学年选择"></el-cascader>
            <!-- <img style="width: 100px; height: 50px;" src="http://127.0.0.1:5000/api/class/img/default.jpg"> -->
        </el-row>
        <el-row class="tcourseManagerXsTop">
            <el-cascader class="hidden-sm-and-up" v-model="filterSchoolYear" :options="schoolYearSelect" @change="handleSelectChange" :show-all-levels="true" placeholder="学年选择"></el-cascader>
        </el-row>
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
            filterSchoolYear: [],
            currentPage: 1,
            listPageSize: 10,
        };
    },
    watch: {},
    computed: {},
    methods: {
        handleSelectChange(){
            // 学年选择切换

        }
    },
    created() {},
    mounted() {
        this.user = this.$store.getters.user;

        // 开课学年选择器设置
        var nowYear = (new Date()).getFullYear();
        for(var i = 0; i <= nowYear - 1949; i++){
            this.schoolYearSelect.push({
                value: (1949+i).toString() + '-' + (1950+i).toString(),
                label: (1949+i).toString() + '-' + (1950+i).toString(),
                children: [{
                    value: '1',
                    label: '1'
                },{
                    value: '2',
                    label: '2'
                }]
            });
        }
        this.filterSchoolYear = [nowYear.toString() + '-' + (nowYear + 1).toString(), '1'];

        // 获取教师开课列表
        var options = {
            teacherid: this.user.userid,
            schoolYear: this.filterSchoolYear[0],
            schoolTerm: this.filterSchoolYear[1],
            isPage: true,
            page: this.currentPage,
            size: this.listPageSize
        }
        this.$axios
            .get('/api/class/teacher', {params: options})
            .then(res => {
                if(res.status == 200){

                }
            })
    }
};
</script>

<style scoped>
    .tcourseManagerXsTop .el-cascader{
        width: 100%;
    }
</style>
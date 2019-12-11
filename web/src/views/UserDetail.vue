<template>
    <div class="userDetail">
        <el-row>
            <el-col :lg="{span:16,offset:4}" :md="{span:16,offset:4}">
                <el-form :model="userDetail" :rules="rules" ref="loginForm" label-position="left" label-width="80px" class="userDetailForm">
                    <el-divider content-position="left">个人信息</el-divider>
                    <el-form-item label="学号" prop="userid">
                        {{ userDetail.userid }}
                    </el-form-item>
                    <el-form-item label="姓名">
                        {{ userDetail.name }}
                    </el-form-item>
                    <el-form-item label="性别">
                        {{ userDetail.sex }}
                    </el-form-item>
                    <el-form-item label="身份证号">
                        {{ userDetail.IDcard }}
                    </el-form-item>
                    <el-form-item label="出生日期">
                        {{ userDetail.birthday }}
                    </el-form-item>
                    <el-form-item label="学院">
                        {{ userDetail.college }}
                    </el-form-item>
                    <el-form-item label="专业">
                        {{ userDetail.major }}
                    </el-form-item>
                    <el-form-item label="行政班">
                        {{ userDetail.class }}
                    </el-form-item>
                    <el-form-item label="民族">
                        {{ userDetail.nation }}
                    </el-form-item>
                    <el-form-item label="政治面貌">
                        {{ userDetail.politicalStatus }}
                    </el-form-item>
                    <el-form-item label="电话">
                        <el-input v-model="userDetail.phone"></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱">
                        <el-input v-model="userDetail.email"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" class="submit_btn" @click="submitForm('userDetail')">提交</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    components: {},
    data() {
        return {
            userDetail: {
                userid: '31601077',
                name: '姚欢倪',
                sex: '女',
                IDcard: '330302199801214823',
                birthday: '1998-01-21',
                college: '计算机与计算科学学院',
                major: '计算机科学与技术',
                class: '计算机1601',
                nation: '汉族',
                politicalStatus: '团员',
                phone: '',
                email: ''
            },
            rules:{
			}
        };
    },
    watch: {},
    computed: {},
    methods: {},
    created() {},
    mounted() {}
};
</script>

<style scoped>
    .userDetailForm{
        padding-left: 20px;
        padding-right: 20px;
    }
    .el-divider__text{
        font-weight: bolder;
        left: 0 !important;
        padding-left: 0 !important;
    }
    .el-input{
        width: auto;
    }
</style>
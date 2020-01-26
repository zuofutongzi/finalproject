<template>
    <div class="courseSelect">
        <el-row class="courseSelectTop hidden-xs-only"></el-row>
        <el-row class="courseSelectXsTop hidden-sm-and-up"></el-row>
        <el-timeline>
            <template v-for="(item, index) in classList">
                <el-timeline-item :key="item.courseid" :color="item.color">
                    <el-tag :type="item.type" @click="showClass(index)">({{ item.courseid }}){{ item.name }}</el-tag>
                    <el-tag :type="item.type" effect="plain" class="hidden-xs-only tag-assist" @click="showClass(index)">{{ item.credit }}</el-tag>
                    <el-tag :type="item.type" effect="plain" class="hidden-xs-only tag-assist" @click="showClass(index)">{{ item.classHour }}</el-tag>
                    <el-collapse-transition>
                        <div v-show="item.show">
                            <div v-for="citem in item.children" :key="'c' + citem.classid" @click="showClassDetail(item, citem)">
                                <el-card shadow="hover" style="margin-bottom: 10px;">
                                    <el-row>
                                        <el-col :span="4" :xs="{span: 6}">
                                            {{ citem.teacher.name }}
                                        </el-col>
                                        <el-col :span="4" :xs="{span: 6}">
                                            {{ citem.capacityReal }}/{{ citem.capacityLimit }}
                                        </el-col>
                                        <el-col :span="16" :xs="{span: 12}" class="hiddenOutLine">
                                            {{ citem.session }}
                                        </el-col>
                                    </el-row>
                                </el-card>
                            </div>
                        </div>
                    </el-collapse-transition>
                </el-timeline-item>
            </template>
        </el-timeline>
        <el-pagination
            layout="prev, pager, next"
            @current-change="handleCurrentChange"
            :small="pageSmall"
            :hide-on-single-page="true"
            :current-page.sync="currentPage"
            :page-size="listPageSize"
            :total="listTotal">
        </el-pagination>

        <!-- 课程详情 -->
        <el-dialog
			:visible.sync="classDialogVisible"
			:fullscreen="true"
			title="课程详情"
			center>
			<el-row class="classDetail">
                <el-col :span="24" :offset="0" :lg='{span: 16, offset: 4}'>
                    <el-card>
                        <el-row :gutter="20">
                            <el-col :span="12" :xs="{span: 0}">
                                <img style="width: 100%; height: 100%;" :src="'http://127.0.0.1:5000/api/class/img/' + classDetail.img">
                            </el-col>
                            <el-col :span="12" :xs="{span: 24}">
                                <el-row class="title">
                                    {{ classDetail.course.name }}
                                </el-row>
                                <el-row>
                                    <div class="assist">
                                        <p>课程号：{{ classDetail.course.courseid }}</p>
                                        <p>学分：{{ classDetail.course.credit }}</p>
                                        <p>课时：{{ classDetail.course.classHour }}</p>
                                        <p>上课时间：{{ classDetail.session }}</p>
                                    </div>
                                </el-row>
                                <el-row>
                                    <el-button type="primary" plain style="width: 100px;">选 课</el-button>
                                    <span class="tail">已有{{ classDetail.capacityReal }}人选课，容量上限为{{ classDetail.capacityLimit }}</span>
                                </el-row>
                            </el-col>
                        </el-row>
                    </el-card>
                    <el-card style="margin-top: 10px;">
                        <el-tabs v-model="activeName">
                            <el-tab-pane label="课程信息" name="class">用户管理</el-tab-pane>
                            <el-tab-pane label="教师信息" name="teacher">配置管理</el-tab-pane>
                            <el-tab-pane label="课表查看" name="courseTable">角色管理</el-tab-pane>
                        </el-tabs>
                    </el-card>
				</el-col>
			</el-row>
		</el-dialog>
    </div>
</template>

<script>
import $ from 'jquery'
import ClassCard from '../components/ClassCard'

export default {
    components: {
        ClassCard
    },
    props: {},
    data() {
        return {
            user: {},
            selectControll: {},
            classList: [],
            classDetail: {
                course: {}
            },
            type: ['', 'success', 'warning', 'danger'],
            color: ['#a0cfff', '#b3e19d', '#f3d19e', '#fab6b6'],
            activeName: 'class',
            currentPage: 1,
            listTotal: 0,
            listPageSize: 10,
            pageSmall: false,
            classDialogVisible: false
        };
    },
    watch: {},
    computed: {},
    methods: {
        handleCurrentChange(val){
            // 切换分页
            this.currentPage = val;
            var options = {
                classid: this.user.classid,
                schoolYear: this.selectControll.schoolYear,
                schoolTerm: this.selectControll.schoolTerm,
                filter: {
                    isFirst: false,
                    isPage: true,
                    page: this.currentPage,
                    size: this.listPageSize
                }
            }
            this.$axios
                .get('/api/course/student', {params: options})
                .then(res => {
                    if(res.status == 200){
                        this.classList = res.data.data;
                        this.classList = this.classList.map((item, index) => {
                            item.type = this.type[index % 4];
                            item.color = this.color[index % 4];
                            item.show = false;
                            item.children = [];
                            return item;
                        })
                    }
                })
        },
        showClass(index){
            // 显示开课列表
            if(this.classList[index].show){
                this.classList = this.classList.map((item, cindex) => {
                    item.show = false;
                    return item;
                })
            }
            else if(this.isEmpty(this.classList[index].children)){
                var options = {
                    courseid: this.classList[index].courseid,
                    schoolYear: this.selectControll.schoolYear,
                    schoolTerm: this.selectControll.schoolTerm
                }
                this.$axios
                    .get('/api/class/course', {headers: {'showLoading': false}, params: options})
                    .then(res => {
                        if(res.status == 200){
                            var data = res.data;
                            data.sort((a, b) => {
                                if(a.teacherid > b.teacherid){
                                    return 1;
                                }
                                else{
                                    return -1;
                                }
                            })
                            this.classList = this.classList.map((item, cindex) => {
                                if(index == cindex){
                                    item.children = data;
                                }
                                item.show = false;
                                return item;
                            })
                            setTimeout(() => {
                                this.classList = this.classList.map((item, cindex) => {
                                    if(index == cindex){
                                        item.show = true;
                                    }
                                    return item;
                                })
                            }, 0)
                        }
                    })
            }
            else{
                this.classList = this.classList.map((item, cindex) => {
                    if(index == cindex){
                        item.show = true;
                    }
                    else{
                        item.show = false;
                    }
                    return item;
                })
            }
        },
        showClassDetail(item, citem){
            // 显示课程详细信息
            this.classDetail = JSON.parse(JSON.stringify(citem))
            var temp = JSON.parse(JSON.stringify(item))
            delete temp.show
            delete temp.children
            delete temp.type
            delete temp.color
            this.classDetail.course = temp;
            
            this.classDialogVisible = true;
            setTimeout(() => {
                var height = $('.classDetail .el-card__body').height();
                $('.classDetail img').height(height);
            }, 0)
        },
        isEmpty(value){
            return (
                value === undefined ||
                value === null ||
                (typeof value === 'object' && Object.keys(value).length === 0) ||
                (typeof value === 'string' && value.trim().length === 0)
            )
        },
        colorRgb(value){
            var sColor = value.toLowerCase();
            //十六进制颜色值的正则表达式
            var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
            // 如果是16进制颜色
            if (sColor && reg.test(sColor)) {
                if (sColor.length === 4) {
                    var sColorNew = "#";
                    for (var i=1; i<4; i+=1) {
                        sColorNew += sColor.slice(i, i+1).concat(sColor.slice(i, i+1));    
                    }
                    sColor = sColorNew;
                }
                //处理六位的颜色值
                var sColorChange = [];
                for (var i=1; i<7; i+=2) {
                    sColorChange.push(parseInt("0x"+sColor.slice(i, i+2)));    
                }
                return "rgba(" + sColorChange.join(",") + ",0.5)";
            }
            return sColor;
        }
    },
    created() {},
    mounted() {
        this.user = this.$store.getters.user;

        // 获取选课控制信息
        this.$axios
            .get('/api/select/controll')
            .then(res => {
                if(res.status == 200){
                    var data = res.data;
                    this.selectControll = data;
                    var start = new Date(data.selectStart);
                    var end = new Date(data.selectEnd);
                    var now = new Date();
                    if(start <= now && now <= end){
                        // 获取开课列表
                        var options = {
                            classid: this.user.classid,
                            schoolYear: data.schoolYear,
                            schoolTerm: data.schoolTerm,
                            filter: {
                                isFirst: true,
                                isPage: true,
                                page: this.currentPage,
                                size: this.listPageSize
                            }
                        }
                        this.$axios
                            .get('/api/course/student', {params: options})
                            .then(res => {
                                if(res.status == 200){
                                    this.classList = res.data.data;
                                    this.listTotal = res.data.count;
                                    this.classList = this.classList.map((item, index) => {
                                        item.type = this.type[index % 4];
                                        item.color = this.color[index % 4];
                                        item.show = false;
                                        item.children = [];
                                        return item;
                                    })
                                }
                            })
                    }
                    else{
                        this.$message({
                            message: '当前不在选课时间',
                            type: "error"
                        });
                    }
                }
            })

        var width = $(window).width();
        if(width < 768){
            this.pageSmall = true;
        }
    }
};
</script>

<style scoped>
    .hiddenOutLine{
        overflow: hidden; 
        text-overflow: ellipsis; 
        white-space: nowrap;
    }
    .el-timeline{
        padding-left: 0;
    }
    .el-timeline .el-tag{
        margin-bottom: 10px;
        cursor:pointer;
    }
    .el-timeline .tag-assist{
        margin-left: 10px;
    }
    .classDetail .title{
        font-size: 20px;
    }
    .classDetail .assist{
        margin: 10px 0;
        padding: 10px;
        background-color: #cfe7ff;
    }
    .classDetail .tail{
        position: absolute;
        bottom: 0;
        margin-left: 10px;
        color: grey;
    }
</style>
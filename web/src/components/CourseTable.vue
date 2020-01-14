<template>
	<div>
        <el-table
            border
            :data="courseData"
            :row-class-name="tableRowClassName"
            @cell-click="courseTableCellClick"
            :highlight-current-row="false"
            style="width: 100%">
            <el-table-column
                header-align="center"
                align="center"
                prop="session"
                label=""
                width="50">
            </el-table-column>
            <el-table-column
                v-for="item in columns"
                align="center"
                :key="item.prop"
                :prop="item.prop"
                :label="item.label">   
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import $ from 'jquery'

export default{
    name: 'course-table',
    props: {
        topbar: {
            type: Array,
            required: false,
            default: function(){
                return ['一', '二', '三', '四', '五', '六', '日'];
            }
        },
        sidebar: {
            type: Array,
            required: false,
            default: function(){
                return ['1','2','3','4','5','6','7','8','9','10','11','12'];
            }
        },
        data: {
            type: Array,
            required: false,
            default: function(){
                var data = [];
                for(var i = 0; i < this.sidebar.length; i++){
                    // 传入参数格式也如下
                    // session必须和sidebar中的一致
                    data.push({
                        session: (i + 1).toString(),
                        Mon: '',
                        Tue: '',
                        Wed: '',
                        Thur: '',
                        Fri: '',
                        Sat: '',
                        Sun: ''
                    })
                }
                return data;
            }
        },
        selectChangeColor: {
            type: [Boolean, String],
            required: false,
            default: function(){
                return false;
            }
        }
    },
    data(){
        return {
            weekday: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],
            selectData: []
        }
    },
    computed: {
        columns: function(){
            var data = [];
            for(var i = 0; i < this.topbar.length; i++){
                data.push({
                    prop: this.weekday[i],
                    label: this.topbar[i]
                })
            }
            return data;
        },
        courseData: function(){
            var temp = [];

            for(var i in this.sidebar){
                var option = {};
                var index = this.data.findIndex(item => {
                    return item.session == this.sidebar[i];
                })
                if(index != -1){
                    option.session = this.data[i].session;
                    for(let j in this.weekday){
                        if(!this.isEmpty(this.data[i][this.weekday[j]])){
                            option[this.weekday[j]] = this.data[i][this.weekday[j]];
                        }
                        else{
                            option[this.weekday[j]] = '';
                        }
                    }
                }
                else{
                    option.session = this.sidebar[i];
                    for(let j in this.weekday){
                        option[this.weekday[j]] = '';
                    }
                }
                temp.push(option)
            }

            return temp;
        },
        selectTag: function(){
            var temp = [];

            for(var i = 0; i < this.sidebar.length; i++){
                var option = {
                    session: this.sidebar[i]
                };
                for(let j in this.weekday){
                    option[this.weekday[j]] = false;
                }
                temp.push(option)
            }

            return temp;
        },
        selectColor: function(){
            if(typeof(this.selectChangeColor) == 'string'){
                return this.selectChangeColor;
            }
            else if(this.selectChangeColor){
                return '#a0cfff';
            }
            else{
                return false;
            }
        }
    },
    methods: {
        tableRowClassName({row, rowIndex}){
            row.index = rowIndex;
        },
        courseTableCellClick(row, column){
            // 课表设置
            var cindex = this.weekday.indexOf(column.property) + 1;
            if(column.property != 'session'){
                if(this.selectChangeColor){
                    // 开启点击切换颜色
                    // 返回所有切换颜色的格
                    if(this.selectTag[row.index][column.property]){
                        // 取消选择
                        this.selectTag[row.index][column.property] = false;
                        $('.el-table__row').eq(row.index).children('td').eq(cindex).css({'background':'transparent'});
                        var sindex = this.selectData.findIndex(item => {
                            return item.coordinate == column.property + '-' + row.session;
                        })
                        if(sindex != -1){
                            this.selectData.splice(sindex, 1);
                        }
                        this.$emit('input', this.selectData);
                    }
                    else{
                        // 选择
                        this.selectTag[row.index][column.property] = true;
                        $('.el-table__row').eq(row.index).children('td').eq(cindex).css({'background':this.selectColor});
                        this.selectData.push({
                            coordinate: column.property + '-' + row.session, 
                            data: this.courseData[row.index][column.property]
                        })
                        this.$emit('input', this.selectData);
                    }
                }
                else{
                    // 没开启点击切换颜色
                    // 返回点击的格
                    this.selectData = {
                        coordinate: column.property + '-' + row.session,
                        data: this.courseData[row.index][column.property]
                    }
                    this.$emit('input', this.selectData);
                }
            }
        },
        cleanSelect(){
            this.selectData = [];
            this.$emit('input', this.selectData);
            $('.el-table__row td').css({'background':'transparent'})
            for(var i in this.selectTag){
                for(let j in this.weekday){
                    this.selectTag[i][this.weekday[j]] = false;
                }
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
    }
}
</script>

<style>
</style>
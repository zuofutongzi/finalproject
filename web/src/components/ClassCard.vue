<template>
	<div :id="id" class="classCard">
        <el-card>
            <el-row>
                <el-col :span="10" :sm="{span: 6}" class="img">
                    <img style="width: 100%; height: 100%;" :src="img">
                </el-col>
                <el-col :span="14" :sm="{span: 18}" class="detailContain">
                    <el-row class="courseTitle">
                        {{ data.course.name }}
                    </el-row>
                    <el-row class="courseDetail">
                        {{ data.teacher.name }} 
                        <span style="margin-left: 10px;">
                            {{ data.session }}
                        </span>
                    </el-row>
                    <el-row class="courseDescription">
                        {{ data.courseDescription }}
                    </el-row>
                    <el-row class="courseCapacity">
                        <i class="el-icon-user" style="margin-right: 10px;"></i>{{ data.capacityReal }} / {{ data.capacityLimit }}
                    </el-row>
                </el-col>
            </el-row>
        </el-card>
    </div>
</template>

<script>
import $ from 'jquery'

export default{
    name: 'class-card',
    props: {
        id: {
            // 表格唯一标实，方便jquery操作
            type: String,
            required: true
        },
        data: {
            // 数据
            type: Object,
            required: true
        }
    },
    data(){
        return {}
    },
    computed: {
        img: function(){
            return 'http://127.0.0.1:5000/api/class/img/' + this.data.img;
        }
    },
    methods: {
        isEmpty(value){
            return (
                value === undefined ||
                value === null ||
                (typeof value === 'object' && Object.keys(value).length === 0) ||
                (typeof value === 'string' && value.trim().length === 0)
            )
        }
    },
    watch:{},
    mounted() {
        // 样式适应
        var width = $('#' + this.id + '.classCard .img').width();
        var height = width / 2;
        var font = 18;
        if($(window).width() < 768){
            height = width / 1.5;
            $('#' + this.id + '.classCard .courseTitle').css({'font-size': '15px'});
        }
        $('#' + this.id + '.classCard .img').css({'height': height.toString()});
        $('#' + this.id + '.classCard .detailContain').css({'height': height.toString()});
        var cheight = height;
        var length = $('#' + this.id + '.classCard .detailContain').children().length;
        for(let i = 0; i < length; i++){
            if(i !== 2){
                cheight -= $('#' + this.id + '.classCard .detailContain').children().eq(i).height();
            }
        }
        cheight -= 40;
        if(font*3 <= cheight){
            $('#' + this.id + '.classCard .courseDescription').css({'-webkit-line-clamp': '3'});
        }
        else if(font*2 <= cheight && cheight < font*3){
            $('#' + this.id + '.classCard .courseDescription').css({'-webkit-line-clamp': '2'});
        }
        else if(font <= cheight && cheight < font*2){
            $('#' + this.id + '.classCard .courseDescription').css({'-webkit-line-clamp': '1'});
        }
        else{
            $('#' + this.id + '.classCard .courseDescription').css({'display': 'none'});
            var dfont = 15;
            var dheight = height - $('#' + this.id + '.classCard .detailContain').children().eq(0).height();
            dheight -= $('#' + this.id + '.classCard .detailContain').children().eq(3).height();
            dheight -= 10;
            if(dfont*2 <= dheight){
                $('#' + this.id + '.classCard .courseDetail').css({'-webkit-line-clamp': '2'});
            }
            else if(dfont <= dheight && dheight < dfont*2){
                $('#' + this.id + '.classCard .courseDetail').css({'-webkit-line-clamp': '1'});
            }
            else{
                $('#' + this.id + '.classCard .courseDetail').css({'display': 'none'});
            }
        }
    }
}
</script>

<style>
    .classCard {
        cursor: pointer;
        margin-top: 10px;
    }
    .classCard .el-card__body {
        padding: 10px;
    }
    .classCard .img {
        overflow: hidden;
    }
    .classCard .img img {
        transition: all 0.6s;
    }
    .classCard:hover .img img {
        transform: scale(1.2); 
    }
    .classCard .detailContain {
        padding-left: 20px; 
        position: relative;
    }
    .classCard .courseTitle {
        font-size: 18px;
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
    }
    .classCard .courseDetail {
        margin-top: 10px !important;
        font-size: 13px;
        line-height: 15px;
        color: grey;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
    }
    .classCard .courseDescription {
        margin-top: 15px !important;
        margin-bottom: 15px !important;
        font-size: 14px;
        line-height: 18px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
    }
    .classCard .courseDescription:hover {
        color: #409EFF;
    }
    .classCard .courseCapacity {
        position: absolute;
        left: 20px;
        bottom: 0;
        font-size: 13px;
        color: grey;
    }
</style>
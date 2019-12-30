<template>
	<div class="index">
		<HeadNav class='hidden-xs-only'></HeadNav>
		<el-container>
		  	<el-aside class="hidden-sm-and-down" style='width: 186px;'>
  				<LeftMenu :menu='menu'></LeftMenu>
  			</el-aside>
  			<el-main>
  				<SuspensionButton class='hidden-md-and-up' :menu='menu'></SuspensionButton>
  				<div class="main-container">
  					<router-view></router-view>
  				</div>
  			</el-main>
		</el-container>
	</div>
</template>

<script>
import HeadNav from '../components/HeadNav'
import LeftMenu from '../components/LeftMenu'
import SuspensionButton from '../components/SuspensionButton'
import $ from 'jquery'

export default{
	name: 'index',
	components: {
		HeadNav,
		LeftMenu,
		SuspensionButton
	},
	data(){
		return {
			menu: []
		}
	},
	mounted(){
		var identity = this.$store.getters.user.identity;
		switch(identity){
			case 'student':
				this.menu = [
					{
						icon: 'el-icon-house',
						title: '首页',
						path: 'notify'
					},
					{
						icon: 'el-icon-user',
						title: '个人信息',
						path: 'userDetail'
					},
					{
						icon: 'el-icon-notebook-1',
						title: '课表查询',
						path: 'classTable'
					},
					{
						icon: 'el-icon-document-checked',
						title: '成绩查询',
						path: 'gradeCheck'
					},
					{
						icon: 'el-icon-reading',
						title: '选课',
						path: 'selectClass'
					}
				];
				break;
			case 'teacher':
				this.menu = [
					{
						icon: 'el-icon-house',
						title: '首页',
						path: 'notify'
					},
					{
						icon: 'el-icon-user',
						title: '个人信息',
						path: 'teacherDetail'
					},
					{
						icon: 'el-icon-collection',
						title: '班级管理',
						path: 'tclassManager'
					},
					{
						icon: 'el-icon-notebook-2',
						title: '课程管理',
						path: 'tcourseManager'
					},
					{
						icon: 'el-icon-edit',
						title: '成绩管理',
						path: 'gradeManager'
					}
				]
				break;
			case 'manager':
				this.menu = [
					{
						icon: 'el-icon-house',
						title: '首页',
						path: 'notify'
					},
					{
						icon: 'el-icon-tickets',
						title: '通知公告',
						path: 'notifyMenu',
						children: [
						{
							title: '通知发布',
							path: 'notifyPublish'
						},
						{
							title: '通知编辑',
							path: 'notifyEdit'
						}]
					},
					{
						icon: 'el-icon-user',
						title: '人员管理',
						path: 'userMenu',
						children: [
						{
							title: '班级管理',
							path: 'classManager'
						},
						{
							title: '学生管理',
							path: 'studentManager'
						},
						{
							title: '教师管理',
							path: 'teacherManager'
						}]
					},
					{
						icon: 'el-icon-date',
						title: '课程管理',
						path: 'courseManager'
					},
					{
						icon: 'el-icon-edit-outline',
						title: '选课管理',
						path: 'courseSelectManager'
					}
				];
				break;
		}
	},
	methods:{
	}
}
</script>

<style scoped>
	.main-container{
		background-color: white;
		border-radius: 5px;
		padding: 20px;
		box-shadow: 0px 0px 20px #ccc;
	}
</style>
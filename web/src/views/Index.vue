<template>
	<div class="index">
		<HeadNav class='hidden-xs-only'></HeadNav>
		<el-container>
		  	<el-aside class="hidden-xs-only" style='width: 166px;'>
  				<LeftMenu :menu='menu'></LeftMenu>
  			</el-aside>
  			<el-main>
  				<SuspensionButton class='hidden-sm-and-up' :menu='menu'></SuspensionButton>
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
<template>
	<el-row class="left-menu">
		<el-col>
			<el-menu
		      	default-active="2"
		      	class="el-menu-vertical-demo">
		      	<router-link v-for='item in menu' :to='item.path'>
		      		<el-menu-item :index='item.path'>
			      		<i :class='item.icon'></i>
			      		<span slot='title'>{{ item.title }}</span>
			      	</el-menu-item>
		      	</router-link>
		    </el-menu>
		</el-col>
	</el-row>
</template>

<script>
	export default{
		name: 'left-menu',
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
		}
	}
</script>

<style scoped>
	a{
		text-decoration: none;
	}
	.left-menu{
		padding: 20px;
		position: fixed;
	}
	.el-menu{
		border-radius: 5px;
		box-shadow: 0px 0px 20px #ccc;
	}
	.el-menu-item{
		border-radius: 5px;
	}
</style>
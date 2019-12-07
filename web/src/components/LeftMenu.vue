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
		props:{
			menu: {
				type: Array,
				required: true
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
<template>
	<el-row class="left-menu">
		<el-col>
			<el-menu
				:unique-opened="true"
				default-active="2"
				class="el-menu-vertical-demo">
				<template v-for='item in menu'>
					<el-submenu v-if='item.children' :index='item.path' :key='item.path'>
						<template slot="title">
							<i :class="item.icon"></i>
							<span slot="title">{{ item.title }}</span>
						</template>
						<router-link v-for='(citem,cindex) in item.children' :to='citem.path' :key='cindex'>
							<el-menu-item :index='citem.path'>
								<span slot="title">{{ citem.title }}</span>
							</el-menu-item>
						</router-link>
					</el-submenu>
					<template v-if='!item.children'>
						<router-link :to='item.path' :key='item.path'>
							<el-menu-item :index='item.path'>
								<i :class='item.icon'></i>
								<span slot='title'>{{ item.title }}</span>
							</el-menu-item>
						</router-link>
					</template>
				</template>
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

<style>
	.left-menu{
		width: 186px;
		padding: 20px;
		position: fixed;
	}
	.left-menu a{
		text-decoration: none;
	}
	.left-menu .el-menu{
		border-radius: 5px;
		box-shadow: 0px 0px 20px #ccc;
	}
	.left-menu .el-submenu .el-menu{
		box-shadow: 0px 0px 0px transparent;
	}
	.left-menu .el-menu-item{
		border-radius: 5px;
	}
	.left-menu .el-submenu{
		border-radius: 5px;
	}
	.left-menu .el-submenu .el-menu-item{
		min-width: 145px;
	}
	.left-menu .el-submenu__title:hover{
		border-radius: 5px;
	}
</style>
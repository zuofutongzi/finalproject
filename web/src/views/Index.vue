<template>
	<div class="index">
		<HeadNav class='hidden-xs-only'></HeadNav>
		<el-container>
		  	<el-aside class="hidden-xs-only" style='width: 166px;'>
  				<LeftMenu></LeftMenu>
  			</el-aside>
  			<el-main>
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
	import $ from 'jquery'
	
	export default{
		name: 'index',
		components: {
			HeadNav,
			LeftMenu
		}
	}
</script>

<style scoped>
	.main-container{
		background-color: white;
		border-radius: 5px;
		padding: 20px;
		box-shadow: 0px 0px 20px #ccc;
		height: 800px;
	}
</style>
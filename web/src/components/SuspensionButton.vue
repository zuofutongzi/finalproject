<template>
	<div id="block" class='suspensionButton'>
	    <!-- <el-dropdown trigger="click">
	    	<img src="../assets/menu.jpg" class="el-dropdown-link"/>
	      	<el-dropdown-menu slot="dropdown">
	      		<router-link v-for='item in menu' :to='item.path' :key="item.path">
	      			<el-dropdown-item :icon="item.icon">{{ item.title }}</el-dropdown-item>
	      		</router-link>
	      	</el-dropdown-menu>
	    </el-dropdown> -->
		<el-popover
			placement="right"
			trigger="click">
			<el-menu
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
			<img src="../assets/menu.jpg" class="el-dropdown-link" slot="reference"/>
		</el-popover>
  	</div>
</template>

<script>
import LeftMenu from '../components/LeftMenu'

export default {
	components: {
		LeftMenu
	},
	mounted:function () {
		this.drag();
	},
	props:{
		menu: {
			type: Array,
			required: true
		}
	},
	methods:{
		drag(){
			var block = document.getElementById("block");
			var oW,oH;
			// 绑定touchstart事件
			block.addEventListener("touchstart", function(e) {
				var touches = e.touches[0];
				oW = touches.clientX - block.offsetLeft;
				oH = touches.clientY - block.offsetTop;

			},false);
			block.addEventListener("touchmove", function(e) {
				e.preventDefault();
				var touches = e.touches[0];
				var oLeft = touches.clientX - oW;
				var oTop = touches.clientY - oH;
				if(oLeft < 0) {
					oLeft = 0;
				}else if(oLeft > document.documentElement.clientWidth - block.offsetWidth) {
					oLeft = (document.documentElement.clientWidth - block.offsetWidth);
				}else if(oTop<0){
					oTop=0;
				}else if(oTop>document.documentElement.clientHeight-block.offsetHeight){
					oTop=document.documentElement.clientHeight-block.offsetHeight;
				}
				block.style.left = oLeft + "px";
				block.style.top = oTop + "px";
			},false);

			block.addEventListener("touchend", function(e) {
				var endLeft = e.changedTouches[0].pageX;
				if(endLeft> document.documentElement.clientWidth/2){
					block.style.left=(document.documentElement.clientWidth-block.offsetWidth-8)+'px';
				}else if(endLeft<document.documentElement.clientWidth/2){
					block.style.left=5+'px';
				}
			},false);
		}
	}
}
</script>

<style scoped>
	a{
		text-decoration: none;
	}
	img{
    	width: 100%;
    	border-radius: 50%;
    	box-shadow: 0px 0px 20px #c6e2ff;
  	}
  	.suspensionButton {
	    color:#fff;
	    font-size: 0.6rem;
	    text-align: center;
	    line-height: 3rem;
	    width:3rem;
	    height:3rem;
	    position: fixed;
	    right: 2%;
	    top: 20%;
	    /*bottom: 13%;*/
	    border-radius: 50%;
	    z-index: 500;
  	}
  	/* .suspensionButton .el-dropdown{
  		height: 48px;
  	}
  	.suspensionButton .el-icon-arrow-down {
	    font-size: 12px;
  	}
  	.suspensionButton .demonstration {
	    display: block;
	    color: #8492a6;
	    font-size: 14px;
	    margin-bottom: 20px;
  	} */
	.el-menu-item{
		min-width: 0 !important;
	}
	.el-menu{
		border-right-color: transparent;
	}
</style>
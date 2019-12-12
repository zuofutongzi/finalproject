<template>
	<div id="block">
	    <el-dropdown trigger="click">
	    	<img src="../assets/menu.jpg" class="el-dropdown-link"/>
	      	<el-dropdown-menu slot="dropdown">
	      		<router-link v-for='item in menu' :to='item.path' :key="item.path">
	      			<el-dropdown-item :icon="item.icon">{{ item.title }}</el-dropdown-item>
	      		</router-link>
	      	</el-dropdown-menu>
	    </el-dropdown>
  	</div>
</template>

<script>
	export default {
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
	#block img{
    	width: 100%;
    	border-radius: 50%;
    	box-shadow: 0px 0px 20px #c6e2ff;
  	}
  	#block {
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
  	.el-dropdown{
  		height: 48px;
  	}
  	.el-icon-arrow-down {
	    font-size: 12px;
  	}
  	.demonstration {
	    display: block;
	    color: #8492a6;
	    font-size: 14px;
	    margin-bottom: 20px;
  	}
</style>
<template>
	<div class="notify">
		<el-table
		    :data="notifyData"
		    style="width: 100%"
		    :row-class-name="tableRowClassName"
		    @row-click="handleRowClick">
		    <el-table-column
		      	prop="content"
		      	label="通知"
		      	min-width="200">
		    </el-table-column>
		    <el-table-column
		      	prop="time"
		      	label="时间">
		    </el-table-column>
	  	</el-table>
	  	
		<el-dialog
			:title="dialogTitle"
			:visible.sync="dialogVisible"
			:fullscreen="true"
			center>
			<el-row>
				<el-col id="dialogMain" :xs='{span: 24}' :sm='{span: 16, offset: 4}'></el-col>
			</el-row>
		</el-dialog>
	</div>
</template>

<script>
	import $ from 'jquery'
	
	export default{
		name: 'notify',
		data(){
			return {
				notifyData: [],
				dialogVisible: false,
				dialogTitle: ''
			}
		},
		mounted(){
			this.$axios
				.get('/api/notify')
				.then(res => {
					if(res.status == 200){
						this.notifyData = res.data;
						this.notifyData.forEach(item => {
							var index = item.content.lastIndexOf('.');
							item.content = item.content.substring(0,index);
							if(item.top == 'true'){
								item.content = '[置顶]' + item.content;
							}
						})
					}
				})
		},
		methods:{
			tableRowClassName({row}){
		        if (row.important == 'true') {
		          	return 'warning-row';
		        }
		        return '';
	      	},
	      	handleRowClick(row){
	      		var content = row.content;
	      		content = content.replace('[置顶]','');
	      		content += '.md';
	      		
	      		var options = {
	      			content: content
	      		}
	      		this.$axios
	      			.post('/api/notify', options)
	      			.then(res => {
	      				var data = res.data;
	      				if(res.status == 200){
	      					this.dialogTitle = row.content;
	      					this.dialogVisible = true;
	      					data += '<br/><p><strong>相关下载：</strong></p>';
	      					if(!this.isEmpty(row.appendix)){
	      						data += '<a name="file" download="'+row.appendix+'" href="/api/notify/'+row.appendix+'">'+row.appendix+'</a>'
	      					}
	      					// 延迟，解决elementui组件中dialog的懒渲染问题
      						setTimeout(() => {
      							$('#dialogMain').empty();
      							$('#dialogMain').append(data);
      						},0)
	      				}
	      			})
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
	.el-table .warning-row {
	    background: #fde2e2 !important;
  	}
  	.el-dialog{
  		line-height: 30px;
  	}
</style>
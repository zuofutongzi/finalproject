<template>
	<div class="notify">
		<el-table
			class="hidden-xs-only"
		    :data="notifyData"
		    style="width: 100%"
		    :row-class-name="tableRowClassName"
		    @row-click="handleRowClick">
		    <el-table-column
		      	prop="title"
		      	label="通知"
		      	min-width="200">
		    </el-table-column>
		    <el-table-column
		      	prop="time"
		      	label="时间">
		    </el-table-column>
	  	</el-table>

		<el-table
			class="hidden-sm-and-up"
		    :data="notifyData"
		    style="width: 100%"
		    :row-class-name="tableRowClassName"
		    @row-click="handleRowClick">
		    <el-table-column
		      	prop="title"
		      	label="通知"
		      	min-width="200">
		    </el-table-column>
	  	</el-table>
	  	
		<el-dialog
			:title="dialogTitle"
			:visible.sync="dialogVisible"
			:fullscreen="true"
			center>
			<el-row>
				<el-col id="dialogMain" class="markdown-body" :xs='{span: 24}' :sm='{span: 16, offset: 4}'></el-col>
			</el-row>
		</el-dialog>
	</div>
</template>

<script>
import $ from 'jquery'
import Editor from 'mditor'

export default{
	name: 'notify',
	data(){
		return {
			notifyData: [],
			dialogVisible: false,
			dialogTitle: '',
			mditor: null
		}
	},
	mounted(){
		this.$axios
			.get('/api/notify')
			.then(res => {
				if(res.status == 200){
					this.notifyData = res.data;
					this.notifyData.forEach(item => {
						if(item.top == 'true'){
							item.title = '[置顶]' + item.title;
						}
					})
					this.notifyData = this.mySort(this.notifyData);
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
			this.dialogTitle = row.title;
			var data = new Editor.Parser().parse(row.content);
			data += '<br/><p><strong>相关下载：</strong></p>';
			if(!this.isEmpty(row.appendix)){
				data += '<a name="file" download="'+row.appendix+'" href="/api/notify/appendix/'+row.appendix+'">'+row.appendix+'</a>'
			}

			this.dialogVisible = true;
			// 延迟，解决elementui组件中dialog的懒渲染问题
			setTimeout(() => {
				$('#dialogMain').empty();
				$('#dialogMain').append(data);
			},0)
		},
		isEmpty(value){
			return (
				value === undefined ||
				value === null ||
				(typeof value === 'object' && Object.keys(value).length === 0) ||
				(typeof value === 'string' && value.trim().length === 0)
			)
		},
		mySort(array){
			// 置顶放上面，置顶公告中，重要的公告放上面
			// 非置顶公告按时间排序
			array.sort((a, b) => {
				if(a.top == b.top){
					if(a.top == 'true'){
						if(a.important == b.important){
							if(new Date(a.time) == new Date(b.time)){
								return 0
							}
							else if(new Date(a.time) > new Date(b.time)){
								return -1
							}
							else{
								return 1
							}
						}
						else if(a.important > b.important){
							return -1
						}
						else{
							return 1
						}
					}
					else{
						if(new Date(a.time) == new Date(b.time)){
							return 0
						}
						else if(new Date(a.time) > new Date(b.time)){
							return -1
						}
						else{
							return 1
						}
					}
				}
				else if(a.top > b.top){
					return -1
				}
				else{
					return 1
				}
			})
			return array;
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
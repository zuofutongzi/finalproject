<template>
    <div class="notifyEdit">
        <el-row>
            <el-button @click="toggleSelection()">取消选择</el-button>
            <el-button @click="deleteSelection()">删除已选通知</el-button>
        </el-row>
        <el-table
			class="hidden-xs-only"
		    :data="notifyData"
            ref="multipleTable"
		    style="width: 100%"
		    :row-class-name="tableRowClassName"
		    @row-click="handleRowClick"
            @selection-change="handleSelectionChange">
            <el-table-column
                type="selection"
                width="55">
            </el-table-column>
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
            ref="multipleTable"
		    style="width: 100%"
		    :row-class-name="tableRowClassName"
		    @row-click="handleRowClick"
            @selection-change="handleSelectionChange">
            <el-table-column
                type="selection"
                width="55">
            </el-table-column>
		    <el-table-column
		      	prop="title"
		      	label="通知"
		      	min-width="200">
		    </el-table-column>
	  	</el-table>

        <el-dialog
			:visible.sync="dialogVisible"
			:fullscreen="true"
			title="公告修改"
			center>
			<el-row class="user">
				<el-col :xs='{span: 24}' :sm='{span: 16, offset: 4}'>
					<el-form :model="notify" ref="notifyForm" class="notifyForm">
						<el-divider content-position="left"><span>* </span>通知标题</el-divider>
						<el-form-item prop="title">
							<el-input v-model="notify.title" placeholder="标题不超过30个字符"></el-input>
						</el-form-item>
						<el-divider content-position="left"><span>* </span>通知内容</el-divider>
						<textarea name="editor" id="editor"></textarea>
						<el-divider content-position="left">附件</el-divider>
						<el-upload
							class="upload-demo"
							ref="upload"
							action="/api/notify/appendix"
							accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.zip,.rar"
							:on-error="handleError"
							:on-success="handleSuccess"
							:on-remove="handleRemove"
							:on-change="handleChange"
							:file-list="fileList"
							:limit="1"
							:auto-upload="false">
							<el-button slot="trigger" size="small" type="success">选取文件</el-button>
							<!-- <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button> -->
							<div slot="tip" class="el-upload__tip">上传文件不超过1mb,名称不超过50个字符,附件内容变化请重新添加附件</div>
						</el-upload>
						<el-divider content-position="left">通知性质</el-divider>
						<el-form-item prop="type">
							<el-checkbox v-model="notify.important" true-label="true" false-label="false">重要公告</el-checkbox>
							<el-checkbox v-model="notify.top" true-label="true" false-label="false">置顶公告</el-checkbox>
						</el-form-item>
						<el-divider content-position="left"></el-divider>
						<el-form-item>
							<el-button type="primary" class="submit_btn" @click="submitForm">修改公告</el-button>
						</el-form-item>
					</el-form>
				</el-col>
			</el-row>
		</el-dialog>
    </div>
</template>

<script>
import $ from 'jquery'
import Editor from 'mditor'

export default {
    components: {},
    props: {},
    data() {
        return {
            notifyData: [],
            dialogVisible: false,
			multipleSelection: [],
			fileList: [],
			mditor: null,
			newAppendix: false,
            notify: {
				notifyid: '',
                important: 'false',
                top: 'false',
                appendix: '',
                title: '',
                content: '',
                time: ''
            }
        };
    },
    watch: {},
    computed: {},
    methods: {
        toggleSelection(rows) {
            // 取消选择
            this.$refs.multipleTable.clearSelection();
        },
        handleSelectionChange(val) {
            // 选择
            this.multipleSelection = val;
        },
        deleteSelection(){
            // 删除选择内容
			var options = [];
			this.multipleSelection.forEach(item => {
				options.push(parseInt(item.notifyid));
			})

			if(this.isEmpty(options)){
				this.$message({
					message: "选项不能为空",
					type: "error"
				});
			}
			else{
				this.$axios
				.delete('/api/notify', {data: options})
				.then(res => {
					if(res.status == 200){
						var data = res.data;
						this.$message({
							message: data.msg,
							type: "success"
						});

						this.notifyData = this.notifyData.filter(item => {
							return options.indexOf(parseInt(item.notifyid)) == -1;
						})

						this.multipleSelection = [];
					}
				})
			}
        },
        tableRowClassName({row}){
			if (row.important == 'true') {
				return 'warning-row';
			}
			return '';
		},
		handleRowClick(row){
			// dialog弹出
			this.notify.notifyid = row.notifyid;
			this.notify.title = row.title.replace('[置顶]','');
			this.notify.important = row.important;
			this.notify.top = row.top;
			this.notify.appendix = row.appendix;
			if(!this.isEmpty(row.appendix)){
				this.fileList.splice(0);
				this.fileList.push({name: row.appendix});
			}

			this.dialogVisible = true;
			if(this.isEmpty(this.mditor)){
				// 延迟，解决elementui组件中dialog的懒渲染问题
				setTimeout(() => {
					this.mditor =  Mditor.fromTextarea(document.getElementById('editor'));
					this.mditor.value = row.content;
				},0)
			}else{
				this.mditor.value = row.content;
			}
		},
        submitForm(){
			// 访问修改接口
			if(this.isEmpty(this.notify.title)){
                this.$message({
                    message: "标题不能为空！",
                    type: "error"
                });
            }
            else if(this.notify.title.length > 30){
                this.$message({
                    message: "标题不能超过30个字符！",
                    type: "error"
                });
            }
            else if(this.isEmpty(this.mditor.value)){
                this.$message({
                    message: "内容不能为空！",
                    type: "error"
                });
            }
            else{
                this.notify.content = this.mditor.value;
				this.notify.time = this.dateFormat('yyyy-MM-dd hh:mm:ss', new Date());
                this.$axios
                    .put('/api/notify', this.notify)
                    .then(res => {
                        if(res.status == 200){
                            var data = res.data;
                            this.$message({
                                message: data.msg,
                                type: "success"
                            });
							
							if(this.notify.top == 'true'){
								this.notify.title = '[置顶]' + this.notify.title;
							}
							this.notifyData = this.notifyData.map(item => {
								return item.notifyid == this.notify.notifyid ? this.notify : item
							})
							this.notifyData = this.mySort(this.notifyData);

							if(this.newAppendix){
                                this.$refs.upload.submit();
							}
							else{
								this.dialogVisible = false;
							}

                            this.notify = {
								notifyid: '',
                                important: 'false',
                                top: 'false',
                                appendix: '',
                                title: '',
                                content: '',
                                time: ''
                            }
							this.mditor.value = '';
							this.newAppendix = false;
                        }
                    })
            }
        },
        handleError(err, file, fileList){
			// 文件上传失败
            this.$message({
                message: err.message,
                type: "error"
			});
        },
        handleSuccess(response, file, fileList){
			// 文件上传成功
			this.dialogVisible = false;
        },
        handleRemove(file, fileList) {
			// 文件移除
			this.notify.appendix = '';
			this.newAppendix = false;
        },
        handleChange(file,fileList){
			// 文件添加
            if(!this.isEmpty(file) && file.status == 'ready'){
				this.notify.appendix = file.name;
				this.newAppendix = true;
            }
        },
		isEmpty(value){
			return (
				value === undefined ||
				value === null ||
				(typeof value === 'object' && Object.keys(value).length === 0) ||
				(typeof value === 'string' && value.trim().length === 0)
			)
		},
		dateFormat(fmt,date) {   
            var o = {   
                "M+" : date.getMonth()+1,                 //月份   
                "d+" : date.getDate(),                    //日   
                "h+" : date.getHours(),                   //小时   
                "m+" : date.getMinutes(),                 //分   
                "s+" : date.getSeconds(),                 //秒   
                "q+" : Math.floor((date.getMonth()+3)/3), //季度   
                "S"  : date.getMilliseconds()             //毫秒   
            };   
            if(/(y+)/.test(fmt)) {
                fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   
            }    
            for(var k in o) {  
                if(new RegExp("("+ k +")").test(fmt))   
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
            }
            return fmt;   
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
    },
    created() {},
    mounted() {
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
    }
};
</script>

<style scoped>
	.el-divider__text{
        font-weight: bolder;
        left: 0 !important;
        padding-left: 0 !important;
    }
    span{
        color: red;
    }
</style>
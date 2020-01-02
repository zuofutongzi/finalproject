import axios from 'axios'
import { Message,Loading } from 'element-ui'
import _ from 'lodash'
import router from './router'

let loading;
function startLoading(target){
	loading = Loading.service({
		lock: true,
		text: "拼命加载中...",
		background: 'rgba(0,0,0,0.7)',
		target: target || "body"
	});
}

// function endLoading(){
// 	loading.close();
// }

//隐藏loading
function hideLoading() {
	//关闭loading
	toHideLoading();
}

//防抖：将 300ms 间隔内的关闭 loading 便合并为一次。防止连续请求时， loading闪烁的问题。
var toHideLoading = _.debounce(()=>{
	loading.close();
	loading = null;
}, 300);

// 请求拦截
axios.interceptors.request.use(config => {
	// 加载动画
	// startLoading();
	// 判断当前请求是否设置了不显示Loading
	if(config.headers.showLoading !== false){
		startLoading(config.headers.loadingTarget);
	  }
	
	if(localStorage.eleToken){
		// 设置统一的请求header
		config.headers.Authorization = localStorage.eleToken;
	}
	
	return config;
}, error => {
	//判断当前请求是否设置了不显示Loading
	if(config.headers.showLoading !== false){
		hideLoading();
	}
	return Promise.reject(error);
})

// 响应拦截
axios.interceptors.response.use(response => {
	// 结束加载动画
	// endLoading();
	//判断当前请求是否设置了不显示Loading（不显示自然无需隐藏）
	if(response.config.headers.showLoading !== false){
        hideLoading();
    }
	return response;
}, error => {
	// 错误提醒
	// endLoading();
	// 判断当前请求是否设置了不显示Loading（不显示自然无需隐藏）
	if(error.config.headers.showLoading !== false){
        hideLoading();
    }
	
	// 获取错误状态码
	const { status } = error.response;
	if(status == 401){
		Message.error('用户登陆超时，请重新登陆！');
		localStorage.removeItem('eleToken');
		router.push('/login');
	}
	else{
		Message.error(error.response.data);
	}
	
	return Promise.reject(error);
})

export default axios;

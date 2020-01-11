import Vue from 'vue'
import App from './App.vue'
import axios from './http'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'element-ui/lib/theme-chalk/display.css';
import 'element-ui/lib/theme-chalk/base.css';

Vue.use(ElementUI);
Vue.config.productionTip = false
Vue.prototype.$axios = axios;
axios.defaults.withCredentials = true;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

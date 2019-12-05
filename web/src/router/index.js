import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import NotFound from '../views/404.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
  	path: '/login',
		name: 'login',
		component: Login
  },
  {
  	path: '/home',
		name: 'home',
		component: Home
  },
  {
  	path: '*',
		name: '404',
		component: NotFound
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
	const isLogin = localStorage.eleToken ? true : false;
	if(to.path == '/login'){
		next();
	}
	else{
		isLogin ? next() : next('/login');
	}
})

export default router

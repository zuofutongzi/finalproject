import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Index from '../views/Index.vue'
import Notify from '../views/Notify.vue'
import UserDetail from '../views/UserDetail.vue'
import NotifyPublish from '../views/NotifyPublish.vue'
import NotifyEdit from '../views/NotifyEdit.vue'
import TeacherDetail from '../views/TeacherDetail.vue'
import StudentManager from '../views/StudentManager.vue'
import TeacherManager from '../views/TeacherManager.vue'
import ClassManager from '../views/ClassManager.vue'
import CourseManager from '../views/CourseManager.vue'
import CourseScheduleManager from '../views/CourseScheduleManager.vue'
import CourseSelectManager from '../views/CourseSelectManager.vue'
import TcourseManager from '../views/TcourseManager.vue'
import CourseSelect from '../views/CourseSelect.vue'
import CourseTable from '../views/CourseTable.vue'
import TgradeManager from '../views/TgradeManager.vue'
import GradeCheck from '../views/GradeCheck.vue'
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
		path: '/index',
		name: 'index',
		component: Index,
		children: [
			{
				path: '',
				component: Notify
			},
			{
				path: '/notify',
				name: 'notify',
				component: Notify
			},
			{
				path: '/userDetail',
				name: 'userDetail',
				component: UserDetail
			},
			{
				path: '/notifyPublish',
				name: 'notifyPublish',
				component: NotifyPublish
			},
			{
				path: '/notifyEdit',
				name: 'notifyEdit',
				component: NotifyEdit
			},
			{
				path: '/teacherDetail',
				name: 'teacherDetail',
				component: TeacherDetail
			},
			{
				path: '/studentManager',
				name: 'studentManager',
				component: StudentManager
			},
			{
				path: '/teacherManager',
				name: 'teacherManager',
				component: TeacherManager
			},
			{
				path: '/classManager',
				name: 'classManager',
				component: ClassManager
			},
			{
				path: '/courseManager',
				name: 'courseManager',
				component: CourseManager
			},
			{
				path: '/courseScheduleManager',
				name: 'courseScheduleManager',
				component: CourseScheduleManager
			},
			{
				path: '/courseSelectManager',
				name: 'courseSelectManager',
				component: CourseSelectManager
			},
			{
				path: '/tcourseManager',
				name: 'tcourseManager',
				component: TcourseManager
			},
			{
				path: '/courseSelect',
				name: 'courseSelect',
				component: CourseSelect
			},
			{
				path: '/courseTable',
				name: 'courseTable',
				component: CourseTable
			},
			{
				path: '/tgradeManager',
				name: 'tgradeManager',
				component: TgradeManager
			},
			{
				path: '/gradeCheck',
				name: 'gradeCheck',
				component: GradeCheck
			}
		]
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

import Vue from 'vue'
import VueRouter from 'vue-router'
import login from '../components/Login.vue'
import home from '../components/Home.vue'
import welcome from '../components/Welcome.vue'
import users from '../components/user/Users.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: login },
  { 
    path: '/home', 
    component: home, 
    redirect: '/home/welcome', 
    children: [
      { path: '/home/welcome', component: welcome },
      { path: '/home/users', component: users }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to: 将要访问的路径
  // from: 从哪个路径跳转而来
  // next: 放行函数，next()表示放行，next('/login')表示强制跳转
  if (to.path === '/login') return next()
  const token = window.sessionStorage.getItem('token')
  if (token) return next()
  next('/login')
})

export default router

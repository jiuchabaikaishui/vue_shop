import Vue from 'vue'
import VueRouter from 'vue-router'
import login from '../components/Login.vue'
import home from '../components/Home.vue'
import welcome from '../components/Welcome.vue'
import users from '../components/user/Users.vue'
import rights from '../components/power/Rights.vue'
import roles from '../components/power/Roles.vue'
import cate from '../components/goods/Cate.vue'
import params from '../components/goods/Params.vue'
import goods from '../components/goods/List.vue'
import addGoods from '../components/goods/Add.vue'
import orders from '../components/order/Order.vue'
import reports from '../components/report/Report.vue'

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
      { path: '/home/users', component: users },
      { path: '/home/rights', component: rights },
      { path: '/home/roles', component: roles },
      { path: '/home/categories', component: cate },
      { path: '/home/params', component: params },
      { path: '/home/goods', component: goods },
      { path: '/home/addGoods', component: addGoods },
      { path: '/home/orders', component: orders },
      { path: '/home/reports', component: reports }
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

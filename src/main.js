import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'
import ZkTable from 'vue-table-with-tree-grid'

import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

Vue.use(VueQuillEditor)

Vue.component('tree-table', ZkTable)

// 默认地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 请求拦截器，请求在到达服务器之前，先会调用use中的这个回调函数来添加请求头信息
axios.interceptors.request.use(function(config) {
  console.log('request: ', config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 响应拦截器
axios.interceptors.response.use(function(res) {
  console.log('response: ', res)
  return res
})
Vue.prototype.$http = axios

Vue.filter('dateFormatter', (ov) => {
  const date = new Date(ov)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1 + '').padStart(2, '0')
  const d = (date.getDate() + '').padStart(2, '0')
  const hh = (date.getHours() + '').padStart(2, '0')
  const mm = (date.getHours() + '').padStart(2, '0')
  const ss = (date.getHours() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
 
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

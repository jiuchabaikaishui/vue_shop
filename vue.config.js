const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    // 发布模式
    config.when(process.env.NODE_ENV === 'production', config => {
      // 入口函数
      config.entry('app').clear().add('./src/main-prod.js')
      
      // externals 节点中的第三方依赖包，都不会被打包
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })

      config.plugin('html').tap(arg => {
        arg[0].isProd = true
        return arg
      })
    })
    // 开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main-dev.js')

      config.plugin('html').tap(arg => {
        arg[0].isProd = false
        return arg
      })
    })
  }
})

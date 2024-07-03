module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'semi': 0, // 结尾分号
    'indent': 0, // 缩进
    'no-trailing-spaces': 'off', // 不允许尾随空格
    'eol-last': 'off', // 文件末尾需要换行
    'vue/multi-word-component-names': 'off', // 要求组件名称以驼峰格式命名，自定义组件名称应该由多单纯组成，防止和html标签冲突
    'space-before-function-paren': 'off', // 函数参数前加空格
    'no-console': 'off' // 没有控制台输出
  }
}

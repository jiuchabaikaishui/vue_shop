<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据报表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片 -->
        <el-card>
            <div id="main" style="width: 750px; height:400px;"></div>
        </el-card>
    </div>
</template>

<script>
// 只会导出（export default mutations）这个默认的对象返回
// import echarts from 'echarts'

// 将 若干export导出的内容组合成一个对象返回
import * as echarts from 'echarts'

import _ from 'lodash'

export default {
    data() {
        return {
            options: {
                title: {
                    text: '用户来源'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#E9EEF3'
                        }
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [
                    {
                        boundaryGap: false
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ]
            }
        }
    },
    async mounted() {
        const { data: res } = await this.$http.get('reports/type/1')
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success('获取折线图数据成功')

        // 初始化
        const myChart = echarts.init(document.getElementById('main'))

        // 设置配置项
        myChart.setOption(_.merge(this.options, res.data))
    }
}
</script>

<style lang="less" scoped>
</style>

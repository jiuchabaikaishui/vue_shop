<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片 -->
        <el-card>
            <!-- 搜索与添加 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model.trim="queryInfo.query" clearable @clear="getOrderList">
                        <el-button slot="append" icon="el-icon-search" @click="queryOrderList" :disabled="queryInfo.query ? false : true"></el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!-- 用户列表 -->
            <el-table :data="orderList" style="width: 100%" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column  prop="order_number" label="订单编号"></el-table-column>
                <el-table-column prop="order_price" label="订单价格"></el-table-column>
                <el-table-column prop="order_pay" label="是否付款">
                    <template slot-scope="scope">
                        <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
                        <el-tag type="success" v-else>已付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="is_send" label="是否发货"></el-table-column>
                <el-table-column prop="create_time" label="下单时间">
                    <template slot-scope="scope">
                        {{scope.row.create_time | dateFormatter}}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="addressVisible = true"></el-button>
                        <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox(scope.row.order_number)"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[2, 3, 5, 10]" 
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total" background>
            </el-pagination>
            <pre>{{orderList}}</pre>
        </el-card>

        <!-- 修改地址对话框 -->
        <el-dialog title="添加商品分类" :visible.sync="addressVisible" width="50%" @close="addressDialogClosed">
            <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="120px">
                <el-form-item label="省市区/县：" prop="address1">
                    <el-cascader v-model="addressForm.address1" :options="cityData" clearable></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址：" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressVisible = false">取 消</el-button>
                <el-button type="primary" @click="addressConfirm">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 物流进度对话框 -->
        <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
            <el-timeline>
                <el-timeline-item
                v-for="(activity, index) in progressInfo"
                :key="index"
                :color="index === 0 ? '#00ff00' : ''"
                :timestamp="activity.time">
                {{activity.context}}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
import cityData from './citydata.js'

export default {
    data() {
        return {
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 10
            },
            total: 0,
            // 订单列表
            orderList: [],
            // 省市区/县数据
            cityData,
            // 级联选择器属性
            cascaderProps: {
                expandTrigger: 'hover'
            },
            // 修改地址对话框
            addressVisible: false,
            addressForm: {
                address1: [],
                address2: ''
            },
            addressFormRules: {
                address1: [{ required: true, message: '请选择省市区县', trigger: 'change' }],
                address2: [{ required: true, message: '请填写详细地址', trigger: 'blur' }]
            },
            // 物流进度对话框
            progressVisible: false,
            // 物流进度数据
            progressInfo: []
        }
    },
    created() {
        this.getOrderList()
    },
    methods: {
        // 获取订单列表
        async getOrderList() {
            const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success('获取订单列表成功')
            this.orderList = res.data.goods
            this.total = res.data.total
        },
        // 查询订单列表
        queryOrderList() {
            this.queryInfo.pagenum = 1
            this.getOrderList()
        },
        // pagesize 改变
        handleSizeChange(size) {
            console.log('size: ', size);
            this.queryInfo.pagesize = size
            const maxN = parseInt(this.total / this.queryInfo.pagesize + '') + (this.total % this.queryInfo.pagesize > 0 ? 1 : 0)
            this.queryInfo.pagenum = this.queryInfo.pagenum > maxN ? maxN : this.queryInfo.pagenum
            this.getOrderList()
        },
        // 页码值 改变
        handleCurrentChange(num) {
            console.log('num: ', num);
            this.queryInfo.pagenum = num
            this.getOrderList()
        },
        // 关闭修改地址对话框
        addressDialogClosed() {
            // console.log('addressForm: ', this.addressForm);
            this.$refs.addressFormRef.resetFields()
        },
        // 修改地址
        addressConfirm() {
            // console.log('addressForm: ', this.addressForm);
            this.addressVisible = false
        },
        // 展示物流进度对话框
        async showProgressBox(orderNumber) {
            // const { data: res } = await this.$http.get('kuaidi/' + orderNumber)
            // if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            // this.$message.success('获取物流进度成功')
            // this.progressInfo = res.data
            
            const data = `[
                {
                "time": "2018-05-10 09:39:00",
                "ftime": "2018-05-10 09:39:00",
                "context": "已签收,感谢使用顺丰,期待再次为您服务",
                "location": ""
                },
                {
                "time": "2018-05-10 08:23:00",
                "ftime": "2018-05-10 08:23:00",
                "context": "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
                "location": ""
                },
                {
                "time": "2018-05-10 07:32:00",
                "ftime": "2018-05-10 07:32:00",
                "context": "快件到达 [北京海淀育新小区营业点]",
                "location": ""
                },
                {
                "time": "2018-05-10 02:03:00",
                "ftime": "2018-05-10 02:03:00",
                "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
                "location": ""
                },
                {
                "time": "2018-05-09 23:05:00",
                "ftime": "2018-05-09 23:05:00",
                "context": "快件到达 [北京顺义集散中心]",
                "location": ""
                },
                {
                "time": "2018-05-09 21:21:00",
                "ftime": "2018-05-09 21:21:00",
                "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
                "location": ""
                },
                {
                "time": "2018-05-09 13:07:00",
                "ftime": "2018-05-09 13:07:00",
                "context": "顺丰速运 已收取快件",
                "location": ""
                },
                {
                "time": "2018-05-09 12:25:03",
                "ftime": "2018-05-09 12:25:03",
                "context": "卖家发货",
                "location": ""
                },
                {
                "time": "2018-05-09 12:22:24",
                "ftime": "2018-05-09 12:22:24",
                "context": "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
                "location": ""
                },
                {
                "time": "2018-05-08 21:36:04",
                "ftime": "2018-05-08 21:36:04",
                "context": "商品已经下单",
                "location": ""
                }
            ]`
            this.progressInfo = JSON.parse(data)
            this.progressVisible = true
        }
    }
}
</script>

<style lang="less" scoped>
.el-cascader {
    width: 100%;
}
</style>
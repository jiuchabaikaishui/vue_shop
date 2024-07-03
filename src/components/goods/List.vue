<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片 -->
        <el-card>
            <!-- 搜索与添加 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model.trim="queryInfo.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="queryGoodsList" :disabled="queryInfo.query ? false : true"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>

            <!-- 用户列表 -->
            <el-table :data="goodsList" style="width: 100%" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column  prop="goods_name" label="商品名称"></el-table-column>
                <el-table-column prop="goods_price" label="商品价格（元）" width="95"></el-table-column>
                <el-table-column prop="goods_weight" label="商品重量" width="70"></el-table-column>
                <el-table-column prop="add_time" label="创建时间" width="140">
                    <template slot-scope="scope">
                        {{scope.row.add_time | dateFormatter}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
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
            <pre>{{goodsList}}</pre>
        </el-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 获取商品列表接口参数
            queryInfo: {
                query: '', // 搜索内容
                pagenum: 1, // 页面
                pagesize: 10 // 每页显示条数
            },
            // 商品列表数据
            goodsList: [],
            // 商品列表总条数
            total: 0
        }
    },
    created() {
        this.getGoodsList()
    },
    methods: {
        // 获取商品列表数据
        async getGoodsList() {
            const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.goodsList = res.data.goods
            this.total = res.data.total
            this.$message.success('获取商品列表成功')
        },
        // 查询商品
        queryGoodsList() {
            this.queryInfo.pagenum = 1
            this.getGoodsList()
        },
        // pagesize 改变
        handleSizeChange(size) {
            console.log('size: ', size);
            this.queryInfo.pagesize = size
            const maxN = parseInt(this.total / this.queryInfo.pagesize + '') + (this.total % this.queryInfo.pagesize > 0 ? 1 : 0)
            this.queryInfo.pagenum = this.queryInfo.pagenum > maxN ? maxN : this.queryInfo.pagenum
            this.getGoodsList()
        },
        // 页码值 改变
        handleCurrentChange(num) {
            console.log('num: ', num);
            this.queryInfo.pagenum = num
            this.getGoodsList()
        },
        // 删除商品
        async removeById(gid) {
            const confirm = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(e => e);

            // 如果用户确认删除，则返回值为字符串 confirm；如果用户取消了删除，则返回值为字符串 cancel
            console.log('confirm: ', confirm);
            if (confirm !== 'confirm') return
            
            const { data: res } = this.$http.delete('goods/' + gid)
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success('删除商品成功')
            this.getGoodsList()
        },
        // 添加商品
        goAddPage() {
            console.log('goAddPage');
            this.$router.push('/home/addGoods')
        }
    }
}
</script>

<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片 -->
        <el-card>
            <!-- 添加 -->
            <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>

            <!-- 分类列表 -->
            <tree-table class="tree-table" :data="catelist" :columns="columns" :selection-type = "false" :expand-type="false" :show-index="true" :index-text="'#'" border :show-row-hover="false">
                <template slot="isOk" slot-scope="scope">
                    <i class="el-icon-error" style="color: red;" v-if="scope.row.cat_deleted"></i>
                    <i class="el-icon-success" style="color: lightgreen;" v-else></i>
                </template>
                <template slot="order" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag type="warning" v-else>三级</el-tag>
                </template>
                <template slot="opt" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>

            <!-- <el-table :data="catelist" style="width: 100%" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="cat_name" label="分类名称"></el-table-column>
                <el-table-column label="是否有效"></el-table-column>
                <el-table-column label="排序"></el-table-column>
                <el-table-column label="操作">
                    <template>
                        <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
                    </template>
                </el-table-column>
            </el-table> -->

            <!-- 分页 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[2, 3, 5, 10]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加分类对话框 -->
        <el-dialog title="添加商品分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类：">
                    <el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChange" clearable></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            catelist: [], 
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5
            },
            total: 0,
            columns: [
                {
                    label: '分类名称',
                    prop: 'cat_name'
                },
                {
                    label: '是否有效',
                    // 列类型，可选值有 'template'(自定义列模板)
                    type: 'template',
                    // 列类型为 'template'(自定义列模板) 时，对应的作用域插槽（它可以获取到 row, rowIndex, column, columnIndex）名称
                    template: 'isOk'
                },
                {
                    label: '排序',
                    type: 'template',
                    template: 'order'
                },
                {
                    label: '操作',
                    type: 'template',
                    template: 'opt'
                }
            ],
            addCateDialogVisible: false,
            addCateForm: {
                cat_pid: 0,
                cat_name: '',
                cat_level: 0
            },
            // 添加商品分类表单验证
            addCateFormRules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' }
                ]
            },
            parentCateList: [],
            cascaderProps: {
                expandTrigger: 'hover',
                checkStrictly: true,
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            selectedKeys: []
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        async getCateList() {
            const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.catelist = res.data.result
            this.total = res.data.total
            this.$message.success('商品分类获取成功')
        },
        handleSizeChange(size) {
            console.log('size: ', size);
            this.queryInfo.pagesize = size
            const maxN = parseInt(this.total / this.queryInfo.pagesize + '') + (this.total % this.queryInfo.pagesize > 0 ? 1 : 0)
            this.queryInfo.pagenum = this.queryInfo.pagenum > maxN ? maxN : this.queryInfo.pagenum
            this.getCateList()
        },
        handleCurrentChange(page) {
            console.log('page: ', page);
            this.queryInfo.pagenum = page
            this.getCateList()
        },
        // 展示添加商品分类对话框
        async showAddCateDialog() {
            // 获取父级分类
            const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
            if (res.meta.status !== 200) return this.$message.error(res.meta.error)
            this.parentCateList = res.data
            this.addCateDialogVisible = true
        },
        // 关闭添加商品分类对话框
        addCateDialogClosed() {
            this.$refs.addCateFormRef.resetFields()
            this.addCateForm.cat_pid = 0
            this.addCateForm.cat_level = 0
            this.addCateForm.cat_name = ''
            this.selectedKeys = []
        },
        // 添加商品分类
        async addCate() {
            // 验证表单
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return this.$message.error('请填写正确的分类名称')

                const { data: res } = await this.$http.post('categories', this.addCateForm)
                if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
                this.$message.success('添加商品分类成功')
                this.getCateList()
                // 关闭对话框，重置数据
                this.addCateDialogVisible = false
            })
        },
        parentCateChange(v) {
            console.log('change: ', v);
            // 处理父分类id和分类级别
            if (this.selectedKeys.length > 0) {
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                this.addCateForm.cat_level = this.selectedKeys.length
            } else {
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
            }
        },
        async removeCateById(uid) {
            const confirm = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(e => e);

            // 如果用户确认删除，则返回值为字符串 confirm；如果用户取消了删除，则返回值为字符串 cancel
            console.log('confirm: ', confirm);
            if (confirm !== 'confirm') return

            const { data: res } = await this.$http.delete('categories/' + uid)
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success('删除商品分类成功')
            if (this.queryInfo.pagenum > 1 && this.catelist.length === 1) this.queryInfo.pagenum -= 1
            this.getCateList()
        }
    }
}
</script>

<style lang="less" scoped>
.el-cascader {
    width: 100%;
}
</style>

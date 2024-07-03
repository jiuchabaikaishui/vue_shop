<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片 -->
        <el-card>
            <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>

            <!-- 商品分类 -->
            <div class="cat_opt">
                <span>请选择商品分类：</span>
                <el-cascader v-model="selectedCateKeys" :options="cateList" :props="cateProps"  @change="handleChange" clearable></el-cascader>
            </div>
            
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="selectedCateKeys.length!==3" @click="addDialogVisible = true">添加参数</el-button>
                    <!-- 动态参数列表 -->
                    <el-table :data="manyTableData" style="width: 100%" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(v, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(scope.row, i)">{{v}}</el-tag>
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column  prop="attr_name" label="属性名称"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="selectedCateKeys.length!==3" @click="addDialogVisible = true">添加属性</el-button>
                    <!-- 静态属性列表 -->
                    <el-table :data="onlyTableData" style="width: 100%" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(v, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(scope.row, i)">{{v}}</el-tag>
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column  prop="attr_name" label="属性名称"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 添加参数对话框 -->
        <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑参数对话框 -->
        <el-dialog :title="'编辑' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            cateList: [],
            selectedCateKeys: [],
            cateProps: {
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            // 被激活的标签页名
            activeName: 'many',
            // 动态参数数据
            manyTableData: [],
            // 静态属性数据
            onlyTableData: [],
            // 是否展示添加参数对话框
            addDialogVisible: false,
            // 添加参数对话框数据
            addForm: {
                attr_name: ''
            },
            // 添加参数对话框验证规则
            addFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
            },
            // 是否展示编辑参数对话框
            editDialogVisible: false,
            // 编辑参数对话框数据
            editForm: {
                attr_name: ''
            },
            // 编辑参数对话框验证规则
            editFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
            }
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        // 获取分类数据
        async getCateList() {
            const { data: res } = await this.$http.get('categories', { params: { type: 3 } })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success('获取商品分类成功')
            this.cateList = res.data
        },
        // 获取参数列表数据
        async getParamsData() {
            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success('获取参数列表成功')
            // 将 attr_vals 转换为数组
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
                item.inputVisible = false
                item.inputValue = ''
            });
            if (this.activeName === 'many') this.manyTableData = res.data
            this.onlyTableData = res.data
        },
        // 分类改变
        handleChange() {
            if (this.selectedCateKeys.length !== 3) {
                this.selectedCateKeys = []
                this.manyTableData = []
                this.onlyTableData = []
                return
            }
            console.log('change: ', this.selectedCateKeys);

            this.getParamsData()
        },
        // 点击标签页
        handleTabClick() {
            if (this.selectedCateKeys.length === 3) this.getParamsData()
        },
        // 关闭添加参数对话框
        addDialogClosed() {
            this.$refs.addFormRef.resetFields()
        },
        // 添加商品参数
        addParams() {
            // 验证表单
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return this.$message.error('请填写正确的参数名称')

                const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { 
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeName
                 })
                if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
                this.$message.success(`添加${this.titleText}成功`)
                this.addDialogVisible = false
                this.getParamsData()
            })
        },
        // 展示编辑参数对话框
        async showEditDialog(attrId) {
            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, { params: { attr_sel: this.activeName } })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success(`获取${this.titleText}成功`)
            this.editForm = res.data
            this.editDialogVisible = true
        },
        // 关闭编辑参数对话框
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()
        },
        // 编辑商品参数
        editParams() {
            // 验证表单
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return this.$message.error('请填写正确的参数名称')

                const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { 
                    attr_name: this.editForm.attr_name,
                    attr_sel: this.activeName
                 })
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
                this.$message.success(`添加${this.titleText}成功`)
                this.editDialogVisible = false
                this.getParamsData()
            })
        },
        // 删除商品参数
        async removeParams(attrId) {
            const confirm = await this.$confirm(`此操作将永久删除该${this.titleText}, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(e => e);

            // 如果用户确认删除，则返回值为字符串 confirm；如果用户取消了删除，则返回值为字符串 cancel
            console.log('confirm: ', confirm);
            if (confirm !== 'confirm') return

            const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success(`删除${this.titleText}成功`)
            this.getParamsData()
        },
        // 保存参数可选项
        async saveAttrVals(row, attrVals, isAdd) {
            const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, { 
                attr_name: row.attr_name,
                attr_sel: this.activeName,
                attr_vals: attrVals
            })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success(`${isAdd ? '添加' : '删除'}${this.titleText}可选项成功`)
            this.getParamsData()
        },
        // 删除参数可选项
        handleClose(row, i) {
            // 删除元素
            const attrVals = [...row.attr_vals.slice(0, i), ...row.attr_vals.slice(i + 1)].join(' ')
            console.log('attrVals: ', attrVals, '\ni: ', i);
            this.saveAttrVals(row, attrVals, false)
        },
        // 展示添加参数可选项输入框
        showInput(row) {
            row.inputVisible = true
            // 让文本框自动获得焦点
            // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        // 
        handleInputConfirm(row) {
            if (row.inputValue.trim().length === 0) {
                row.inputVisible = false
                row.inputValue = ''
                return
            }

            // 添加元素
            const attrVals = row.attr_vals.concat(row.inputValue.trim()).join(' ')
            console.log('attrVals: ', attrVals);
            this.saveAttrVals(row, attrVals, true)
        }
    },
    // 计算属性
    computed: {
        // 选中的分类id
        cateId() {
            if (this.selectedCateKeys.length === 3) return this.selectedCateKeys[2]
            return null
        },
        // 动态计算标题的文本
        titleText() {
            if (this.activeName === 'many') {
                return '动态参数'
            }
            return '静态属性'
        }
    }
}
</script>

<style scoped>
.cat_opt {
    margin: 15px 0;
}

.el-tag, .button-new-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>

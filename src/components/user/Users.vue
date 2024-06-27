<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片 -->
        <el-card>
            <!-- 搜索与添加 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model.trim="queryInfo.query" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="queryUserList" :disabled="queryInfo.query ? false : true"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>

            <!-- 用户列表 -->
            <el-table :data="userlist" style="width: 100%" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column  prop="username" label="姓名"></el-table-column>
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="mobile" label="电话"></el-table-column>
                <el-table-column prop="role_name" label="角色"></el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
                        <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
                        </el-tooltip>
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
            :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加用户对话框 -->
        <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑用户对话框 -->
        <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 分配角色对话框 -->
        <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%">
            <p>当前用户：{{userInfo.username}}</p>
            <p>当前角色：{{userInfo.role_name}}</p>
            <p>分配新角色：
                <el-select v-model="selectedRoleId" placeholder="请选择">
                    <el-option
                    v-for="item in rolesList"
                    :key="item.id"
                    :label="item.roleName"
                    :value="item.id">
                    </el-option>
                </el-select>
            </p>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        // 邮箱验证
        const checkEmail = (rule, value, cb) => {
            if (/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]{2,}$/.test(value)) return cb()
            cb(new Error('请输入正确的邮箱'))
        }
        // 手机号验证
        const checkMobile = (rule, value, cb) => {
            if (/^(0|86|17951)?(13[0-9]|14[5-7]|15[012356789]|17[678]|18[0-9])\d{8}$/.test(value)) return cb()
            cb(new Error('请输入正确的手机号')) 
        }
        return {
            // 获取用户列表接口参数
            queryInfo: {
                query: '', // 搜索内容
                pagenum: 1, // 页面
                pagesize: 2 // 每页显示条数
            },
            // 用户列表数据
            userlist: [],
            // 用户列表总条数
            total: 0,
            // 添加用户对话框
            addDialogVisible: false,
            // 添加用户的表单数据
            addForm: {
                username: '',
                password: '',
                email: '',
                mobile: ''
            },
            // 添加用户表单验证
            addFormRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' }
                ],
                mobile: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ]
            },
            // 编辑用户对话框
            editDialogVisible: false,
            // 编辑用户的表单数据
            editForm: {
                id: '',
                username: '',
                email: '',
                mobile: ''
            },
            // 编辑用户表单验证
            editFormRules: {
                username: [
                    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' }
                ],
                mobile: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ]
            },
            // 是否显示分配角色对话框
            setRoleDialogVisible: false,
            // 分配角色的用户
            userInfo: {},
            // 角色列表
            rolesList: [],
            // 选中的角色
            selectedRoleId: ''
        }
    },
    created() {
        this.getUserList()
    },
    methods: {
        // 获取用户列表
        async getUserList() {
            const { data: res } = await this.$http.get('users', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$msg.error(res.meta.msg)
            this.userlist = res.data.users
            this.total = res.data.total
        },
        // 搜索用户列表
        queryUserList() {
            // 重置为第一页
            this.queryInfo.pagenum = 1
            this.getUserList()
        },
        // pagesize 改变
        handleSizeChange(size) {
            console.log('size: ', size);
            this.queryInfo.pagesize = size
            const maxN = parseInt(this.total / this.queryInfo.pagesize + '') + (this.total % this.queryInfo.pagesize > 0 ? 1 : 0)
            this.queryInfo.pagenum = this.queryInfo.pagenum > maxN ? maxN : this.queryInfo.pagenum
            this.getUserList()
        },
        // 页码值 改变
        handleCurrentChange(num) {
            console.log('num: ', num);
            this.queryInfo.pagenum = num
            this.getUserList()
        },
        // witch 开关状态的改变
        async userStateChanged(info) {
            const { data: res } = await this.$http.put(`users/${info.id}/state/${info.mg_state}`)
            if (res.meta.status !== 200) {
                info.mg_state = !info.mg_state
                return this.$msg.error(info.meta.msg)
            }
            return this.$msg.success('更新用户状态成功！')
        },
        // 关闭添加用户对话框
        addDialogClosed() {
            // 重置表单数据
            this.$refs.addFormRef.resetFields()
        },
        // 添加用户
        addUser() {
            // 验证表单
            this.$refs.addFormRef.validate(async valid => {
                // 表单验证失败
                if (!valid) return this.$msg.error('请填写正确的用户数据')
                // 发起请求
                const { data: res } = await this.$http.post('users', this.addForm)
                if (res.meta.status !== 201) return this.$msg.error('添加用户失败')
                this.$msg.success('添加用户成功')
                // 关闭对话框
                this.addDialogVisible = false
                // 刷新列表
                this.getUserList()
            })
        },
        // 显示编辑用户对话框
        async showEditDialog(uid) {
            const { data: res } = await this.$http.get(`users/${uid}`)
            if (res.meta.status !== 200) return this.$msg.error(res.meta.msg)
            this.editForm = res.data
            this.editDialogVisible = true
        },
        // 关闭编辑用户对话框
        editDialogClosed() {
            this.$.$refs.editFormRef.resetFields()
        },
        // 编辑用户
        editUser() {
            // 验证表单
            this.$refs.editFormRef.validate(async valid => {
                // 表单验证失败
                if (!valid) return this.$msg.error('请填写正确的用户数据')
                // 发起请求
                const { data: res } = await this.$http.put(`users/${this.editForm.id}`, this.editForm)
                if (res.meta.status !== 200) return this.$msg.error('修改用户失败')
                this.$msg.success('修改用户成功')
                // 关闭对话框
                this.editDialogVisible = false
                // 刷新列表
                this.getUserList()
            })
        },
        // 根据Id删除对应用户
        async removeUserById(uid) {
            const confirm = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(e => e);

            // 如果用户确认删除，则返回值为字符串 confirm；如果用户取消了删除，则返回值为字符串 cancel
            console.log('confirm: ', confirm);
            if (confirm !== 'confirm') return

            const { data: res } = await this.$http.delete('users/' + uid)
            if (res.meta.status !== 200) this.$msg.error(res.meta.msg)
            this.$msg.success('删除用户成功')
            if (this.queryInfo.pagenum > 1 && this.userlist.length === 1) this.queryInfo.pagenum -= 1
            this.getUserList()
        }, 
        // 显示分配角色对话框
        async setRole(userInfo) {
            const { data: res } = await this.$http.get('roles')
            if (res.meta.status !== 200) return this.$msg.error(res.meta.msg)
            this.rolesList = res.data
            this.userInfo = userInfo
            this.selectedRoleId = ''
            this.setRoleDialogVisible = true
        },
        // 分配角色
        async saveRoleInfo() {
            if (!this.selectedRoleId) return this.$msg.error('请选择要分配的角色')
            const { data: res } = await this.$http.put('users/' + this.userInfo.id + '/role', { rid: 'this.selectedRoleId' })
            if (res.meta.status !== 200) return this.$msg.error(res.meta.msg)
            this.$msg.success('分配角色成功')
            this.getUserList()
            this.setRoleDialogVisible = false
        }
    }
}
</script>

<style lang="less" scoped>
</style>

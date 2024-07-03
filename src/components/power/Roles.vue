<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片 -->
        <el-card>
            <el-button type="primary">添加角色</el-button>

            <!-- 角色列表 -->
            <el-table :data="rolesList" style="width: 100%" border stripe>
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row v-for="(v, i) in scope.row.children" :key="v.id" :class="['vcenter', 'bdbottom', i == 0 ? 'bdtop': '']">
                            <!-- 一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row, v.id)">{{v.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 二级和三级权限 -->
                            <el-col :span="19">
                                <el-row v-for="(v1, i1) in v.children" :key="v1.id" :class="['vcenter', i1 !== 0 ? 'bdtop' : '']">
                                    <!-- 二级权限 -->
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightById(scope.row, v1.id)">{{v1.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <!-- 三级权限 -->
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="(v2) in v1.children" :key="v2.id" closable @close="removeRightById(scope.row, v2.id)">{{v2.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                        <!-- <pre>{{scope.row}}</pre> -->
                    </template>
                </el-table-column>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column  prop="roleName" label="角色名称"></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 分配权限对话框 -->
        <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%">
            <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <!-- <pre>{{rightsList}}</pre> -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            rolesList: [],
            rightsList: [],
            setRightDialogVisible: false,
            treeProps: {
                children: 'children',
                label: 'authName'
            },
            defKeys: [],
            roleId: ''
        }
    },
    created() {
        this.getRolesList()
    },
    methods: {
        async getRolesList() {
            const { data: res } = await this.$http.get('roles')
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.rolesList = res.data
        },
        async removeRightById(role, rightId) {
            const confirm = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(e => e);

            // 如果用户确认删除，则返回值为字符串 confirm；如果用户取消了删除，则返回值为字符串 cancel
            console.log('confirm: ', confirm);
            if (confirm !== 'confirm') return

            // 确认删除
            const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success('权限删除成功')

            // 会触发页面重新渲染
            // this.getRolesList()
            role.children = res.data
        },
        async showSetRightDialog(role) {
            console.log('role: ', role);
            // 获取权限列表
            const { data: res } = await this.$http.get('rights/tree')
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

            this.rightsList = res.data
            // let keys = []
            // this.getLeafKeys(role, keys)
            // this.defKeys = keys
            this.defKeys = this.getLeafKeys(role)
            this.setRightDialogVisible = true
            this.roleId = role.id
        },
        // 递归获取角色所有三级权限id，保存到defKeys中
        getLeafKeys(node, arr) {
            // 三级权限
            if (!node.children) return [node.id]

            // return node.children.forEach(element => {
            //     return this.getLeafKeys(element, arr)
            // });

            return node.children.reduce((pv, cv) => pv.concat(this.getLeafKeys(cv)), [])
        },
        // 分配权限
        async allotRights() {
            const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
            const rids = keys.join(',')
            console.log('rids: ', rids);
            const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success('分配权限成功')
            this.getRolesList()
            this.setRightDialogVisible = false
        }
    }
}
</script>

<style lang="less" scoped>
.el-tag {
    margin: 7px;
}
.bdtop {
    border-top: 1px solid #eee;
}
.bdbottom {
    border-bottom: 1px solid #eee;
}
.vcenter {
    display: flex;
    align-items: center;
}
</style>

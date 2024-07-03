<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片 -->
        <el-card>
            <!-- 警告 -->
            <el-alert
                title="添加商品信息"
                type="info"
                center
                show-icon 
                :closable="false">
            </el-alert>
        
            <!-- 步骤条 -->
            <el-steps :space="200" :active="activeIndex * 1" align-center finish-status="success">
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <!-- 标签栏 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" label-position="top">
                <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeTabLeave" @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps"  @change="handleChange" clearable></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item v-for="(v, i) in manyTableData" :key="i" :label="v.attr_name">
                            <el-checkbox-group v-model="v.attr_vals">
                                <el-checkbox v-for="(item, index) in v.attr_vals" :key="index" :label="item" border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                        <pre>{{manyTableData}}</pre>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item v-for="(v, i) in onlyTableData" :key="i" :label="v.attr_name">
                            <el-input v-model="v.attr_vals"></el-input>
                        </el-form-item>
                        <pre>{{onlyTableData}}</pre>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload 
                        action="http://127.0.0.1:8888/api/private/v1/upload"
                        :on-preview="handlePreview"
                        :on-remove="handleRemove" 
                        :headers="headerObj" 
                        :on-success="handleSuccess"
                        list-type="picture">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor v-model="addForm.goods_introduce" @blur="onEditorBlur"></quill-editor>
                        <el-button class="btnAdd" type="primary" @click="add">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>

            <!-- 预览对话框 -->
            <el-dialog
            title="图片预览"
            :visible.sync="previewVisible"
            width="50%">
                <img class="previewImg" :src="previewPath" alt="">
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
import _ from 'lodash';

export default {
    data() {
        return {
            activeIndex: '0',
            addForm: {
                goods_name: '',
                goods_price: '',
                goods_weight: '',
                goods_number: '',
                goods_cat: [],
                // 商品图片
                pics: [],
                // 描述
                goods_introduce: '',
                // 参数
                attrs: []
            },
            addFormRules: {
                goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }], 
                goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }], 
                goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }], 
                goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
                goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'change' }]
            },
            // 商品分类
            cateList: [],
            cateProps: {
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            // 动态参数列表
            manyTableData: [],
            // 静态属性列表
            onlyTableData: [],
            // 请求头
            headerObj: { Authorization: window.sessionStorage.getItem('token') },
            // 是否展示预览图
            previewVisible: false,
            // 预览图片路径
            previewPath: ''
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
        // 选择分类
        handleChange(v) {
            if (this.addForm.goods_cat.length !== 3) {
                this.addForm.goods_cat = []
                return
            }
            console.log('handleChange value: ', v);
        },
        // 标签页钩子函数
        beforeTabLeave(ai, oai) {
            console.log('ai: ', ai, ', oai: ', oai);
            if (oai === '0' && this.addForm.goods_cat.length !== 3) {
                this.$message.error('请选择商品分类')
                return false
            }
        },
        // 点击标签栏
        async tabClicked() {
            if (this.activeIndex === '1') {
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
                this.$message.success('获取动态参数成功')
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals.length > 0 ? item.attr_vals.split(' ') : []
                });
                this.manyTableData = res.data
            } else if (this.activeIndex === '2') {
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
                this.$message.success('获取动态参数成功')
                this.onlyTableData = res.data
            }
        },
        // 点击预览图片
        handlePreview(file) {
            console.log('handlePreview: ', file);
            this.previewPath = file.response.data.url
            this.previewVisible = true
        },
        // 点击删除图片
        handleRemove(file, fileList) {
            // console.log('handleRemove:\nfile: ', file, '\nfileList: ', fileList);
            const index = this.addForm.pics.findIndex(v => v.pic === file.response.data.tmp_path)
            if (index !== -1) this.addForm.pics.splice(index, 1)
            console.log('addForm: ', this.addForm);
        },
        // 上传文件成功
        handleSuccess(response, file, fileList) {
            // console.log('handleSuccess:\nresponse: ', response, '\nfile: ', file, '\nfileList: ', fileList);
            this.addForm.pics.push({ pic: response.data.tmp_path })
            console.log('addForm: ', this.addForm);
        },
        // 富文本编辑器失去焦点
        onEditorBlur() {
            console.log('content: ', this.addForm.goods_introduce);
        },
        // 添加商品
        add() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return this.$message.error('请填写必要的表单项')

                // lodash 深拷贝
                const addForm = _.cloneDeep(this.addForm)

                // 处理分类数据
                addForm.goods_cat = addForm.goods_cat.join(',')

                // 处理动态参数
                this.manyTableData.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals.join(' ')
                    }
                    addForm.attrs.push(newInfo)
                });

                // 处理静态属性
                this.onlyTableData.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals
                    }
                    addForm.attrs.push(newInfo)
                });
                console.log('addForm: ', addForm);
                
                // 发起请求
                const { data: res } = await this.$http.post('goods', addForm)
                if (res.meta.status !== 201) this.$message.error(res.meta.msg)
                this.$message.success('添加商品成功')
                this.$router.push('/home/goods')
            })
        }
    },
    computed: {
        cateId() {
            if (this.addForm.goods_cat.length === 3) return this.addForm.goods_cat[2]
            return null
        }
    }
}
</script>

<style lang="less" scoped>
.el-checkbox {
    margin: 10px !important;
}
.previewImg {
    width: 100%;
}
.btnAdd {
    margin-top: 15px;
}
</style>
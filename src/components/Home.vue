<template>
    <div class="home-container">
        <el-container>
            <!-- 头部 -->
            <el-header>
                <div>
                    <img src="../assets/avanter.png" alt="">
                    <span>后台管理系统</span>
                </div>
                <el-button type="info" @click="logout">退出</el-button>
            </el-header>

            <!-- 主体 -->
            <el-container>
                <!-- 左边栏 -->
                <el-aside :width="isCollapse ? '64px' : '200px'">
                    <div class="toggle-button" @click="toggleCollapse">|||</div>
                    <!-- 菜单选择区 -->
                    <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
                        <!-- 一级导航 -->
                        <el-submenu :index="v.id + ''" :key="i" v-for="(v, i) in menulist">
                            <template slot="title">
                                <!-- 图标 -->
                                <i :class="iconsObj[v.id]"></i>
                                <!-- 文本 -->
                                <span>{{v.authName}}</span>
                            </template>
                            <!-- 二级导航 -->
                            <el-menu-item :index="'/home/' + value.path" :key="value.id" v-for="(value) in v.children" @click="saveNavState('/home/' + value.path)">
                                <template slot="title">
                                    <i class="el-icon-menu"></i>
                                    <span>{{value.authName}}</span>
                                </template>
                            </el-menu-item>
                        </el-submenu>
                    </el-menu>
                </el-aside>

                <!-- 右主体 -->
                <el-main>
                    <router-view></router-view>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 菜单列表数据
            menulist: [],
            // 一级菜单图标
            iconsObj: {
                125: 'iconfont icon-user',
                103: 'iconfont icon-tijikongjian',
                101: 'iconfont icon-shangpin',
                102: 'iconfont icon-danju',
                145: 'iconfont icon-baobiao'
            }, 
            // 是否折叠左侧边栏
            isCollapse: false,
            // 被激活的路由路径
            activePath: ''
        }
    },
    created() {
        this.getMenuList()
        this.activePath = window.sessionStorage.getItem('path')
    },
    methods: {
        // 退出
        logout() {
            window.sessionStorage.removeItem('token')
            console.log('this: ', this)
            this.$router.push('/login')
        },
        // 获取边栏数据
        async getMenuList() {
            const { data: res } = await this.$http.get('menus')
            if (res.meta.status !== 200) { return this.$msg.error(res.meta.msg) }
            this.menulist = res.data
        },
        // 展开或折叠左侧边栏
        toggleCollapse() {
            this.isCollapse = !this.isCollapse;
        },
        saveNavState(path) {
            window.sessionStorage.setItem('path', path)
            this.activePath = path
        }
    }
}
</script>

<style lang="less" scoped>
.home-container, .el-container {
    height: 100%;
}
.el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    font-size: 20px;
    color: white;

    > div {
        display: flex;
        align-items: center;

        > span {
            margin-left: 15px;
        }
    }
}
.toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: white;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
}
.el-aside {
    background-color: #333744;
    .el-menu {
        border-right: none;
    }
}
.el-main {
    background-color: #eaedf1;
}
.iconfont {
    margin-right: 10px;
}
</style>

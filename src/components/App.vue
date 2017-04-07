<template>
  <div id="app">
    <navTop></navTop>
    <el-row>
      <sidebar></sidebar>
      <!--<router-view></router-view>-->
      <editor></editor>
    </el-row>
  </div>
</template>

<script>
import navTop from './Nav'
import sidebar from './Sidebar'
import editor from './Editor'

export default {
  name: 'app',
  components: {
    sidebar,
    navTop,
    editor
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>

<template>
  <div class="editor" v-show="editorVisible">
      <el-col :span="20">
        <el-form label-width="100px">
          <el-form-item label="旧值">
            <textarea width="300px" cols="100" rows="10" disabled v-model="oldValue"></textarea>
          </el-form-item>
          <el-form-item label="新值">
            <textarea width="300px" cols="100" rows="10" v-model="newValue"></textarea>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="submitForm">提交</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>
  </div>
</template>

<script>
import Bus from '../common/Bus'
import Buffer from '../common/Buffer'

export default {
  name: 'editor',
  data () {
    return {
      editorVisible: false,
      projectName: '',
      profileName: '',
      version: '',
      oldValue: '',
      newValue: '',
      fileKey: ''
    }
  },
  methods: {
    resetForm () {
      this.newValue = ''
    },
    submitForm () {
      if (this.newValue !== '') {
        Buffer.addFileChange(this.fileKey, this.newValue)
        this.$message({
          message: '提交成功！',
          type: 'success'
        })
      } else {
        this.$message({
          message: '文本框不能为空',
          type: 'warning'
        })
      }
    }
  },
  created () {
    Bus.$on('selectFile', obj => {
      this.fileKey = obj.fileKey
      this.oldValue = obj.value
      this.version = obj.version
      this.projectName = obj.projectName
      this.profileName = obj.profileName

      if (Buffer.containFileKey(this.fileKey)) {
        this.newValue = Buffer.getFileChange(this.fileKey).value
      } else {
        this.newValue = ''
      }
      this.editorVisible = true
    })
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

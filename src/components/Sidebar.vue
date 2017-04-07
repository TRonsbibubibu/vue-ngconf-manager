<template>
  <div class="sidebar">
      <el-col :span="4" v-show="treeVisible">
        <el-button type="primary" icon="plus" @click="addClick"></el-button>
        <el-button type="primary" icon="minus" @click="removeClick"></el-button>
        <el-tree :data="data" @node-click="handleNodeClick" />
      </el-col>

    <el-dialog title="添加文件" v-model="addFileVisible">
      <el-form>
        <el-form-item label="文件路径">
          <el-input v-model="formKey" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="文件值">
          <el-input v-model="formValue" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAddDialog">取 消</el-button>
        <el-button type="primary" @click="commitAddDialog">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="删除文件" v-model="removeFileVisible">
      <el-form>
        <el-form-item label="文件路径">
          <el-input v-model="formKey" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelRemoveDialog">取 消</el-button>
        <el-button type="primary" @click="commitRemoveDialog">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Bus from '../common/Bus'
import Projects from '../api/projects'
import Buffer from '../common/Buffer'

export default {
  name: 'sidebar',
  data () {
    return {
      projectName: '',
      profileName: '',
      version: '',
      fileKey: '',
      currentVersion: '',
      data: [],
      treeVisible: false,
      addFileVisible: false,
      removeFileVisible: false,
      formKey: '',
      formValue: ''
    }
  },
  methods: {
    addClick () {
      this.addFileVisible = true
    },
    removeClick () {
      this.removeFileVisible = true
    },
    handleNodeClick (obj, node, self) {
      if (!obj.value) {
        return
      }
      this.fileKey = obj.label
      Bus.$emit('selectFile', {
        projectName: this.projectName,
        profileName: this.profileName,
        version: this.version,
        fileKey: this.fileKey,
        value: obj.value
      })
    },
    cancelAddDialog () {
      this.addFileVisible = false
      this.formKey = ''
      this.formValue = ''
    },
    commitAddDialog () {
      if (this.formKey !== '' && this.formValue !== '') {
        Buffer.addFileChange(this.formKey, this.formValue)
        this.$message({
          message: '提交成功！',
          type: 'success'
        })
        this.addFileVisible = false
        this.formKey = ''
        this.formValue = ''
      } else {
        this.$message({
          message: '文本框不能为空',
          type: 'warning'
        })
      }
    },
    cancelRemoveDialog () {
      this.removeFileVisible = false
      this.formKey = ''
    },
    commitRemoveDialog () {
      if (this.formKey !== '') {
        Buffer.removeFile(this.formKey)
        this.$message({
          message: '提交成功！',
          type: 'success'
        })
        this.removeFileVisible = false
        this.formKey = ''
      } else {
        this.$message({
          message: '文本框不能为空',
          type: 'warning'
        })
      }
    }
  },
  created () {
    Bus.$on('selectVersion', obj => {
      this.projectName = obj.project
      this.profileName = obj.profile
      this.version = obj.version
      this.currentVersion = obj.currentVersion
      Projects.getConf(obj.project, obj.profile, obj.version).then(res => {
        this.data = [parse(res)]
        this.treeVisible = true
      })

      function parse (res) {
        if (!res.dir) {
          return {
            label: res.key,
            value: res.value
          }
        }
        let nodes = []
        res.nodes.forEach(node => {
          nodes.push(parse(node))
        })
        return {
          label: res.key,
          children: nodes
        }
      }
    })
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

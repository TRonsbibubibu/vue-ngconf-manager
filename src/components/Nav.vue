<template>
  <div class="navTop">
    <el-row>
    <el-col :span="24">
        <el-menu class="el-menu-demo" mode="horizontal">
          <el-col :span="8">
            <el-menu-item index="1" class="logo">配置中心</el-menu-item>
            <el-submenu index="2">
              <template slot="title">项目</template>
              <el-menu-item index="2-1">新建项目</el-menu-item>
              <el-menu-item index="2-2" @click="openProject">打开项目</el-menu-item>
            </el-submenu>
          </el-col>
          <el-col :span="6" align="middle" class="info">
            {{projectName + ' ' + profileName + ' ' + version}}
          </el-col>
          <el-col :span="5" :offset="5" align="right">
            <el-menu-item index="3" @click="save">保存</el-menu-item>
            <el-menu-item index="4" @click="checkBuffer">查看缓冲区</el-menu-item>
            <el-menu-item index="5" @click="reset">重置</el-menu-item>
          </el-col>
        </el-menu>
      </el-col>
    </el-row>

    <el-dialog title="选择项目" v-model="projectsTableVisible">
      <el-table :data="projects" stripe height="300" v-on:row-click="projectRowClick">
        <el-table-column property="name" label="项目名" />
      </el-table>
    </el-dialog>

    <el-dialog title="选择profile" v-model="profilesTableVisible">
      <el-table :data="profiles" stripe height="300" v-on:row-click="profileRowClick">
        <el-table-column property="name" label="profile" />
        <el-table-column property="currentVersion" label="现在版本" />
      </el-table>
    </el-dialog>

    <el-dialog title="选择version" v-model="versionsTableVisible">
      <el-table :data="versions" stripe height="300" v-on:row-click="versionRowClick">
        <el-table-column property="version" label="version" />
      </el-table>
    </el-dialog>

    <el-dialog title="缓冲区" v-model="bufferTableVisible">
      <el-table :data="buffer">
        <el-table-column property="key" label="文件路径" width="150"></el-table-column>
        <el-table-column property="value" label="文件值" width="200"></el-table-column>
        <el-table-column property="type" label="类型"></el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="120">
          <template scope="scope">
            <el-button
              @click="removeBuffer(scope.$index)"
              type="text"
              size="small">
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import Projects from '../api/projects';
import Bus from '../common/Bus';
import Buffer from '../common/Buffer';

export default {
  name: 'navTop',
  data() {
    return {
      projectsTableVisible: false,
      profilesTableVisible: false,
      versionsTableVisible: false,
      bufferTableVisible: false,
      projects: [],
      profiles: [],
      versions: [],
      buffer: [],
      projectName: '',
      profileName: '',
      version: '',
      currentVersion: '',
    };
  },
  methods: {
    openProject() {
      if (!Buffer.isEmpty()) {
        this.$confirm('此操作将清空缓冲区该文件, 是否继续?', '提示', {
          confirmButtonText: '清除',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          const num = Buffer.length;
          Buffer.clear();
          this.$notify({
            title: '清除缓冲区成功',
            message: '清除修改' + num + '条',
            type: 'success',
          });
          this._openProject();
        }).catch();
      } else {
        this._openProject();
      }
    },
    _openProject() {
      Projects.getProjectList().then((res) => {
        this.projects = res;
        this.projectsTableVisible = true;
      });
    },
    reset() {
      const num = Buffer.length;
      Buffer.clear();
      this.$notify({
        title: '清除缓冲区成功',
        message: '清除修改' + num + '条',
        type: 'success',
      });
    },
    checkBuffer() {
      this.buffer = Buffer.getBuffer();
      this.bufferTableVisible = true;
    },
    removeBuffer(index) {
      const node = this.buffer[index];
      Buffer.removeFileChange(node.key);
      this.buffer.splice(index, 1);
    },
    save() {
      if (Buffer.isEmpty()) {
        this.$message({
          message: '没有改动',
          type: 'warning',
        });
        return;
      }
      Projects.copy(this.projectName, this.profileName, this.version).then(res => {
        const newVersion = res;
        const buffer = Buffer.getBuffer();
        const deleteFiles = [];
        const setFiles = [];
        buffer.forEach((node) => {
          switch (node.type) {
            case 'set':setFiles.push(node); break;
            case 'remove':deleteFiles.push(node); break;
            default: break;
          }
        });
        Projects.setFiles(this.projectName, this.profileName, newVersion, setFiles);
        Projects.removeFiles(this.projectName, this.profileName, newVersion, deleteFiles);
        Buffer.clear();
        this.$message({
          message: '提交成功,新版本号为' + newVersion,
          type: 'success',
        });
      });
    },
    projectRowClick(row, event, col) {
      this.projectName = row.name;
      Projects.getProfiles(row.name).then((res) => {
        this.profiles = res;
        this.projectsTableVisible = false;
        this.profilesTableVisible = true;
      });
    },
    profileRowClick(row, event, col) {
      this.profileName = row.name;
      this.currentVersion = row.currentVersion;
      Projects.getVersions(this.projectName, this.profileName).then((res) => {
        const versions = [];
        res.forEach((node) => {
          versions.push({
            version: node,
          });
        });
        this.versions = versions;
        this.profilesTableVisible = false;
        this.versionsTableVisible = true;
      });
    },
    versionRowClick(row, event, col) {
      this.version = row.version;
      this.versionsTableVisible = false;
      Bus.$emit('selectVersion', {
        project: this.projectName,
        profile: this.profileName,
        version: this.version,
        currentVersion: this.currentVersion,
      });
    },
  },
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .info{
    margin-top: 20px;
  }
</style>

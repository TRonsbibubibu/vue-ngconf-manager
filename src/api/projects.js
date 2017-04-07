/**
 * Mocking client-server processing
 */
import Vue from 'vue'

const root = 'http://127.0.0.1:3000'

export default {
  getProjectList () {
    return Vue.http.get(root + '/api/v1/projects').then((res) => {
      return res.data
    })
  },
  getProfiles (projectName) {
    return Vue.http.get(root + '/api/v1/projects/' + projectName).then((res) => {
      return res.data
    })
  },
  getVersions (projectName, profileName) {
    return Vue.http.get(root + '/api/v1/projects/' + projectName + '/' + profileName + '/versions').then((res) => {
      return res.data
    })
  },
  getConf (projectName, profileName, version) {
    return Vue.http.get(root + '/api/v1/projects/' + projectName + '/' + profileName + '/versions/' + version + '/conf').then((res) => {
      return res.data
    })
  },
  setFiles (projectName, profileName, version, files) {
    let req = {
      'data': files
    }
    return Vue.http.post(root + '/api/v1/projects/' + projectName + '/' + profileName + '/versions/' + version, JSON.stringify(req)).then(res => {
      return res.data
    })
  },
  removeFiles (projectName, profileName, version, files) {
    let req = {
      'data': files
    }
    return Vue.http.delete(root + '/api/v1/projects/' + projectName + '/' + profileName + '/versions/' + version, JSON.stringify(req)).then(res => {
      return res.data
    })
  },
  copy (projectName, profileName, version) {
    return Vue.http.post(root + '/api/v1/projects/' + projectName + '/' + profileName + '/versions/' + version + '/copy').then(res => {
      return res.data
    })
  }
}

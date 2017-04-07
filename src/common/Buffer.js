/**
 * Created by trons on 2017/4/6.
 */

class Buffer {
  constructor () {
    this.length = 0
    this.$buffer = {}
  }

  addFileChange (fileKey, value) {
    if (fileKey.substr(0, 1) !== '/') {
      fileKey = '/' + fileKey
    }
    if (!this.containFileKey(fileKey)) {
      this.length++
    }
    this.$buffer[fileKey] = {
      key: fileKey,
      value: value,
      type: 'set'
    }
    this.print()
  }
  removeFileChange (fileKey) {
    if (fileKey.substr(0, 1) !== '/') {
      fileKey = '/' + fileKey
    }
    if (this.containFileKey(fileKey)) {
      delete this.$buffer[fileKey]
      this.length--
    }
  }
  removeFile (fileKey) {
    if (fileKey.substr(0, 1) !== '/') {
      fileKey = '/' + fileKey
    }
    if (!this.containFileKey(fileKey)) {
      this.length++
    }
    this.$buffer[fileKey] = {
      key: fileKey,
      type: 'remove'
    }
    this.print()
  }
  getFileChange (fileKey) {
    if (fileKey.substr(0, 1) !== '/') {
      fileKey = '/' + fileKey
    }
    return this.$buffer[fileKey]
  }
  containFileKey (fileKey) {
    if (fileKey.substr(0, 1) !== '/') {
      fileKey = '/' + fileKey
    }
    return (fileKey in this.$buffer)
  }
  isEmpty () {
    return this.length === 0
  }
  print () {
    console.log(this.$buffer)
  }
  getBuffer () {
    let arr = []
    for (let key in this.$buffer) {
      arr.push(this.$buffer[key])
    }
    return arr
  }
  clear () {
    this.length = 0
    this.$buffer = {}
  }
}

export default new Buffer()

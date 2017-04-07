/**
 * Created by trons on 2017/4/6.
 */

class Buffer {
  constructor() {
    this.length = 0;
    this.$buffer = {};
  }
  addFileChange(fileKey, value) {
    if (fileKey.substr(0, 1) !== '/') {
      fileKey = '/' + fileKey;
    }
    if (!this.containFileKey(fileKey)) {
      this.length += 1;
    }
    this.$buffer[fileKey] = {
      key: fileKey,
      value,
      type: 'set',
    };
    this.print();
  }
  removeFileChange(fileKey) {
    if (fileKey.substr(0, 1) !== '/') {
      fileKey = '/' + fileKey;
    }
    if (this.containFileKey(fileKey)) {
      delete this.$buffer[fileKey];
      this.length += 1;
    }
  }
  removeFile(fileKey) {
    if (fileKey.substr(0, 1) !== '/') {
      fileKey = '/' + fileKey;
    }
    if (!this.containFileKey(fileKey)) {
      this.length += 1;
    }
    this.$buffer[fileKey] = {
      key: fileKey,
      type: 'remove',
    };
    this.print();
  }
  getFileChange(fileKey) {
    if (fileKey.substr(0, 1) !== '/') {
      fileKey = '/' + fileKey;
    }
    return this.$buffer[fileKey];
  }
  containFileKey(fileKey) {
    if (fileKey.substr(0, 1) !== '/') {
      fileKey = '/' + fileKey;
    }
    return (fileKey in this.$buffer);
  }
  isEmpty() {
    return this.length === 0;
  }
  // print() {
  //   console.log(this.$buffer);
  // }
  getBuffer() {
    return Object.values(this.$buffer);
  }
  clear() {
    this.length = 0;
    this.$buffer = {};
  }
}

export default new Buffer();

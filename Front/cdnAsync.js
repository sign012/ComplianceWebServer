const fs = require('fs');
const path = require('path');
const upFileUpload = require('@up/file-upload')({
  bucket: 'upcdnfiles',
  busid: 'cdnAsync',
  fileUploadProxy: 'Comm.FileUploadServer.FileUploadServerObj@tcp -h 172.16.8.228 -t 60000 -p 13356 -e 0'
});

const BASE_PATH = 'algo/CompliancePcWebServer';

function getDefer() {
  const defer = {};

  defer.promise = new Promise((resolve, reject) => {
    defer.resolve = resolve;
    defer.reject = reject;
  });
  return defer;
}

// path.resolve(__dirname, '../public')

function getDirFiles(dirPath) {
  const defer = getDefer();
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      defer.reject(err);
    }

    defer.resolve(files);
  });
  return defer.promise;
}

function exists(path) {
  return fs.existsSync(path) || path.existsSync(path);
}

function isFile(path) {
  return exists(path) && fs.statSync(path).isFile();
}

function isDir(path) {
  return exists(path) && fs.statSync(path).isDirectory();
}

function uploadDir(dirPath, basePath) {
  return getDirFiles(dirPath).then((files) => {
    const promiseArr = [];

    files.forEach((filename) => {
      if (isDir(path.resolve(dirPath, filename))) {
        // 判断是否是文件夹
        promiseArr.push(uploadDir(path.resolve(dirPath, filename), `${basePath}/${filename}`));
      } else if (filename.indexOf('.map') === -1) {
        // 过滤掉css的sourcemap
        const data = fs.readFileSync(path.resolve(dirPath, filename));
        promiseArr.push(upFileUpload.uploadFile(data, filename, basePath, 1));
      }
    });

    return Promise.all(promiseArr).then((pathList) => pathList);
  });
}

uploadDir(path.resolve(__dirname, '../CompliancePcWebServer/public/compliance'), BASE_PATH).then((pathList) => {
  console.log('同步完成', pathList);
  console.log('关闭进程');
  process.exit();
});

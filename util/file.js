const path = require('path');
const fs = require('fs')

const deleteFile = filePath => {
  file = path.join(__dirname, '..', filePath);
  fs.unlink(file, err => console.log(err));
};

exports.deleteFile = deleteFile;

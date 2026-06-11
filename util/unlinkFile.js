const fs = require('fs');

const unlinkFile = (fileAddress) => {
  fs.unlink(fileAddress, err => {
    if (err) {
      console.log('error in deleting file:', err);
      return;
    }
    console.log('file has been deleted');
  });
};

exports.unlinkFile = unlinkFile;
const path = require('path');

const baseImageDir = path.join(__dirname, '../assets/questionContent/images');

function getImagePath(subject, imageFileName){
    return path.join(baseImageDir, subject, imageFileName);
}

module.exports = getImagePath;
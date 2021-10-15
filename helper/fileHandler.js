const fs = require('fs');
const path = require('path');

exports.saveBinaryFileInServerDirectory = (fileName, file, outputDirectory) => {
    const directoryPath = path.join(process.cwd(), outputDirectory)
    if (!fs.existsSync(directoryPath)){
        fs.mkdirSync(directoryPath);
    }
    const filePath = path.join(directoryPath, fileName);
    fs.writeFile(
        String(filePath),
        file,
        'binary',
        (err) => {
            console.log('ERROR!!!!', err);
        }
    );
}
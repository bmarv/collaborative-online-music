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
            if (err){
                console.log('ERROR IN SAVING BINARY FILE', err);
            }
            else{
                return true;
            }
        }
    );
}


exports.saveObjectAsJsonFileInServerDirectory = (fileName, object, outputDirectory) => {
    const directoryPath = path.join(process.cwd(), outputDirectory)
    if (!fs.existsSync(directoryPath)){
        fs.mkdirSync(directoryPath);
    }
    const filePath = path.join(directoryPath, fileName + '.json');
    fs.writeFile(
        String(filePath),
        JSON.stringify(object, null, 2),
        (err) => {
            if (err){
                console.log('ERROR IN SAVING BINARY FILE', err);
            }
            else{
                return true;
            }
        }
    );
}


exports.readJsonDataFromFile = (filePath) => {
    let jsonObject = fs.readFileSync(filePath, {encoding: 'utf-8', flag: 'r'});
    return JSON.parse(jsonObject);
}
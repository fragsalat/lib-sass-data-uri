var sass = require('node-sass');
var fs = require('fs');
var path = require('path');
var mime = require('mime-types');
var jspm;

try {
    jspm = require('jspm');
}
catch (e) { }

function loadFile(filePath) {
    var promise;
    // Handle jspm urls
    if (filePath.substr(0, 5) === 'jspm:') {
        if (!jspm) {
            throw new Error(`The package 'jspm' isn't installed.`);
        }
        promise = jspm.normalize(filePath.substr(5));
    }
    // Locate file relative to file system
    else {
        promise = Promise.resolve(path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath));
    }

    return new Promise((resolve, reject) => {
        promise.then(absolutePath => {
            var normalizedPath = path.normalize(absolutePath).replace(/^file\:|\!.*$/g, '');
            fs.readFile(normalizedPath, (error, content) => {
                error ? reject(error) : resolve({content, normalizedPath});
            })
        });
    });
}

function fileToDataURI(filePath) {
    filePath = filePath && filePath.getValue() || filePath;
    return loadFile(filePath).then((file) => {
        var mimeType = mime.lookup(file.normalizedPath);
        var base64 = file.content.toString('base64');
        console.log(mimeType, base64.length);
        return `data:${mimeType};base64,${base64}`;
    }, error => {
        console.error(error.toString());
    });
}

module.exports = {
    'data-uri($filePath)': function(filePath, done) {
        fileToDataURI(filePath).then(uri => {
            done(new sass.types.String(uri));
        });
    },
    'data-url($filePath)': function(filePath, done) {
        fileToDataURI(filePath).then(uri => {
            done(new sass.types.String(`url(${uri})`));
        });
    }
};
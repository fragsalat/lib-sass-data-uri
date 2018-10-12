var sass = require('node-sass');
var fs = require('fs');
var path = require('path');
var mime = require('mime-types');
var jspm;

try {
    jspm = require('jspm');
}
catch (e) { }

var cachedPromises = {};

function loadFile(filePath) {
    if (cachedPromises[filePath]) {
        return cachedPromises[filePath];
    }
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

    return cachedPromises[filePath] = new Promise((resolve, reject) => {
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

        var encoded = 'base64,' + file.content.toString('base64');

        // Try URL encoding to see if it saves bytes.
        let utf8Decoded = file.content.toString('utf8');
        let isValidUtf8 = (Buffer.compare(new Buffer(utf8Decoded, 'utf8'), file.content) === 0);
        if (isValidUtf8) {
            let urlEncoded = 'charset=utf-8,' + escape(utf8Decoded);
            if (urlEncoded.length < encoded.length) {
                encoded = urlEncoded;
            }
        }

        return `data:${mimeType};${encoded}`;
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

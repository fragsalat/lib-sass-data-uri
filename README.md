This plugin aims to extend lib-sass/node-sass with two functions to convert a file into a data uri and embedd these inside the css.
Works gulp-sass package and integrates with jspm.

## Installation

```javascript
var gulp = require('gulp');
var changed = require('gulp-changed');
var sass = require('gulp-sass');
var sassJspm = require('sass-jspm-importer');
var sassDataURI = require('lib-sass-data-uri');

gulp.task('build-css', function() {
  return gulp.src('**/*.scss')
    .pipe(changed('dist/', {extension: '.scss'}))
    .pipe(sass({
      errLogToConsole: true,
      functions: Object.assign(sassDataURI, {other: function() {}})
    }))
    .pipe(gulp.dest('dist/'));
});
```

## Usage

##### Paths
This plugin supports paths which are relative to the process execution folder and jspm urls which have to be prefixed with `jspm:`.
```
Relative: ../some/other/folder/font.woff
JSPM: jspm:font-awesome/fonts/fontawesome-webfont.woff
```
##### Functions
**data-url($filePath)** Converts the file content into a data uri and returns it with wrapping `url()`.

**data-uri($filePath)** Convertes the file content into a data uri and returns it as string

##### Example
```scss
@font-face {
    font-family: "fontawesome";
    src: url(data-uri('jspm:font-awesome/fonts/fontawesome-webfont.woff!text')) format('woff'),
        data-url('jspm_packages/github/FortAwesome/Font-Awesome/fonts/fontawesome-webfont.woff2') format('woff2'),;
}
```
Result
```css
@font-face {
    font-family: "fontawesome";
    src: url(data:application/font-woff;base64,<base64EncodedString>) format('woff'),
        url(data:application/font-woff;base64,<base64EncodedString>) format('woff2'),;
}
```
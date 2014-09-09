var gulp = require('gulp');
var rimraf = require('rimraf');


gulp.task('clean-js', function(cb) {
	var src = './public/dist/js';

	console.log('clean-js', src);

	rimraf(src, cb);
});
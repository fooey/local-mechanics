var gulp = require('gulp');
var rimraf = require('rimraf');


gulp.task('clean-css', function(cb) {
	var src = './public/dist/css';

	console.log('clean-css', src);
	
	rimraf(src, cb);
});
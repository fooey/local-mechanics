var gulp = require('gulp');
var rimraf = require('rimraf');


gulp.task('clean-templates', function(cb) {
	var src = './views/dist';

	console.log('clean-templates', src);

	rimraf(src, cb);
});
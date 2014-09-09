var gulp = require('gulp');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('less', ['clean-css'], function() {
	var src = './public/src/css/app.less';
	var dest = './public/dist/css';

	console.log('less', src, dest);

	var stream = gulp
		.src(src)
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(dest))

	
	stream.on('error', function (err) {
		console.log(err.toString());
		this.emit("end");
	});
	return stream;
});
var gulp = require('gulp');
var cssmin = require('gulp-minify-css');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');



gulp.task('cssmin', ['less'], function() {
	var src = './public/dist/css/app.css';
	var dest = './public/dist/css';
	console.log('cssmin', src, dest);

	var stream = gulp
		.src(src)
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(cssmin({noAdvanced: true}))
		.pipe(rename({suffix: '.min'}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(dest))
		.pipe(livereload())

	
	stream.on('error', function (err) {
		console.log(err.toString());
		this.emit("end");
	});
	return stream;
});
var gulp = require('gulp');
var uglify = require('gulp-uglifyjs');
var rename = require('gulp-rename');


gulp.task('uglify', ['browserify'], function() {
	var src = './public/dist/js/client.js';
	var dest = './public/dist/js';
	// var srcMap = './public/dist/js/client.js.map';

	console.log('uglify', src, dest/*, srcMap*/);

	var stream = gulp
		.src(src)
		.pipe(uglify('client.min.js', {
			report: 'min',
			stripBanners: true,
			// inSourceMap: srcMap,
			// outSourceMap: true,
			mangle: true,
			compress: true,
			output: {
				comments: false,
				beautify: false,
			},
		}))
		// .pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(dest))
		// .pipe(livereload()) //nodemon will trigger reload


	stream.on('error', function (err) {
		console.log(err.toString());
		this.emit("end");
	});
	return stream;
});
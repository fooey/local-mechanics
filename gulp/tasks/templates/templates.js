var gulp = require('gulp');

var htmlmin = require('gulp-htmlmin');
var jst = require('gulp-jst');
var insert = require('gulp-insert');
var dir2module  = require('../../util/gulp-dir2module');


gulp.task('templates', [/*'clean-templates'*/], function(cb) {
	var src = './views/src/**/*.html';
	var dest = './views/dist';

	console.log('templates', src, dest);

	var stream = gulp
		.src(src)
		// .pipe(cache('templates'))
			.pipe(htmlmin({
				removeComments: true,
				collapseWhitespace: true,
				conservativeCollapse: false,
				removeAttributeQuotes: true,
				removeRedundantAttributes: true,
				useShortDoctype: true,
				removeEmptyAttributes: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				// removeOptionalTags: true,
				keepClosingSlash: false,
			}))
			.pipe(jst())
			.pipe(insert.prepend("var _ = require('lodash');\nmodule.exports = "))
			.pipe(gulp.dest(dest))
		// .pipe(remember('templates'))
		.pipe(dir2module('./index.js'))
		.pipe(gulp.dest(dest))

	
	stream.on('error', function (err) {
		console.log(err.toString());
		this.emit("end");
	});
	return stream;
});
var gulp = require('gulp');
var livereload = require('gulp-livereload');
// var reloadDebounce = _.debounce(function(){livereload.changed()}, 1000);


gulp.task('watch', function(cb) {
	// console.log('start livereload');
	livereload.listen({
		silent: false,
		auto: true,
	});
	
	// console.log('start watchers');
	var watchJs = gulp.watch([
			'./client.js',
			'./lib/**/*.js',
			'./routes/**/*.js',
			'./views/src/**/*.html',
			]
		, {debounceDelay: 100}, ['build-js'])
		// .on('change', livereload.changed);

	var watchCss = gulp.watch([
			'./public/src/css/**/*.less',
		], {debounceDelay: 100}, ['build-css'])

	cb();
});
var requireDir = require('require-dir');

// Require all tasks in gulp/tasks, including subfolders
requireDir('./gulp/tasks', { recurse: true });


var gulp = require('gulp');

var _ = require('lodash');
var livereload = require('gulp-livereload');
var reloadDebounce = _.debounce(function(){livereload.changed()}, 1000);




/*
*
*	Tasks Wrappers
*
*/

gulp.task('build-css', ['cssmin'], function(cb) {
	// console.log('build-css complete');
	cb();
});

gulp.task('build-js', ['uglify'], function(cb) {
	// console.log('build-js complete');
	cb();
});

gulp.task('build-templates', ['templates'], function(cb) {
	// console.log('build-templates complete');
	cb();
});


gulp.task('build', ['build-js', 'build-css'], function(cb) {
	// console.log('build complete');
	cb();
});


gulp.task('default', ['build', 'watch'], function(cb) {
	var nodemon = require('gulp-nodemon');
	
	nodemon({
			script: './server.js',
			nodeArgs: ['--harmony'],
			ext: 'js,html',
			ignore: [
				'.git/**',
				
				'gulpfile.js',
				'gulp/**',

				'node_modules/**',
				'bower_components/**',
				'public/dist/**',
				'views/dist/**',
			],

			delay: 2000,
			env: {
				PORT: '3000',
				NODE_ENV: 'development',
			},
		})
		.on('restart', reloadDebounce);

	reloadDebounce();

	// console.log('default task complete');
	cb();
});




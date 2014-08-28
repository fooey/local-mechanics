var gulp = require('gulp');

var livereload = require('gulp-livereload');

var rename = require('gulp-rename');
var rimraf = require('rimraf');
var insert = require('gulp-insert');
var dir2module  = require('./lib/gulp/gulp-dir2module');

var cache = require('gulp-cached');
var remember = require('gulp-remember');

var sourcemaps = require('gulp-sourcemaps');




/*
*
*	config
*
*/

var pubSrc = './public/src';
var pubDist = './public/dist';

var cssSrc = pubSrc + '/css';
var cssDist = pubDist + '/css';

var jsDist = pubDist +  '/js';

// var jadeSrc = './views/**/*.jade';
// var jadeDist = pubDist + '/views';

var jstSrc = './views/src/**/*.html';
var jstDist = './views/dist';


// Nodemon Options
var nodemonOptions = {
	script: './server.js',
	nodeArgs: ['--harmony'],
	ext: 'js,html',
	ignore: [
		'.git/**',
		'.rebooted',

		'node_modules/**',
		'bower_components/**',

		'gulpfile.js',
		
		'public/dist/**',
		// 'client.js',
		// 'lib/client/**',
	],

	delay: 2000,
	env: {
		PORT: '3003',
		NODE_ENV: 'development',
	},
};



/*
*
*	CSS/Less Tasks
*
*/

gulp.task('clean-css', function(cb) {
	// console.log('clean-css', cssDist);
	rimraf(cssDist, cb);
});

gulp.task('less', ['clean-css'], function() {
	var less = require('gulp-less');
	var entry = cssSrc + '/app.less';
	console.log('less', entry, cssDist);

	var stream = gulp
		.src(entry)
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(cssDist))

	stream.on('error', console.error.bind(console));
	return stream;
});


gulp.task('cssmin', ['less'], function() {
	var cssmin = require('gulp-minify-css');
	var entry = cssDist + '/app.css';
	console.log('cssmin', cssDist);

	var stream = gulp
		.src(entry)
		// .pipe(sourcemaps.init({loadMaps: true}))
		.pipe(cssmin())
		.pipe(rename({suffix: '.min'}))
		// .pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(cssDist))
		.pipe(livereload())

	stream.on('error', console.error.bind(console));
	return stream;
});



/*
*
*	Javascript Tasks
*
*/

gulp.task('clean-js', function() {
	// console.log('clean-js', jsDist);
	rimraf(jsDist, cb);
});

gulp.task('browserify', [/*'clean-js',*/ 'templates'], function() {
	var browserify = require('gulp-browserify');
	var jsEntry = 'client.js';
	// console.log('browserify', jsEntry);

	var stream = gulp
		.src(jsEntry)
		.pipe(browserify({
			insertGlobals: false,
			debug: true,
			ignore: ['buffer', 'request', 'zlib'],
			external: ['async', 'bootstrap', 'jquery', 'templates'],
		}))
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(sourcemaps.write('./', {includeContent: true}))
		.pipe(gulp.dest(jsDist))

	stream.on('error', console.error.bind(console));
	return stream;
});


gulp.task('uglify', ['browserify'], function() {
	var uglify = require('gulp-uglifyjs');
	var entry = jsDist + '/client.js';
	var dest = 'client.min.js';
	var map = 'client.js.map';

	// console.log('uglify', entry, jsDist);

	var stream = gulp
		.src(entry)
		.pipe(uglify(dest, {
			report: 'min',
			stripBanners: true,
			inSourceMap: map,
			outSourceMap: true,
			mangle: true,
			compress: true,
			output: {
				comments: false,
				beautify: false,
			},
		}))
		.pipe(gulp.dest(jsDist))
		// .pipe(livereload()) //nodemon will trigger reload

	stream.on('error', console.error.bind(console));
	return stream;
});



/*
*
*	Templates
*
*/

gulp.task('clean-templates', function(cb) {
	rimraf(jstDist, cb);
});


gulp.task('templates', ['clean-templates'], function(cb) {
	var jst = require('gulp-jst');

	var stream = gulp
		.src(jstSrc)
		.pipe(jst())
		.pipe(insert.prepend("var _ = require('lodash');\nmodule.exports = "))
		.pipe(gulp.dest(jstDist))
		.pipe(dir2module('./index.js'))
		.pipe(gulp.dest(jstDist))

	stream.on('error', console.error.bind(console));
	return stream;
});





/*
*
*	Change Monitoring
*
*/

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
			cssSrc + '/**/*.less'
		], {debounceDelay: 100}, ['build-css'])
		// .on('change', function () {
			console.log('nodemon::restart');
		// 	setTimeout(livereload.changed, 1000)
		// });

	cb();
});



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




gulp.task('heroku:production', ['build', 'bower'], function(cb) {
	// console.log('build complete');
	cb();
});


gulp.task('default', ['build', 'watch'], function(cb) {
	var nodemon = require('gulp-nodemon');
	
	nodemon(nodemonOptions)
		.on('start', livereload.changed)
		.on('restart', function () {
			// console.log('nodemon::restart');
			setTimeout(livereload.changed, 500)
		});

	// console.log('default task complete');
	cb();
});




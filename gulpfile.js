var gulp = require('gulp');

var nodemon = require('gulp-nodemon');
var livereload = require('gulp-livereload');

var rename = require('gulp-rename');
var rimraf = require('gulp-rimraf');
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

var jadeSrc = './views';
var jadeDist = pubDist + '/views';

var bowerJson = './bower.json';
var bowerDist = './bower_components';


// Nodemon Options
var nodemonOptions = {
	script: './server.js',
	nodeArgs: ['--harmony'],
	ext: 'js,jade',
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

gulp.task('clean-css', function() {
	console.log('clean-js', cssDist);
	var stream = gulp
		.src(cssDist, { read: false }).pipe(rimraf());
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
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(cssmin())
		.pipe(rename({suffix: '.min'}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(cssDist))
		.pipe(livereload({auto: false}))

	stream.on('error', console.error.bind(console));
	return stream;
});



/*
*
*	Javascript Tasks
*
*/

gulp.task('clean-js', function() {
	console.log('clean-js', jsDist);
	var stream = gulp
		.src(jsDist, { read: false }).pipe(rimraf());

	stream.on('error', console.error.bind(console));
	return stream;
});

gulp.task('browserify', [/*'clean-js', */'jade'], function() {
	var browserify = require('gulp-browserify');
	var jsEntry = 'client.js';
	console.log('browserify', jsEntry);

	var stream = gulp
		.src(jsEntry)
		.pipe(browserify({
			insertGlobals: false,
			debug: true,
			ignore: ['buffer', 'request', 'zlib'],
			external: ['async', 'bootstrap', 'jade', 'jquery', 'lodash', 'templates'],
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

	console.log('uglify', entry, jsDist);

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
*	Jade Tasks
*
*/

gulp.task('clean-jade', function() {
	console.log('clean-jade', jadeDist);
	var stream = gulp
		.src(jadeDist, { read: false }).pipe(rimraf());

	stream.on('error', console.error.bind(console));
	return stream;
});


gulp.task('jade'/*, ['clean-jade']*/, function() {
	var jade = require('gulp-jade');
	var entry = jadeSrc + '/**/*.jade';
	var dest = jadeDist;

	console.log('jade', entry, jadeDist);

	return gulp
		.src(entry)
		.pipe(cache('jade'))
		.pipe(jade({
			client: true,
			debug: false,
			self: false,
			compileDebug: false,
		}))

		.pipe(insert.prepend('module.exports = '))
		.pipe(gulp.dest(dest))

		.pipe(remember('jade'))
		.pipe(dir2module('./index.js'))
		.pipe(gulp.dest(dest))

	stream.on('error', console.error.bind(console));
	return stream;
});





/*
*
*	Change Monitoring
*
*/

gulp.task('watch', function(callback) {
	console.log('start livereload');
	
	console.log('start watchers');
	var watchJs = gulp
		.watch([
			'./client.js',
			'./lib/**/*.js',
			'./routes/**/*.js',
			'./views/**/*.jade',
		], ['build-js']);

	var watchCss = gulp
		.watch([
			cssSrc + '/**/*.less'
		], ['build-css']);
	// var watchJade = gulp.watch(jadeSrc + '/**/*.jade', ['build-templates']);

	// var watchJade = gulp.watch('./rebooted');

	callback();
});



/*
*
*	Bower
*
*/

gulp.task('bower', function() {
	// var mainBowerFiles = require('main-bower-files');
	var bower = require('gulp-bower');

	var stream = bower()
    	.pipe(gulp.dest(bowerDist))
	return stream;
});



/*
*
*	Tasks Wrappers
*
*/

gulp.task('build-css', ['cssmin'], function(cb) {
	console.log('build-css complete');
	cb();
});

gulp.task('build-js', ['uglify'], function(cb) {
	console.log('build-js complete');
	cb();
});

gulp.task('build-templates', ['jade'], function(cb) {
	console.log('build-templates complete');
	cb();
});


gulp.task('build', ['build-js', 'build-css'], function(cb) {
	console.log('build complete');
	cb();
});




gulp.task('heroku', ['build', 'bower'], function(cb) {
	console.log('build complete');
	cb();
});


gulp.task('default', ['build', 'watch'], function(cb) {
	livereload.listen({
		silent: false,
		auto: true,
	});

	nodemon(nodemonOptions)
		.on('start', livereload.changed)
		.on('restart', function () {
			console.log('nodemon::restart');
			setTimeout(livereload.changed, 500)
		});

	console.log('default task complete');
	cb();
});




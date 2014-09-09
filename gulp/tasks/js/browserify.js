var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');


gulp.task('browserify', [/*'clean-js', */'templates'], function() {
	var src = './client.js';
	var dest = './public/dist/js';
	console.log('browserify', src, dest);

	var stream = browserify({
			entries: [src],
			debug: true,
			// insertGlobals: false,
			// detectGlobals: true,
			bundleExternal: true,
			ignore: ['request', 'zlib'],
		})
		.bundle()
		// Report compile errors
		
		// Use vinyl-source-stream to make the
		// stream gulp compatible. Specifiy the
		// desired output filename here.
		.pipe(source('client.js'))
		// Specify the output destination
		.pipe(gulp.dest(dest));


	stream.on('error', function (err) {
		console.log(err.toString());
		this.emit("end");
	});
	
	return stream;
});
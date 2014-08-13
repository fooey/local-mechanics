module.exports = {
	server: {
		files: ['.rebooted'],
		options: {
			livereload: true
		}
	},


	lessApp: {
		files: [
			'public/src/css/*.less'
		],
		tasks: ['less:dev'],
		options: {
			livereload: false,
		},
	},


	jsDev: {
		files: [
			'client.js',
			'routes/**/*.js',
			'lib/**/*.js',
			'views/**/*.jade',
		],
		// tasks: ['uglify:appJs'],
		tasks: ['build-js'],
		options: {
			livereload: false,
			debounceDelay: 250,
		},
	},


	jadeSrc: {
		files: [
			'lib/compile/client.js',
			'views/src/**/*.jade',
		],
		// tasks: ['uglify:appJs'],
		tasks: ['build-templates'],
		options: {
			livereload: false,
			debounceDelay: 250,
		},
	},



	reloadJS: {
		files: [
			'public/dist/js/app.js',
			'public/dist/js/app.min.js',
		],
		options: {
			livereload: true,
			debounceDelay: 250,
		},
	},

	reloadCSS: {
		files: [
			'public/dist/css/*.css',
			'!public/dist/css/*.min.css',
		],
		tasks: ['cssmin'],
		options: {
			livereload: true,
		},
	},

	reloadJade: {
		files: [
			'views/compiled.min.js',
		],
		options: {
			livereload: true,
		},
	},
}
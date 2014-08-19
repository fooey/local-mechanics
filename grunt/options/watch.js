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
			// debounceDelay: 100,
		},
	},


	jadeSrc: {
		files: [
			'lib/compile/client.js',
			'views/**/*.jade',
		],
		// tasks: ['uglify:appJs'],
		tasks: ['build-templates'],
		options: {
			livereload: false,
			// debounceDelay: 100,
		},
	},



	// reloadJS: {
	// 	files: [
	// 		'public/dist/js/client.js',
	// 		'public/dist/js/client.min.js',
	// 	],
	// 	options: {
	// 		livereload: true,
			// debounceDelay: 100,
	// 	},
	// },

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

	// reloadJade: {
	// 	files: [
	// 		'views/compiled.min.js',
	// 	],
	// 	options: {
	// 		livereload: true,
	// 	},
	// },
}
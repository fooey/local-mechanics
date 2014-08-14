module.exports = {
	options: {
		report: 'min',
		stripBanners: true,
		// banner: '/*! <%= grunt.template.today("yyyy-mm-dd") %> */\n\n',
		sourceMap: true,
		mangle: true,
		compress: true,
		beautify: false,
		'screw-ie8': true,
		preserveComments: false,
	},
	appJs: {
		options: {
			sourceMapIn: 'public/dist/js/client.js.map',
		},
		files: {
			'public/dist/js/client.min.js': [
				'public/dist/js/client.js',
			]
		}
	},
	jadeJs: {
		files: {
			'public/dist/views/compiled.min.js': [
				'public/dist/views/compiled/init.js',
				'public/dist/views/compiled/**/*.js',
			]
		}
	},
}
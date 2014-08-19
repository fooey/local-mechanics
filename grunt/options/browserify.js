module.exports = {
	options: {
		browserifyOptions: {
			debug: true,
		},
		ignore: ['buffer', 'request', 'zlib'],
		external: ['async', 'bootstrap', 'jade', 'jquery', 'lodash', 'templates'],
	},
	app: {
		src: './client.js',
		dest: 'public/dist/js/client.js'
	}
}
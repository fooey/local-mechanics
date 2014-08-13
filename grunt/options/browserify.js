module.exports = {
	options: {
		debug: true,
		ignore: ['buffer', 'request', 'zlib'],
		external: ['async', 'bootstrap', 'jade', 'jquery', 'lodash', 'page', 'templates'],
	},
	app: {
		src: './client.js',
		dest: 'public/dist/js/client.js'
	}
}
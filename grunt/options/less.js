module.exports = {
	dev: {
		files: {
			"./public/dist/css/app.css":
				"./public/src/css/app.less"
		},
		options: {
			sourceMap: true,
			sourceMapURL: '/dist/css/app.css.map',
			sourceMapFilename: './public/dist/css/app.css.map',
			sourceMapBasepath: './public/src',
			sourceMapRootpath: '/',
		}
	},
}
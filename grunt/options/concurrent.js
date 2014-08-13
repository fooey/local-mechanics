module.exports = {
	dev: {
		tasks: ['nodemon:dev', 'watch'],
		options: {
			logConcurrentOutput: true
		}
	},
	prod: {
		tasks: ['nodemon:prod', 'watch'],
		options: {
			logConcurrentOutput: true
		}
	},
	debug: {
		tasks: ['nodemon:dev', 'node-inspector', 'watch'],
		options: {
			logConcurrentOutput: true
		}
	}
}
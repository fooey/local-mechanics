module.exports = function(grunt) {
	grunt.registerTask('build-js', ['browserify', 'exorcise', 'uglify:appJs']);
};
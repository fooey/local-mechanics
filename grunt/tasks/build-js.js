module.exports = function(grunt) {
	grunt.registerTask('build-js', ['browserify', 'uglify:appJs']);
};
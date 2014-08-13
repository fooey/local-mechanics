module.exports = function(grunt) {
	grunt.registerTask('prod', ['build', 'concurrent:prod']);
};
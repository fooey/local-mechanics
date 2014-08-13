module.exports = function(grunt) {
	grunt.registerTask('dev', ['build', 'concurrent:dev']);
};
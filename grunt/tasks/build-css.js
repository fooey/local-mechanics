module.exports = function(grunt) {
	grunt.registerTask('build-css', ['less', 'cssmin']);
};
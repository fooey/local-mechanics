module.exports = function(grunt) {
	grunt.registerTask('install', ['bower:install', 'build']);
};
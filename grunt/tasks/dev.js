module.exports = function(grunt) {
	// grunt.registerTask('dev', ['build', 'concurrent:dev']);
	grunt.registerTask('dev', ['install', 'concurrent:dev']);
};
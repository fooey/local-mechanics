module.exports = function(grunt) {
	grunt.registerTask('build-templates', ['shell:jade', 'uglify:jadeJs']);
};
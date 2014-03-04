/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
  	spritesheet: {
  		generate: {
		    // An array of filename / source images array pairs. The basename of the sprite file
		    // is also prefixed to the CSS classes.
		    sprites: {
		    	"img/sprites.png": ['img/sprites/*.png']
		    },
		    // The destination for the build stylesheet
		    sheet: "styles/sprites.css",
		    tempateUrl: "styles/template.mustache"
  		}
	},
	
});

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-spritesheet');

  // Default task.
  grunt.registerTask('default', ['spritesheet:generate']);

};

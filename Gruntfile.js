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
	sass: {                              // Task
		dist: {                            // Target
			options: {                       // Target options
				style: 'expanded'
		  	},
		  	files: [{
				expand: true,
				cwd: 'styles',
				src: ['*.scss'],
				dest: 'styles',
				ext: '.css'
			}]
		}
	},
	'sass-watch':{
		options:{
			path: 'styles'
		}
	}

});

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-spritesheet');
  grunt.loadNpmTasks('grunt-contrib-sass');

	// Assumes the styles (css and scss) directory is located at 'app/styles'.
	grunt.loadNpmTasks('grunt-sass-watch');

	grunt.registerTask('watch', ['sass-watch']);

  // Default task.
  grunt.registerTask('default', ['spritesheet:generate']);


};

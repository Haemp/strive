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
		'sassWatch': {
			style: {
				options: {
					path: 'styles'
				}
			}
		},
		complexity: {
			generic: {
				src: ['src/Strive.js','src/Models.js'],
				options: {
					breakOnErrors: false,
					jsLintXML: 'report.xml', // create XML JSLint-like report
					checkstyleXML: 'checkstyle.xml', // create checkstyle report
					errorsOnly: false, // show only maintainability errors
					cyclomatic: [3, 7, 12], // or optionally a single value, like 3
					halstead: [8, 13, 20], // or optionally a single value, like 8
					maintainability: 100,
					hideComplexFunctions: false // only display maintainability
				}
			}
		}

	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-spritesheet');
	grunt.loadNpmTasks('grunt-sassWatch');
	grunt.loadNpmTasks('grunt-complexity');

	//grunt.registerTask('watch', ['sass-watch']);

	// Default task.
	grunt.registerTask('default', ['spritesheet:generate']);
	grunt.registerTask('watch', ['sassWatch:style']);
	grunt.registerTask('complex?', ['complexity']);
};
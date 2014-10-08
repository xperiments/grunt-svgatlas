# grunt-svgatlas

A simple task to pack multiple svg file into one binary packed svg file.


## Installation
	$ sudo npm install grunt-svgatlas --save-dev
	
## Usage

	grunt.initConfig({
	  svgatlas:
          {
              main:{
                  dst:'resources/atlas/atlas',
                  src:['resources/svg/*.svg'],
                  png:true,
                  prettify:true
              }
          }
	});

	// load task.
    grunt.loadNpmTasks('grunt-svgatlas');


# Options

* dst: Destination filename without extension
* src: Source svg's to be included
* png: If true, also generates a png version of the spritesheet
* prettify: if true .json output will be prettified
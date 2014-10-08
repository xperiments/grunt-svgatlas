/*
 * grunt-pngdrive
 * https://github.com/xperiments/grunt-pngdrive
 *
 * Copyright (c) 2014 Pedro Casaubon
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

	var fs = require('fs');
	var path = require('path');
    var svg2png = require('svg2png');
    var sizeOf = require('image-size');
    var packer = require('./lib/SVGPacker').SVGPacker;




	grunt.registerMultiTask('svgatlas', 'The best Grunt plugin ever.', function () {

        var done = this.async();
        var totalGroups = this.files.length-1;
        this.files.forEach(function(config,fileID) {

            var dst = config.dst;
            var files = grunt.file.expand(config.src);
            var todo = files.length-1;
            var dynamicSheet = new packer.DynamicTextureAtlas( "svgatlas" );
            config.src.forEach(function(file) {


                var dstFile = path.dirname(file)+'/tmp/'+path.basename(file)+'.png';
                svg2png(file, dstFile, function (err) {

                    if( err ) throw err;
                    // determine image size
                    var imageSize = sizeOf(dstFile);

                    // add image to atlas
                    dynamicSheet.add(
                        path.basename(file)
                        ,imageSize
                        ,fs.readFileSync(file,'utf8').replace('<?xml version="1.0" encoding="UTF-8" standalone="no"?>','')
                    );

                    if( todo == 0 ) {
                        var render = dynamicSheet.render();
                        fs.writeFileSync( dst+'.svg', render.svg );
                        if( config.png ) {

                            svg2png(dst + '.svg', dst + '.png', function (err) {
                                if (err) throw err;
                                var imageSize = sizeOf(dst + '.png');
                                //render.atlas.meta.size = { w:imageSize.width, h:imageSize.height };

                                fs.writeFileSync( dst +'.json', JSON.stringify( render.atlas, null, config.prettify ? 4:null ) );
                                if (totalGroups-- == 0) {
                                    done()
                                }
                            });
                        }
                        else {
                            fs.writeFileSync( dst +'.json', JSON.stringify( render.atlas, null, config.prettify ? 4:null ) );
                            if (totalGroups-- == 0) { done(); }
                        }
                    }
                    todo--;

                });


            })

        });



	});

};

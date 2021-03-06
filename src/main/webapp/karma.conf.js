/*
 * Copyright (C) SWAN (Saar Web-based ANotation system) contributors. All rights reserved.
 * Licensed under the GPLv2 License. See LICENSE in the project root for license information.
 */
module.exports = function(config){
  config.set({

    basePath : './',

    files : [
    	// Include here external libraries for the tests if needed
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/d3/d3.min.js',
        'bower_components/d3/d3.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-route/angular-route.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/angular-animate/angular-animate.js',
        'bower_components/angular-hotkeys/build/hotkeys.min.js',
        'bower_components/angular-clipboard/angular-clipboard.js',
        'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
        'bower_components/bootstrap/dist/js/bootstrap.min.js',
        'bower_components/bootstrap-tour/build/js/bootstrap-tour.min.js',
        'bower_components/jsog/lib/JSOG.js',

        'other/*.js',
        'entities/*.js',

        'components/**/*.js',
        'modules/*.js',
        'services/dataServices.js',
        'controllers/*.js',
        'controllers/**/*.js',
        'directives/*.js',
        'tests/**/*.js',

        // fixtures
        { pattern: 'testdata/schemes/*.json', watched: true, served: true, included: false }
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : [
        'Chrome',
        'Firefox'
    ],

    reporters: [
        'progress',
        'coverage'
    ],

    plugins : [
        'karma-chrome-launcher',
        'karma-firefox-launcher',
        'karma-jasmine',
        'karma-coverage',
        'karma-junit-reporter'
    ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    },

	  // Custom launcher for Travis-CI
	  customLaunchers: {
		  Chrome_travis_ci: {
			  base: 'Chrome',
			  flags: ['--no-sandbox']
		  }
	  }

  });

	if(process.env.TRAVIS){
		config.browsers = ['Chrome_travis_ci'];
	}

};

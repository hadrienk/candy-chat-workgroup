module.exports = function (config) {
    config.set({

        frameworks: ['mocha', 'chai', 'sinon-chai'],
        browsers: ['PhantomJS'],

        // Karma config using:
        //  configFile: 'karma.conf.js',
        // or direct options
        frameworks: ['mocha', 'chai', 'sinon-chai'],
        /*plugins: [
            'karma-mocha',
            'karma-chai',
            'karma-sinon-chai'
            //'karma-sinon',
            //'karma-browserify',
            //'karma-phantomjs-launcher'
        ],*/
        files: [
            'src/**/*.js',
            'test/**/*.js'
        ],
        reporters: ['spec'],
        preprocessors: {
            '**/*.coffee': 'coffee'
        }
    });
};
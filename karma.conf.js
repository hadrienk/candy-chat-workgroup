module.exports = function (config) {
    config.set({
        
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
            'plugin.js',
            'test.coffee'
        ],
        reporters: ['spec'],

        preprocessors: {
            '**/*.coffee': 'coffee'
        }
    });
};

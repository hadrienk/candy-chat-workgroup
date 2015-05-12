module.exports = function (config) {
    config.set({

        browsers: ['PhantomJS'],
        frameworks: ['mocha', 'chai', 'sinon-chai'],
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

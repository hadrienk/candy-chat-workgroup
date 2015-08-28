module.exports = function (config) {
    config.set({

        browsers: ['PhantomJS'],
        frameworks: ['mocha', 'chai', 'sinon-chai', 'jquery-1.10.2'],
        files: [
            'node_modules/strophe/strophe.js',
            'plugin.js',
            'test.coffee'
        ],
        reporters: ['spec'],
        preprocessors: {
            '**/*.coffee': 'coffee'
        }
    });
};

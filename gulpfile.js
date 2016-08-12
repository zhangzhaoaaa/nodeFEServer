'use strict';
var gulp = require('gulp');
var webpack = require('webpack');
var gulpWebpack = require('webpack-stream');
var clean = require('gulp-clean');
var gulpIf = require('gulp-if');
var rename = require('gulp-rename');
var rev = require('gulp-rev-hash');
var path = require('path');

var pwd = __dirname;

var vendorPlugin = new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    filename: 'vendor.min.js',
    minChunks: Infinity
});

var targetDist = 'dist';
if (process.env.NODE_ENV === 'localdev' || process.env.NODE_ENV === 'localtest') {
    targetDist = 'dist';
} else {
    targetDist = process.env.NODE_ENV + '/dist';
}

var webpackConfig = {
    entry: {
        femonitor: ['./src/js/app.js'],
        vendor: [
            'vue',
            'vue-router',
            'vue-resource'
        ]
    },
    watch: true,
    devtool: '#eval-source-map',
    output: {
        filename: '[name].min.js'
    },
    module: {
        loaders: [{
            test: /.js$/,
            loader: 'babel-loader',
            include: [path.join(pwd, './src')]
        }, {
            test: /.vue$/,
            loader: 'vue-loader'
        }, {
            test: /\.json$/i,
            loader: 'json-loader'
        }]
    },
    plugins: [vendorPlugin],
    resolve: {
        extensions: ['', '.js', '.json'],
        alias: {

        }
    }
};


gulp.task('clean', function() {
    return gulp
        .src(['./development/*', './test/*', './pre-production/*', './production/*', './dist/*'], { read: false })
        .pipe(clean({ force: true }))
});

gulp.task('js', function() {
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'pre-production' || process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
        webpackConfig.watch = false;
        delete webpackConfig.devtool;
        webpackConfig.entry.femonitor.pop();
    }
    if (process.env.NODE_ENV === 'production') {
        webpackConfig.plugins.push(new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }))
        webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                drop_console: true
            }
        }))
    }
    return gulp
        .src('./src/js/app.js')
        .pipe(gulpWebpack(webpackConfig))
        .on('error', function(err) {})
        .pipe(gulp.dest('./' + targetDist + '/js/'))
        .pipe(gulp.dest('./dist/js/'))
})

gulp.task('rev', function() {
    return gulp
        .src('./index.html')
        .pipe(gulpIf(process.env.NODE_ENV === 'production', rev({
            assetsDir: path.join(pwd)
        })))
        .pipe(gulp.dest('./' + targetDist === 'dist' ? '' : targetDist.replace('/dist', '')));
})

gulp.task('watch', function() {
    gulp.start(['js']);
})

gulp.task('build', ['js']);

gulp.task('default', ['build'], function() {
    gulp.start('rev');
});

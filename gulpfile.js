const pump = require('pump');
const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
var url = require('url');
const browserSync = require('browser-sync').create();
const httpProxy = require('http-proxy');
const proxy = require('proxy-middleware');

let devMode = false;

const stylesDev = [
    "./src/css/**/*.css",
    "./node_modules/bootstrap/dist/css/bootstrap.css",
    "./node_modules/js-datepicker/datepicker.css"
];

const stylesProd = [
    "./src/css/**/*.css",
    "./node_modules/bootstrap/dist/css/bootstrap.min.css",
    "./node_modules/js-datepicker/datepicker.min.css"
];

const scriptsDev = [
    "./node_modules/jquery/dist/jquery.js",
    "./node_modules/angular/angular.js",
    "./node_modules/angular-route/angular-route.js",
    "./node_modules/bootstrap/dist/js/bootstrap.js",
    "./node_modules/js-datepicker/datepicker.js",
    "./node_modules/chart.js/dist/Chart.js",
    "./src/js/**/*.js"
];

const scriptsProd = [
    "./node_modules/jquery/dist/jquery.min.js",
    "./node_modules/angular/angular.min.js",
    "./node_modules/angular-route/angular-route.min.js",
    "./node_modules/bootstrap/dist/js/bootstrap.min.js",
    "./node_modules/js-datepicker/datepicker.min.js",
    "./node_modules/chart.js/dist/Chart.min.js",
    "./src/js/**/*.js"
];

gulp.task('css', function () {
    gulp.src(devMode ? stylesDev : stylesProd)
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('js', function (cb) {
    if (devMode) {
        pump([
            gulp.src(scriptsDev),
            concat('bundle.js'),
            gulp.dest('./dist/js'),
            browserSync.reload({
                stream: true
            })
        ],
            cb
        );
    }else {
        pump([
            gulp.src(scriptsProd),
            uglify(),
            concat('bundle.min.js'),
            gulp.dest('./dist/js'),
            browserSync.reload({
                stream: true
            })
        ],
            cb
        );
    }

});

gulp.task('html', function () {
    gulp.src('./src/templates/**/*.html')
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('build', function () {
    gulp.start(['css', 'js', 'html']);
});



gulp.task('browser-sync', function () {
    var proxyOptions = url.parse('http://localhost/api/');
    proxyOptions.route = '/api/';

    browserSync.init(null, {
        open: false,
        port: 3000,
        server: {
            baseDir: 'dist',
            middleware: [proxy(proxyOptions)]
        }
    });
});

gulp.task('startDev', function () {
    devMode = true;
    gulp.start(['build', 'browser-sync']);
    gulp.watch(['./src/css/**/*.css'], ['css']);
    gulp.watch(['./src/js/**/*.js'], ['js']);
    gulp.watch(['./src/templates/**/*.html'], ['html']);
});

gulp.task('buildProd', function () {
    devMode = false;
    gulp.start(['build']);
});
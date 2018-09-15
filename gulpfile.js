const pump = require('pump');
const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglifyes');
const url = require('url');
const browserSync = require('browser-sync').create();
const proxy = require('proxy-middleware');
const sourcemaps = require('gulp-sourcemaps')
const rollup = require('gulp-better-rollup')
const babel = require('rollup-plugin-babel')
const eslint = require('gulp-eslint');

let devMode = false;

const stylesDev = [
    "./node_modules/bootstrap/dist/css/bootstrap.css",
    "./node_modules/angular-material/angular-material.css",
    "./node_modules/@fortawesome/fontawesome-free/css/all.css",
    "./node_modules/video.js/dist/video-js.css",
    "./src/css/**/*.css"
];

const stylesProd = [
    "./node_modules/bootstrap/dist/css/bootstrap.min.css",
    "./node_modules/angular-material/angular-material.min.css",
    "./node_modules/@fortawesome/fontawesome-free/css/all.min.css",
    "./node_modules/video.js/dist/video-js.min.css",
    "./src/css/**/*.css"
];

const scriptsDev = [
    "./node_modules/jquery/dist/jquery.js",
    "./node_modules/angular/angular.js",
    "./node_modules/angular-route/angular-route.js",
    "./node_modules/angular-animate/angular-animate.js",
    "./node_modules/angular-aria/angular-aria.js",
    "./node_modules/angular-messages/angular-messages.js",
    "./node_modules/angular-material/angular-material.js",
    "./node_modules/bootstrap/dist/js/bootstrap.js",
    "./node_modules/chart.js/dist/Chart.js",
    "./node_modules/video.js/dist/video.js",
    "./src/js/**/*.js"
];

const scriptsProd = [
    "./node_modules/jquery/dist/jquery.min.js",
    "./node_modules/angular/angular.min.js",
    "./node_modules/angular-route/angular-route.min.js",
    "./node_modules/angular-animate/angular-animate.min.js",
    "./node_modules/angular-aria/angular-aria.min.js",
    "./node_modules/angular-messages/angular-messages.min.js",
    "./node_modules/angular-material/angular-material.min.js",
    "./node_modules/bootstrap/dist/js/bootstrap.min.js",
    "./node_modules/chart.js/dist/Chart.min.js",
    "./node_modules/video.js/dist/video.min.js",
    "./src/js/**/*.js"
];

const fonts1 = [
    "./node_modules/bootstrap/fonts/glyphicons-halflings-regular.woff2",
    "./node_modules/bootstrap/fonts/glyphicons-halflings-regular.woff"
]

const webFonts1 = [
    escape("./node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.woff2")
]

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
    } else {
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

gulp.task('fonts', function () {
    gulp.src(fonts1)
        .pipe(gulp.dest('./dist/fonts/'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('webFonts', function () {
    gulp.src(webFonts1)
        .pipe(gulp.dest('./dist/webfonts/'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('browser-sync', function () {
    let proxyOptionsApi = url.parse('http://localhost/api/');
    proxyOptionsApi.route = '/api/';

    let proxyOptionsImg = url.parse('http://localhost/img/');
    proxyOptionsImg.route = '/img/';

    browserSync.init(null, {
        open: false,
        port: 3000,
        server: {
            baseDir: 'dist',
            middleware: [proxy(proxyOptionsApi), proxy(proxyOptionsImg)]
        }
    });
});

gulp.task('linter', function () {
    return gulp.src(['./src/js/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('build', function () {
    gulp.start(['css', 'js', 'linter', 'html', 'fonts', 'webFonts']);
});

gulp.task('startDev', function () {
    devMode = true;
    gulp.start(['build', 'browser-sync']);
    gulp.watch(['./src/css/**/*.css'], ['css']);
    gulp.watch(['./src/js/**/*.js'], ['js', 'linter']);
    gulp.watch(['./src/templates/**/*.html'], ['html']);
});

gulp.task('buildProd', function () {
    devMode = false;
    gulp.start(['build']);
});

gulp.task('buildDev', function () {
    devMode = true;
    gulp.start(['build']);
});

gulp.task('publish', function () {
    gulp.src('./dist/**/*.*')
        .pipe(gulp.dest('./../wwwroot/'));
});
const gulp = require('gulp');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();

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
    "./src/js/**/*.js",
    "./node_modules/angular/angular.js",
    "./node_modules/angular-route/angular-route.js",
    "./node_modules/jquery/dist/jquery.js",
    "./node_modules/bootstrap/dist/js/bootstrap.js",
    "./node_modules/js-datepicker/datepicker.js"
];

const scriptsProd = [
    "./src/js/**/*.js",
    "./node_modules/angular/angular.min.js",
    "./node_modules/angular-route/angular-route.min.js",
    "./node_modules/jquery/dist/jquery.min.js",
    "./node_modules/bootstrap/dist/js/bootstrap.min.js",
    "./node_modules/js-datepicker/datepicker.min.js"
];

gulp.task('css', function () {
    gulp.src(devMode ? stylesDev : stylesProd)
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('js', function () {
    gulp.src(devMode ? scriptsDev : scriptsProd)
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest('./dist/js'))
        .pipe(browserSync.reload({
            stream: true
        }));
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
    browserSync.init(null, {
        open: false,
        server: {
            baseDir: 'dist'
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
    gulp.start(['build', 'browser-sync']);
});
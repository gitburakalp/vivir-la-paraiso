var gulp = require('gulp'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    prefix = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create(),
    size = require('gulp-size'),
    plumber = require('gulp-plumber'),
    sourcemaps = require('gulp-sourcemaps');

var bases = {
        app: './src/',
        dist: './dist/'
    },
    sassOptions = {
        outputStyle: 'compressed'
    },
    prefixerOptions = {
        browsers: ['last 2 versions']
    };

gulp.task('browser-sync', function (done) {
    browserSync.init({
        server: {
            baseDir: bases.app
        },
    });

    done();
});

gulp.task('sass', function () {
    return gulp.src(bases.app + 'scss/main.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions))
        .pipe(size({
            gzip: true,
            showFiles: true
        }))
        .pipe(prefix(prefixerOptions))
        .pipe(rename('events-v2.css'))
        .pipe(browserSync.stream())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('../sources'))
        .pipe(gulp.dest(bases.app + 'css'))
        .pipe(browserSync.stream());
});

gulp.task('html', function () {
    return gulp.src(bases.app + '**/*.html')
        .pipe(browserSync.stream());
});

gulp.task('watch', function () {
    gulp.watch(bases.app + 'scss/**/*.scss', gulp.series('sass'));
    gulp.watch(bases.app + 'js/*.js', gulp.series('html'));
    gulp.watch(bases.app + '**/*.html', gulp.series('html'));
});

gulp.task('default', gulp.series('browser-sync', 'html', 'sass', 'watch'));
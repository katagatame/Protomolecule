const gulp = require('gulp');
const ts = require('gulp-typescript');
const del = require('del');

const project = ts.createProject('tsconfig.json');

gulp.task('default', () =>
{
    del.sync(['./bin/**/*.*']);

    gulp.src('./src/**/*.ts')
        .pipe(project())
        .pipe(gulp.dest('bin/'));

    gulp.src('./src/config.json')
        .pipe(gulp.dest('bin/'));
    
    gulp.src('./src/client_secret.json')
        .pipe(gulp.dest('bin/'));

    gulp.src('./src/img/*.*')
        .pipe(gulp.dest('bin/img/'));
});

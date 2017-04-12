const gulp = require('gulp');
const gulp_ts = require('gulp-typescript');
const gulp_tslint = require('gulp-tslint');
const tslint = require('tslint');
const del = require('del');

const project = gulp_ts.createProject('tsconfig.json');
const linter = tslint.Linter.createProgram('tsconfig.json');

gulp.task('tslint', () => {
    gulp.src(['./src/**/*.ts'])
      .pipe(gulp_tslint({
			configuration: 'tslint.json',
			formatter: 'prose',
			program: linter
		}))
		.pipe(gulp_tslint.report());
});

gulp.task('default', () =>
{
    del.sync(['./bin/**/*.*']);

    gulp.src('./src/**/*.ts')
        .pipe(project())
        .pipe(gulp.dest('bin/'));

    gulp.src('./src/config.json')
        .pipe(gulp.dest('bin/'));

    gulp.src('./src/img/*.*')
        .pipe(gulp.dest('bin/img/'));
});

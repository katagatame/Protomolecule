const del = require('del');
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const jsdoc = require('gulp-jsdoc3');
const sourcemaps = require('gulp-sourcemaps');
const typescript = require('gulp-typescript');

/** Create gulp task `delete` */
gulp.task('delete', done => {
	del.sync(['./bin/']);
	done();
});

/** Create gulp task `lint` */
gulp.task('lint', () => {
	return gulp
		.src(['./src/**/*.ts', './src/**/*.ts'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

/** Create gulp task 'build:client' */
gulp.task('build:client', () => {
	const clientProject = typescript.createProject('./tsconfig.json');

	const client = gulp
		.src(['./src/**/*.ts'])
		.pipe(sourcemaps.init({ base: './src' }))
		.pipe(clientProject());

	gulp
		.src('./src/client/user/config/*.json')
		.pipe(gulp.dest('./bin/client/user/config/'));

	gulp.src('./src/data/*.json').pipe(gulp.dest('./bin/data/'));

	return client.js
		.pipe(sourcemaps.write('.', { sourceRoot: './src' }))
		.pipe(gulp.dest('./bin/'));
});

/** Create gulp task 'build:docs' */
gulp.task('build:docs', () => {
	del.sync(['./docs/**/*.*'], { force: true });

	const jsDocConfig = require('./.jsdoc.json');

	return gulp.src(['README.md', './bin/**/*.js']).pipe(jsdoc(jsDocConfig));
});

/** Create gulp task `default`. */
gulp.task('default', gulp.series('lint', 'delete', 'build:client'));

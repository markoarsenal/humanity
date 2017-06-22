var gulp = require('gulp'),
	browserSync = require('browser-sync').create(),
	$ = require('gulp-load-plugins')();

var scripts = [
	'./bower_components/jquery/dist/jquery.js',
	'./bower_components/tether/dist/js/tether.js',
	'./bower_components/bootstrap/dist/js/bootstrap.js',
	'./bower_components/moment/moment.js',
	'./bower_components/handlebars/handlebars.js',
	'./bower_components/jquery-validation/dist/jquery.validate.js',
	'./bower_components/bootstrap-material-datetimepicker/js/bootstrap-material-datetimepicker.js',
	'./bower_components/select2/dist/js/select2.full.js',
	'./scripts/vendors/validation-methods.js',
	'./scripts/vendors/jpicker/jpicker-1.1.6.js',
	'./scripts/utilities/utilities.js',
	'./scripts/helpers/config.js',
	'./scripts/helpers/helpers.js',
	'./scripts/modules/firebase.js',
	'./scripts/partials/table.js',
	'./scripts/partials/employee.js',
	'./scripts/partials/shift.js',
	'./scripts/partials/position-list.js',
	'./scripts/partials/position.js',
	'./scripts/main.js'
];

gulp.task('sass', function () {
	return gulp.src('./css/style.scss')
		.pipe($.plumber())
		.pipe($.sourcemaps.init({ loadMaps: true }))
		.pipe($.sass({
			outputStyle: 'expanded'
		}).on('error', function (error) {
			this.emit('end');
			$.notify({
				title: "SASS ERROR",
				message: "line " + error.line + " in " + error.file.replace(/^.*[\\\/]/, '') + "\n" + error.message
			}).write(error);
		}))
		.pipe($.sourcemaps.write('./'))
		.pipe(gulp.dest('./css/'))
		.pipe(browserSync.stream());
});

gulp.task('script', function () {
	return gulp.src(scripts)
		.pipe($.plumber())
		.pipe($.sourcemaps.init({ loadMaps: true }))
		.pipe($.concat('bundle.min.js'))
		.pipe($.sourcemaps.write('./'))
		.pipe(gulp.dest('./scripts/'));
});

gulp.task('browsersync', function () {
	browserSync.init({
		server: "./"
	});
});

gulp.task('watch', function () {
	gulp.watch('./css/**/*.scss', ['sass']);
	gulp.watch(['./scripts/**/*.js', '!./scripts/bundle.min.js'], ['script']);
});

gulp.task('default', ['sass', 'script', 'browsersync', 'watch']);
// Load plugins
var gulp = require('gulp'),
		gutil = require('gulp-util'),
		uglify = require('gulp-uglify'),
		notify = require('gulp-notify'),
		livereload = require('gulp-livereload'),
		concat = require('gulp-concat');

// Scripts
gulp.task('scripts', function(){
	// tells you where to find JS files going to compress
	// and turns them into stream
	return gulp.src('public/javascript/*.js')
			// pipe chains output stream from src
			// and passes it into uglify etc
			.pipe(uglify())
			.pipe(concat('main.js'))
			// Points to output folder files are written to
			.pipe(gulp.dest('public/javascript'))
			.pipe(notify({ message: 'Scripts task complete' }));
});

// CSS

// Default task with message log
gulp.task('default', function(){
	return gutil.log('Gulp is running');
					gutil.beep();
					gulp.start('scripts');
});

// Watch
gulp.task('watch', function(){
	
	// Watch javascript files
	gulp.watch('public/javascript/*.js', ['scripts']);

	// Create LiveReload server
	livereload.listen();

	// Watch any files in /public, reload on change
	gulp.watch(['public/**']).on('change', livereload.changed);
});


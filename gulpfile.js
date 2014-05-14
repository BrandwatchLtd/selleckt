var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('default', function() {
  gulp.src('lib/*.js')
    .pipe(uglify({
    	outSourceMap: true
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'))
});
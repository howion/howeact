"use strict";

// CONFIGS
const DIST_DIR = './dist'
const DIST_DIR_TEMP = DIST_DIR + '/#'
const DIST_DIR_TEMP_JS = DIST_DIR_TEMP + '/js'

const SRC_DIR = './src'
const SRC_DIR_JS = SRC_DIR + '/js'
const SRC_DIR_SASS = SRC_DIR + '/sass'

// PATTERNS
const SRC_DIR_JS_FILES = SRC_DIR_JS + '/**/*.+(js|jsx)'

// PACKAGES
const { task, src, dest, series, watch } = require('gulp'),
        browserify = require('browserify'),
        del        = require('del'),
        babel      = require('gulp-babel'),
        vsource    = require('vinyl-source-stream'),
        vbuffer    = require('vinyl-buffer'),
        uglify     = require('gulp-uglify'),
        htmlmin    = require('gulp-htmlmin'),
        sass       = require('gulp-sass'),
        rename     = require('gulp-rename')

// SET SASS COMPILER
sass.compiler = require('node-sass')

let ENV = 'p' // p: production // d: development
let $eTransform = null // catched errors on transform

// FRESH START
task('clean', function() {
    return del([ DIST_DIR ], { force: true })
})

// CLEAN TEMP DIRS
task('cleanTemps', function() {
    // DELETE TEMPORARY FOLDER
    return del([ DIST_DIR_TEMP ], { force: true })
})

// TRANSFORM JSX TO JS
task('transformJs', function() {
    // RESET PREVIOUS ERROR
    $eTransform = null

    // JSX TO JS
    return src(SRC_DIR_JS_FILES).pipe(babel())
                                .on('error', function (e) { $eTransform = e })
                                .pipe(dest(DIST_DIR_TEMP_JS))
})

// BUNDLE JS
task('bundleJs', function(cb) {
    // CHECK TRANSFORM ERRORS
    if ($eTransform !== null)
    {
        // WRITE ERROR
        console.log($eTransform.message)

        // CALL NEXT TASK
        cb()

        // DONT BUNDLE
        return
    }

    // BUNDLE USING BROWSERIFY
    let $b = browserify(DIST_DIR_TEMP_JS + '/main.js')
             .bundle()
             .pipe(vsource('bundle.js'))
             .pipe(vbuffer())

    // MINIFY OUTPUT ON NON-DEVELOPMENT MODE
    if ( ENV !== 'd' )
    {
        $b = $b.pipe(uglify())
    }

    // BUNDLE.JS
    return $b.pipe(dest(DIST_DIR))
})

task('html', function() {
    let $p = src(SRC_DIR + '/index.html')
    if (ENV !== 'd') // MINIFY HTML ON NON-DEV ENV
    {
        $p.pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true,
            minifyJS: true,
            collapseBooleanAttributes: true
        }))
    }
    return $p.pipe(dest(DIST_DIR))
})

task('sass', function() {
    // GET MAIN SASS FULE
    return src(SRC_DIR_SASS + '/main.scss').pipe(rename('bundle.css'))
           .pipe(sass({
               // CUSTOMIZE OUTPUT 
               outputStyle: (ENV !== 'd') ? 'compressed' : 'expanded'
           }).on('error', sass.logError))
           // RENAME MAIN.SCSS TO BUNDLE.CSS
           .pipe(rename('bundle.css'))
           .pipe(dest(DIST_DIR))
})

// PRODUCTION BUILD ( SLOWER DUE TO MINIFY )
task('build', series([ 'transformJs', 'bundleJs', 'html', 'sass', 'cleanTemps' ]))

// DEVELOPMENT BUILD
task('build:dev', series([ function(cb) {
    ENV = 'd' // SET ENV TO DEVELOPMENT
    cb()
}, 'transformJs', 'bundleJs', 'html', 'sass' ]))

// WATCH CHANGES AND RECOMPILE IN DEVELOPMENT MODE
task('watch', series('build:dev', function() {
    return watch(SRC_DIR + '/**/*', series([ 'build:dev' ]))
}))

// SET DEFAULT TASK TO BUILD
task('default', series([ 'watch' ]))

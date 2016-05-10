'use strict';

const gulp = require('gulp');

module.exports = {
    clean,
    build,
    test,
    watch,
    default: gulp.series(clean, build, test, watch)
};

function clean () {
    const del = require('del');
    return del(['dist/**', '!dist/']);
}

let tsproject;
function build () {
    return new Promise( (success, fail) => {
        const ts = require('gulp-typescript');
        const merge = require('merge2');
        const sourcemaps = require('gulp-sourcemaps');
        const rename = require('gulp-rename');

        if (!tsproject) {
            tsproject = ts.createProject('tsconfig.json', {
                typescript: require('typescript')
            });
        }

        let tsstream = (
            gulp.src(['src/**/*.ts'])
            .pipe(sourcemaps.init())
            .pipe(ts(tsproject))
        );

        let hadError = false;
        tsstream.on('error', () => { hadError = true });

        merge(
            tsstream.dts,
            tsstream.pipe(sourcemaps.write('.', { includeContent: true }))
        )
        .pipe(gulp.dest('dist'))
        .on('end', () => hadError ? setExitCodeAnd(fail) : success());
    });
}

function test () {
    return new Promise((success, fail) => {
        const mocha = require('gulp-spawn-mocha');
        const watching = /\bwatch/i.test(process.argv.join(' '));
        let hadError = false;

        gulp.src(['dist/**/*.spec.js'], { read: false })
        .pipe(mocha({
            reporter: watching ? 'min' : 'spec'
        }))
        .on('error', () => { hadError = true; })
        .on('end', () => hadError ? setExitCodeAnd(fail) : success());
    });
}

function watch (runForever) {
    gulp.watch(['src/**/*.ts', 'typings/main/**.ts'],
        gulp.series(clean, build, test)
    );
}

function setExitCodeAnd(callback) {
    if (!setExitCodeAnd.alreadyset) {
        process.once('exit', () => { process.reallyExit(1); });
        setExitCodeAnd.alreadyset = true;
    }
    callback();
}

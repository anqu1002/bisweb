const fs = require('fs');
const path = require('path');
const child_process = require('child_process');


const makeDir = function (f1) {
    console.log('++++ creating directory', f1);
    try {
        fs.mkdirSync(f1);
    } catch (e) {
        if (e.code === 'EEXIST') {
            console.log('---- directory ' + f1 + ' exists. Remove and try again.');
            process.exit(0);
        }
        console.log('---- error=', JSON.stringify(e));
        process.exit(0);
    }
};

const copyFileSync = function (d1, fname, d2, fname2) {

    let f1 = path.join(d1, fname);
    let f2 = path.join(d2, fname2);

    console.log('++++ copying file  ' + f1 + '\n\t\t--> ' + f2);
    try {
        fs.copyFileSync(f1, f2);
    } catch (e) {
        console.log('---- error', e);
        process.exit(0);
    }
};

let executeCommand = function (command, dir, force = false) {

    let done = false;

    if (force)
        console.log('++++ The next step will take a while ...');

    console.log('++++ [' + dir + "] " + command);

    return new Promise((resolve, reject) => {

        try {
            let proc = child_process.exec(command, { cwd: dir });
            if (force) {
                proc.stdout.pipe(process.stdout);
                proc.stderr.pipe(process.stderr);

                let sleep = function (ms) { return new Promise(resolve => setTimeout(resolve, ms)); };

                let fn = (async () => {
                    while (done) {
                        console.log('fn');
                        proc.stdout.write();
                        process.stdout.write();
                        await sleep(1000);
                    }
                });
                fn();
            } else {
                proc.stdout.on('data', function (data) {
                    let d = data.trim();
                    let show = true;
                    if (d.length < 1)
                        show = false;
                    if (d.indexOf('inflating') >= 0)
                        show = false;

                    if (show)
                        console.log('____ ' + d.split('\n').join('\n____ '));
                });
                proc.stderr.on('data', function (data) {
                    console.log('---- Error: ' + data);
                });
            }

            proc.on('exit', function (code) {
                done = true;
                if (code === 0)
                    resolve();
                else
                    reject();
            });

        } catch (e) {
            console.log(' error ' + e);
            reject(e);
        }
    });
};

const copyFileSync2 = function (d1, fname, t1, t2) {

    let f1 = path.join(d1, fname);
    let f2 = path.join(t1, path.join(t2, fname));

    console.log('++++ copying file  ' + f1 + '\n\t\t--> ' + f2);
    try {
        fs.copyFileSync(f1, f2);
    } catch (e) {
        console.log('---- error', e);
        process.exit(0);
    }
};

let initialize = function (DIR) {

    const WASMDIR = path.normalize(path.join(DIR, path.join('..', path.join('various', 'wasm'))));

    makeDir(DIR);
    makeDir(path.join(DIR, 'web'));
    makeDir(path.join(DIR, 'wasm'));
    makeDir(path.join(DIR, 'dist'));
    console.log('++++');

    copyFileSync2(WASMDIR, `libbiswasm_wasm.js`, DIR, `web`);
    copyFileSync2(WASMDIR, `libbiswasm_nongpl_wasm.js`, DIR, `web`);
    copyFileSync2(WASMDIR, `libbiswasm.js`, DIR, `wasm`);
    copyFileSync2(WASMDIR, `libbiswasm_nongpl.js`, DIR, `wasm`);
    copyFileSync2(WASMDIR, `libbiswasm.wasm`, DIR, `wasm`);
    copyFileSync2(WASMDIR, `libbiswasm_nongpl.wasm`, DIR, `wasm`);
    copyFileSync2(WASMDIR, `libbiswasm_wrapper.js`, DIR, `wasm`);
};

module.exports = {
    makeDir: makeDir,
    copyFileSync: copyFileSync,
    executeCommand: executeCommand,
    initialize: initialize,
};

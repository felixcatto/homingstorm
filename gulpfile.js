import { spawn } from 'child_process';
import { deleteAsync } from 'del';
import gulp from 'gulp';
import swc from 'gulp-swc';
import waitOn from 'wait-on';
import webpack from 'webpack';
import { loadEnv } from './lib/devUtils.js';
import webpackConfig from './webpack.config.js';

loadEnv();

const { series } = gulp;

const paths = {
  dest: 'dist',
  serverJs: ['services/webSocketServer/*.ts', 'lib/*'],
  misc: ['.env*', 'knexfile.js'],
};

let server;
let isWaitonListening = false;
const startServer = async () => {
  server = spawn('node', ['dist/services/webSocketServer/bin.js'], { stdio: 'inherit' });

  if (!isWaitonListening) {
    isWaitonListening = true;
    await waitOn({
      resources: [`http-get://localhost:${process.env.WSS_PORT}`],
      delay: 500,
      interval: 1000,
      validateStatus: status => status !== 503,
    });
    isWaitonListening = false;
  }
};

const restartServer = async () => {
  server.kill();
  await startServer();
};
process.on('exit', () => server && server.kill());

const clean = async () => deleteAsync(['dist']);

const copyMisc = () => gulp.src(paths.misc).pipe(gulp.dest(paths.dest));

const transpileServerJs = () =>
  gulp
    .src(paths.serverJs, { base: '.', since: gulp.lastRun(transpileServerJs) })
    .pipe(swc({ jsc: { target: 'es2022' } }))
    .pipe(gulp.dest(paths.dest));

const trackChangesInDist = () => {
  const watcher = gulp.watch('dist/**/*');
  watcher
    .on('add', pathname => console.log(`File ${pathname} was added`))
    .on('change', pathname => console.log(`File ${pathname} was changed`))
    .on('unlink', pathname => console.log(`File ${pathname} was removed`));
};

const watch = async () => {
  gulp.watch(paths.serverJs, series(transpileServerJs, restartServer));
  trackChangesInDist();
};

const startWsServer = series(clean, transpileServerJs, copyMisc, startServer, watch);

const buildWsServer = series(clean, transpileServerJs, copyMisc);

export { startWsServer, buildWsServer };

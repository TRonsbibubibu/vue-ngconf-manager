/**
 * Created by zhangsihao on 17-3-24.
 */
const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const kcors = require('kcors');
const koaBody = require('koa-body');
const serve = require('koa-static');

const path = require('path');
const _ = require('lodash');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const Etcd = require('etcd-cli');

const config = {
  etcd: 'http://127.0.0.1:2379',
  namespace: 'ngconf'
};
app.context.config = config;
app.context.etcd = new Etcd.V2HTTPClient(app.context.config.etcd);

const router = require('./routes');

app.use(serve(path.join(__dirname, '..', 'app')));
app.use(kcors());
app.use(koaBody());

function registerRoutes(router, dirPath) {
  return fs.readdirAsync(dirPath).then((files) => {
    const promises = [];
    files.forEach((file) => {
      promises.push(fs.statAsync(path.join(dirPath, file)).then((stat) => {
        if (stat.isDirectory()) {
          return fs.accessAsync(path.join(dirPath, file, 'index.js'), fs.F_OK).then(() => {
            const route = './' + path.join(path.relative(__dirname, dirPath), file);
            return nextRouter = require(route);
          }).catch((err) => new Router())
            .then(
              (nextRouter) => registerRoutes(nextRouter, path.join(dirPath, file))
                .then(
                  () => {
                    router.use('/' + file, nextRouter.routes(), nextRouter.allowedMethods());
                  }));
        }
      }));
    });
    return Promise.all(promises);
  });
}

registerRoutes(router, './routes').then(() => {
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.listen(3000);
});


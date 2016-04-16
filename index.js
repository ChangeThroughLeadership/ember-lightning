'use strict';

const redis = require('redis'),
    co = require('co'),
    coRedis = require('co-redis'),
    Koa = require('koa'),
    cfenv = require("cfenv");

const appEnv = cfenv.getAppEnv();

const app = new Koa(),
    client  = redis.createClient(
      appEnv.services.rediscloud[0].credentials.port,
      appEnv.services.rediscloud[0].credentials.hostname
    ),
    dbCo = coRedis(client);

if (appEnv.services.rediscloud[0].credentials.password) {
  client.auth(appEnv.services.rediscloud[0].credentials.password);
}

client.on('error', function (err) {
  console.log('Redis client error: ' + err);
});

app.use(co.wrap(function* (ctx) {

  var indexkey;

  if (ctx.request.query.index_key) {
    indexkey = appEnv.name +':'+ ctx.request.query.index_key;
  } else {
    indexkey = appEnv.name +':current-content';
  }
  var index = yield dbCo.get(indexkey);

  if (index) {
    ctx.body = index;
  } else {
    ctx.status = 404;
  }
}));

var server = app.listen(appEnv.port || 3000);

process.on('SIGINT', function () {
  server.close(function () {
    process.exit(0);
  });
});

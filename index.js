'use strict';

var redis = require('redis'),
    coRedis = require('co-redis'),
    koa = require('koa'),
    cfenv = require("cfenv");

var appEnv = cfenv.getAppEnv();

var app = koa(),
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

app.use(function* () {

  var indexkey;

  if (this.request.query.index_key) {
    indexkey = appEnv.name +':'+ this.request.query.index_key;
  } else {
    indexkey = yield dbCo.get(appEnv.name +':current');
  }
  var index = yield dbCo.get(indexkey);

  if (index) {
    this.body = index;
  } else {
    this.status = 404;
  }
});

app.listen(appEnv.port || 3000);

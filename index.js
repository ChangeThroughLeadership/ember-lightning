'use strict';

var redis = require('redis'),
    coRedis = require('co-redis'),
    koa = require('koa'),
    cfenv = require("cfenv");

var appEnv = cfenv.getAppEnv();
var rediscloud = appEnv.getService('rediscloud');

var app = koa(),
    client  = redis.createClient(
      rediscloud.credentials.port,
      rediscloud.credentials.hostname
    ),
    dbCo = coRedis(client);

if (rediscloud.credentials.password) {
  client.auth(rediscloud.credentials.password);
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

'use strict';

var redis = require('redis'),
    coRedis = require('co-redis'),
    koa = require('koa');

var app = koa(),
    client  = redis.createClient(
      process.env.REDIS_PORT,
      process.env.REDIS_HOST
    ),
    dbCo = coRedis(client);

client.auth(process.env.REDIS_SECRET);


app.use(function* () {

  var current = yield dbCo.get(process.env.APP_NAME +':current');
  var index = yield dbCo.get(current);

  this.body = index || '';
});

app.listen(process.env.PORT || 3000);

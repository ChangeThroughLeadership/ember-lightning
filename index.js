'use strict';

var redis = require('redis'),
    coRedis = require('co-redis'),
    koa = require('koa');

var app = koa(),
    client  = redis.createClient(
      process.env.VCAP_SERVICES.rediscloud.credentials.port,
      process.env.VCAP_SERVICES.rediscloud.credentials.hostname
    ),
    dbCo = coRedis(client);

if (process.env.VCAP_SERVICES.rediscloud.credentials.password) {
  client.auth(process.env.VCAP_SERVICES.rediscloud.credentials.password);
}

client.on('error', function (err) {
  console.log('Redis client error: ' + err);
});

app.use(function* () {

  var indexkey;

  if (this.request.query.index_key) {
    indexkey = process.env.VCAP_APPLICATION.application_name +':'+ this.request.query.index_key;
  } else {
    indexkey = yield dbCo.get(process.env.VCAP_APPLICATION.application_name +':current');
  }
  var index = yield dbCo.get(indexkey);

  if (index) {
    this.body = index;
  } else {
    this.status = 404;
  }
});

app.listen(process.env.VCAP_APP_PORT || 3000);

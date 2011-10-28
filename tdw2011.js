// catch uncaughtException
// process.on('uncaughtException', function(e){
//   console.log(e.message);
// });

/**
 * Module dependencies.
 */

var express = require('express')
, app = module.exports = express.createServer()
, basicAuth = express.basicAuth
, config = require('config')
, io = require('socket.io').listen(app)
, qs = require('querystring')
, https = require('https')
, base64 = require('base64')
, locale = require('./locale')
, path = require('path')
, os = require('os')
, log4js = require('log4js')
, log
, spawn = require('child_process').spawn
;

log4js.addAppender(log4js.fileAppender(path.join(config.log.dir, [config.log.name, os.hostname(), 'access.log'].join('.'))), 'access');
log = log4js.getLogger('access');

// Configuration
app.configure(function(){
  app.set('port', 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(log4js.connectLogger(log, {
    format: JSON.stringify({ip: ':req[X-Forwarded-For]', method: ':method', url: ':url', status: ':status', ref: ':referrer', ua: ':user-agent'}),
    level: log4js.levels.INFO,
    nolog: config.log.nolog}));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  if(config.basicAuth){
    app.all('*', basicAuth(function(user, pass){
      return config.basicAuth.user === user && config.basicAuth.pass === pass;
    }));
  }
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.all('/screen', basicAuth(function(user, pass){
    return config.basicAuth.user === user && config.basicAuth.pass === pass;
  }));
  app.use(express.errorHandler()); 
});

// Routes
app.get('/', function(req, res){
  res.redirect('/index.htm', 301);
});
app.get('/api/food', function(req, res){
  var query = req.query.q || '#おいしいもの';
  searchTweet(query, function(err, ret){
    if(res){
      return res.send(ret.results);
    }else{
      return res.send({});
    }
  });
});

app.get('/git', function(req, res){
  var pull = spawn('git', ['pull', 'origin', 'develop']);
  pull.stdout.setEncoding('utf8');
  pull.stdin.end();
  
  var forever = spawn('forever', ['restart', 'tdw2011.js']);
  forever.stdout.setEncoding('utf8');
  forever.stdin.end();
  res.send({msg: "request from"});
});

app.listen(app.settings.port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

/************************************************************/

io.of('/tdw2011').on('connection', function(socket){
  socket.emit('init', {msg: 'connect ok'});
});

var streamOptions = {
  host: 'stream.twitter.com'
  , port: 443
  , path: '/1/statuses/filter.json?'+qs.stringify({track: config.photos.map(function(w){return [config.streamquery, w].join(' ');}).join(' OR ')})
  , headers: {
    'Authorization': 'Basic '+base64.encode('nifty_engineer:9v3qjvra')
  }
};

var req = https.get(streamOptions, function(res){
  res.setEncoding('utf8');
  var buf = '', id, json;
  res.on('data', function(chunk){
    buf += chunk;
    while((id = buf.indexOf('\r\n')) > -1){
      json = buf.substr(0, id);
      buf = buf.substr(id + 2);
      if(json.length > 0){
        try{
          var tweet = JSON.parse(json);
          io.sockets.emit('tweet', tweet);
        } catch (x) {
          
        }
      }
    }
  });
});

var twitterAPI = '/search.json'
, http = require('http')
, searchOptions = {
  host: 'search.twitter.com'
  , port: 80
};

var searchTweet = function(query, cb){
  if(typeof query === 'function'){
    cb = query;
    query = null;
  }
  if(typeof cb === 'undefined'){
    return false;
  }
  searchOptions.path = [twitterAPI, qs.stringify({q: config.photos.map(function(w){
    return [query, w].join(' ');
  }).join(' OR '), "include_entities": true})].join('?');
  console.log(searchOptions.path);
  http.get(searchOptions, function(res){
    if(res.statusCode !== 200){
      cb(new Error('status code = '+res.statusCode), null);
    }
    res.setEncoding('utf8');
    var data = '';
    res.on('data', function(chunk){
      data += chunk;
    });
    res.on('end', function(){
      try{
        var obj = JSON.parse(data);
        cb(null, obj);
      } catch (x) {
        cb(x, null);
      }
    });
  }).on('error', function(e){
    cb(e, null);
  });
};


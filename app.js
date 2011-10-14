// catch uncaughtException
process.on('uncaughtException', function(e){
  console.log(e.message);
});

/**
 * Module dependencies.
 */

var express = require('express')
, app = module.exports = express.createServer()
, basicAuth = express.basicAuth
, config = require('config')
, io = require('socket.io')
, qs = require('querystring')
, https = require('https')
, base64 = require('base64')
;

// Configuration
app.configure(function(){
  app.set('port', 3111);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
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
  res.render('index', {
    title: 'Express'
  });
});

app.get('/api/food', function(req, res){
  getTweet('#tvasahi', function(err, ret){
    res.send(ret.results);
  });
});

app.get('/screen', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

app.listen(app.settings.port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);


var req = https.get({
  host: 'stream.twitter.com'
  , port: 443
  , path: '/1/statuses/sample.json'
  , headers: {
    'Authorization': 'Basic '+base64.encode('nifty_engineer:9v3qjvra')
  }
}, function(res){
  res.setEncoding('utf8');
  var buf = '', id, json;
  res.on('data', function(chunk){
    buf += chunk;
    while((id = buf.indexOf('\r\n')) > -1){
      json = buf.substr(0, id);
      buf = buf.substr(id + 2);
      if(json.length > 0){
        try{
          io.sockets.emit('tweet', JSON.parse(json));
        } catch (x) {
          
        }
      }
    }
  });
});


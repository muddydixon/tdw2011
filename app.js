
/**
 * Module dependencies.
 */

var express = require('express')
, app = module.exports = express.createServer()
, basicAuth = express.basicAuth
, config = require('config')
, io = require('socket.io')
, qs = require('querystring')
, Twitter = require('./lib/twitter')
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


var twit = new Twitter(config.twitter)
twit.streaming('sample', function(stream){
  stream.on('data', function(data){
    console.log(data.text);
  });
});
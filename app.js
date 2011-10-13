
/**
 * Module dependencies.
 */

var express = require('express')
, app = module.exports = express.createServer()
, basicAuth = express.basicAuth
, config = require('config')
, qs = require('querystring');

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
  app.all('*', basicAuth(function(user, pass){
    return config.basicAuth.user === user && config.basicAuth.pass === pass;
  }));
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

var twitterAPI = '/search.json'
, http = require('http')
, options = {
  host: 'search.twitter.com'
  , port: 80
};

var getTweet = function(query, cb){
  if(typeof query === 'function'){
    cb = query;
    query = null;
  }
  if(typeof cb === 'undefined'){
    return false;
  }
  options.path = [twitterAPI, qs.stringify({q: query})].join('?');
  http.get(options, function(res){
    
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


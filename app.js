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
    title: locale.title
    , appbase: config.appbase
  });
});

app.get('/api/food', function(req, res){
  if(req.query.q){
    if(config.dictionary.indexOf(req.query.q) > -1){
      searchTweet(req.query.q, function(err, ret){
        if(res){
          return res.send(ret.results);
        }else{
          return res.send({});
        }
      });
    }else{
      return res.send({});
    }
  }else{
    return res.send({});
  }
});

app.get('/screen', function(req, res){
  res.render('screen', {
    title: locale.title
    , appbase: config.appbase
  });
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
  , path: '/1/statuses/filter.json?'+qs.stringify({track: ['twitpic', 'plixi', 'twipple', 'yfrog'].map(function(w){return ['iphone', w].join(' ');}).join(',')})
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
//   searchOptions.path = [twitterAPI, qs.stringify({q: query})].join('?');
  searchOptions.path = [twitterAPI, qs.stringify({q: query+' twitpic'})].join('?');
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


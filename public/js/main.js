$(function(){
  var socket = io.connect('http://111.171.216.204/tdw2011');
  socket.on('tweet', function(tweet){
    $('#tweets').prepend($('<div>').addClass('tweet').text(tweet.text));
  });
});
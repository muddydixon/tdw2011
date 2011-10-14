$(function(){
  var socket = io.connect();
  socket.on('tweet', function(tweet){
    $('#tweets').prepend($('<div>').addClass('tweet').text(tweet.text));
  });
});
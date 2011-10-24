$(function(){
  var socket = io.connect(null, {port: 8080});
  socket.on('tweet', function(tweet){
    $('#tweets').prepend($('<div>').addClass('tweet').text(tweet.text));
  });
});
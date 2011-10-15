$(function(){
  var socket = io.connect(null, {port: 3111});
  socket.on('tweet', function(tweet){
    $('#tweets').prepend($('<div>').addClass('tweet').text(tweet.text));
  });
});
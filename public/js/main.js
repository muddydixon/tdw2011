$(function(){
  var socket = io.connect(null, {port: 8080});
  socket.on('tweet', function(tweet){
    $(tweet.entities.urls).each(function(i, url){
      tweet.text = tweet.text.replace(url.url, '<a href="'+url.expanded_url+'">'+url.display_url+'</a>');
    });
    $('#tweets').prepend($('<div>').addClass('tweet').html(tweet.text));
  });
});
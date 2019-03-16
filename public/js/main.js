$(document).ready(function() {
  $("button[name='classic-ins']").on("click", function() {
    $("div.classic-ins").addClass('active');
  });
  $("a[href='#close']").on("click", function() {
    $("div.classic-ins").removeClass('active');
  });

  $("button[name='insta-ins']").on("click", function() {
    $("div.insta-ins").addClass('active');
  });
  $("a[href='#close']").on("click", function() {
    $("div.insta-ins").removeClass('active');
  });

  $("button[name='tweet-ins']").on("click", function() {
    $("div.tweet-ins").addClass('active');
  });
  $("a[href='#close']").on("click", function() {
    $("div.tweet-ins").removeClass('active');
  });

  $("button[name='gif-ins']").on("click", function() {
    $("div.gif-ins").addClass('active');
  });
  $("a[href='#close']").on("click", function() {
    $("div.gif-ins").removeClass('active');
  });

  $("button[name='deepfry-ins']").on("click", function() {
    $("div.deepfry-ins").addClass('active');
  });
  $("a[href='#close']").on("click", function() {
    $("div.deepfry-ins").removeClass('active');
  });

  $("button[name='content-ins']").on("click", function() {
    $("div.content-ins").addClass('active');
  });
  $("a[href='#close']").on("click", function() {
    $("div.content-ins").removeClass('active');
  });
});

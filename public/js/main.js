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
});

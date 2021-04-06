$(document).ready(function(){
  if(getAccessToken()) {
    $('nav').load("includes/nav_online.html");
  }
  else {
    $('nav').load("includes/nav_offline.html");
  }

  $('footer').load("includes/footer.html");
});

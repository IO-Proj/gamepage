$(document).ready(function(){
  if(getAccessToken()) {
    $('nav').load("http://localhost:8000/includes/nav_online.html");
  }
  else {
    $('nav').load("http://localhost:8000/includes/nav_offline.html");
  }

  $('footer').load("http://localhost:8000/includes/footer.html");
});

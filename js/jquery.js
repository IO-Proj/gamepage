$(document).ready(function(){
  var $frontAddress = "https://io-proj.github.io/gamepage";
  // var $frontAddress = "http://localhost:8000";

  if(getAccessToken()) {
    $('nav').load(`${$frontAddress}/includes/nav_online.html`);
  }
  else {
    $('nav').load(`${$frontAddress}/includes/nav_offline.html`);
  }

  $('footer').load(`${$frontAddress}/includes/footer.html`);
});

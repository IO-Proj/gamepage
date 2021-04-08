$(document).ready(function(){
  if(getAccessToken()) {
    $('nav').load(`${appAddress}/includes/nav_online.html`);
  }
  else {
    $('nav').load(`${appAdrress}/includes/nav_offline.html`);
  }

  $('footer').load(`${appAddress}/includes/footer.html`);
});

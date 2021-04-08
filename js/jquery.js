$(document).ready(function(){
  $getAbsolutePath = function(){
    var $loadedElem = $(this).prop("tagName");

    $($loadedElem + ' a').each(function(){
      $(this).attr('href', `${webAddress}/` + $(this).attr("href"));
    });

    $($loadedElem + ' img').each(function(){
      $(this).attr('src', `${webAddress}/` + $(this).attr("src"));
    });
  };

  if(getAccessToken()) {
    $('nav').load(`${webAddress}/includes/nav_online.html`, $getAbsolutePath);
  }
  else {
    $('nav').load(`${webAddress}/includes/nav_offline.html`, $getAbsolutePath);
  }

  $('footer').load(`${webAddress}/includes/footer.html`);
});


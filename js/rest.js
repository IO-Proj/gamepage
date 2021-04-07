var appAddress = "https://io-projekt-gamepage-api.herokuapp.com";

function getRequestObject() {
  if (window.ActiveXObject)
    return(new ActiveXObject("Microsoft.XMLHTTP"));

  else if (window.XMLHttpRequest)
    return (new XMLHttpRequest());

  else
    return(null);
}

function signupme() {
  let form = document.getElementsByTagName("form")[0];
  let user = {
    'username': form.username.value,
    'password': form.pass.value
  };

  let request = getRequestObject();
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
      if(request.status == 200) {
        loginme(user);
      }

      else {
        alert(`Error ${request.status}: ${request.response}`);
      }
    }
  }
  request.open("POST", `${appAddress}/api/add/user`, true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(user));


  /* TEST - DO USUNIĘCIA */
  let request2 = getRequestObject();
  request2.onreadystatechange = function() {
    if (request2.readyState == 4) {
      if(request2.status == 200) {
        alert(request2.response)
      }

    }
  }
  request2.open("GET", `${appAddress}/test`, true);
  request2.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request2.send();
  /***********************/
}

function saveMemoScore(seconds, comparisons) {
  let score = {
    'seconds': seconds,
    'comparisons': comparisons
  };

  let request = getRequestObject();

  request.onreadystatechange = function () {
    if (request.readyState == 4 ) {

      if(request.status == 200) {
        console.log('OK');
      }

      else if(request.status == 401) {
        onSessionLost();
      }

      else {
        alert(`Error ${request.status}: ${request.response}`)
      }
    }
  }

  request.open("POST", `${appAddress}/api/add/score/memo`, true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.setRequestHeader('Authorization', 'JWT ' + getAccessToken())
  request.send(JSON.stringify(score));
}

function getUserInfo() {
  let request = getRequestObject();

  request.onreadystatechange = function() {
    if (request.readyState == 4) {
      if(request.status == 200) {
        console.log(request.response);
      }

      else if (request.status = 401) {
        onSessionLost();
      }

      else {
        alert(`Error ${request.status}: ${request.response}`);
      }
    }
  }
  request.open("GET", `${appAddress}/api/user/info`, true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.setRequestHeader('Authorization', 'JWT ' + getAccessToken())
  request.send(null);
}

// function sendGetRequest(url, successCallback) {
//   let request = getRequestObject();

//   request.onreadystatechange = function() {
//     if (request.readyState == 4) {
//       if(request.status == 200) {
//         successCallback(JSON.parse(request.response));
//       }

//       else if (request.status = 401) {
//         onSessionLost();
//       }

//       else {
//         alert(`Error ${request.status}: ${request.response}`);
//       }
//     }
//   }
//   request.open("GET", url, true);
//   request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//   request.setRequestHeader('Authorization', 'JWT ' + getAccessToken())
//   request.send(null);
// }

// function addOnline(record) {
//   let records = {
//     'records': [record]
//   }

//   let request = getRequestObject();

//   request.onreadystatechange = function () {
//     if (request.readyState == 4 ) {

//       if(request.status == 200) {
//         window.location.reload();
//       }

//       else if(request.status == 401) {
//         onSessionLost();
//       }

//       else {
//         alert(`Błąd ${request.status}: ${request.response}`)
//       }
//     }
//   }

//   request.open("POST", `${appAddress}/api/add/weather`, true);
//   request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//   request.setRequestHeader('Authorization', 'JWT ' + getAccessToken())
//   request.send(JSON.stringify(records));
// }

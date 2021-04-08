var appAddress = "https://io-projekt-gamepage-api.herokuapp.com";
// var appAddress = "http://localhost:5000";

//class representing ajax requests
class Request {
  constructor(type, url, data, onSuccess, headers=null) {
    this.type = type;
    this.url = url;
    this.data = data;
    this.onSuccess = onSuccess;
    this.headers = headers;
  }

  send() {
    let request = Request.getReqObject();
    request.onreadystatechange = () => { this.responseHandler(request) };
    request.open(this.type, this.url, true);

    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    for (const key in this.headers)
      request.setRequestHeader(key, this.headers[key]);

    request.send(this.data);
  }

  responseHandler(request) {
    if (request.readyState == 4) {
      if (request.status == 200)
        this.onSuccess(request);

      else
        Request.onError(request);
    }
  }

  static getReqObject() {
    if (window.ActiveXObject)
      return (new ActiveXObject("Microsoft.XMLHTTP"));

    else if (window.XMLHttpRequest)
      return (new XMLHttpRequest());

    else
      return(null);
  }

  static onError(request) {
    alert(`Error ${request.status}: ${request.response}`);
  }
}


class RequestWithAuth extends Request {

  constructor(type, url, data, onSuccess, headers={'Authorization': 'Bearer ' + getAccessToken()}) {
    super(type, url, data, onSuccess, headers);
  }

  responseHandler(request) {

    if (request.readyState == 4) {
      if (request.status == 200)
        this.onSuccess(request);

      else if (request.status == 401) {
        let nextRequest = Request.getReqObject();

        nextRequest.onreadystatechange = () => { this.refreshResponseHandler(nextRequest); };
        nextRequest.open("POST", `${appAddress}/refresh`, true);
        nextRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        nextRequest.setRequestHeader('Authorization', 'Bearer ' + getRefreshToken())
        nextRequest.send(null);
      }

      else
        Request.onError(request);
    }
  }

  refreshResponseHandler(request) {

      if (request.readyState == 4) {
        if (request.status == 200) {
          console.log('refresh');

          let response = JSON.parse(request.response);
          setAccessToken(response.access_token);

          let nextRequest = Request.getReqObject();

          nextRequest.onreadystatechange = () => { this.authorizedResponseHandler(nextRequest); };
          nextRequest.open(this.type, this.url, true);
          nextRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
          nextRequest.setRequestHeader('Authorization', 'Bearer ' + getAccessToken())
          nextRequest.send(this.data);
        }

        else if (request.status == 401)
          onSessionLost();

        else
          Request.onError(request);
      }
  }

  authorizedResponseHandler(request) {

    if (request.readyState == 4) {
      if(request.status == 200)
        this.onSuccess(request);

      else if (request.status == 401)
        onSessionLost();

      else
        Request.onError(request);
    }
  }
}

//ajax functions

function signupme() {
  let form = document.getElementsByTagName("form")[0];
  let user = {
    'username': form.username.value,
    'password': form.pass.value
  };

  new Request("POST", `${appAddress}/api/add/user`, JSON.stringify(user), (req) => { loginme(user) }).send();

  /* TEST - DO USUNIĘCIA */
  let request2 = Request.getReqObject();
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

  let req = new RequestWithAuth("POST", `${appAddress}/api/add/score/memo`, JSON.stringify(score),
    (req) => { console.log(req.response); });
  req.send();
}

function getUserInfo() {
  new RequestWithAuth("GET", `${appAddress}/api/user/info`, null, (req) => { console.log(req.response); }).send();
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

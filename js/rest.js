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
    // console.log(this.data);
    // console.log(request);
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

  send() {
    if(getAccessToken())
      super.send();
    else {
      alert("You're not logged in");
      window.location.href = `${webAddress}/index.html`;
    }
  }

  responseHandler(request) {

    if (request.readyState == 4) {
      if (request.status == 200)
        this.onSuccess(request);

      else if (request.status == 401) {
        let nextRequest = Request.getReqObject();

        nextRequest.onreadystatechange = () => { this.refreshResponseHandler(nextRequest); };
        nextRequest.open("POST", `${apiAddress}/refresh`, true);
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
          // console.log('refresh');

          let response = JSON.parse(request.response);
          setAccessToken(response.access_token);

          let nextRequest = Request.getReqObject();

          nextRequest.onreadystatechange = () => { this.authorizedResponseHandler(nextRequest); };
          nextRequest.open(this.type, this.url, true);
          nextRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
          nextRequest.setRequestHeader('Authorization', 'Bearer ' + getAccessToken())
          nextRequest.send(JSON.stringify(this.data));
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

  new Request("POST", `${apiAddress}/register`, JSON.stringify(user), (req) => { loginme(user) }).send();
}

function saveScore(score, game) {
  let userScore = {
    'score': score,
    'id_game': game
  };

  let req = new RequestWithAuth("POST", `${apiAddress}/add/score`, JSON.stringify(userScore),
    (req) => { console.log(req.response); });
  req.send();
}

function getHighScores(game) {
  let req = new RequestWithAuth("GET", `${apiAddress}/highscores/${game}`, null,
    (req) => {
      let resp = JSON.parse(req.response);
      let str = ""
      for(let i = 0; i < resp.length; i++) {
        let record = resp[i];
        str += `<tr>
                  <th scope="row">${i+1}</th>
                  <td>${record.username}</td>
                  <td>${record.score}</td>
                  </tr>`;
      }
      document.getElementById('highscores').innerHTML = str;
    });
  req.send();
}

function getUserInfo() {
  function JSONtoTable(json) {
    let str = "";

    for(const key in json) {
      let val = json[key];
      if(typeof val == 'object'){
        str += `<tr><td colspan="2">${key}</td></tr>`;
        str += JSONtoTable(val);
      }
      else {
        str += `<tr>
                <td>${key}</td>
                <td>${json[key]}</td>
                </tr>`;
      }
    }
    return str;
  }

  new RequestWithAuth("GET", `${apiAddress}/userinfo`, null,
    (req) => {
      let resp = JSON.parse(req.response);
      delete resp['password'];
      console.log(resp);
      
      document.getElementById('welcome_header').innerHTML = `Hello ${resp['username']}!`;
      document.getElementById('userinfo').innerHTML = JSONtoTable(resp);
    }).send();
}

function changePassword(form) {
  if(form.newPass.value == form.repeatNewPass.value) {
    let newData = {'old_password': form.oldPass.value, 'new_password': form.newPass.value};
    let req = new RequestWithAuth("PUT", `${apiAddress}/change/password`, JSON.stringify(newData),
      (req) => {
        alert("Password successfully changed");
        window.location.href = `${webAddress}/profile.html`;
      });
    req.send();
  }
  else {
    alert("Password mismatch")
  }
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

//   request.open("POST", `${apiAddress}/api/add/weather`, true);
//   request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//   request.setRequestHeader('Authorization', 'JWT ' + getAccessToken())
//   request.send(JSON.stringify(records));
// }

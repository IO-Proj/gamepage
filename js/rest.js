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
    (req) => {
      console.log(req.response);
      
      let response = JSON.parse(req.response);
      if('badge' in response)
      alert(`New badge!\n${response.badge}`);

      if('level_up' in response)
      alert(`Level up!\n(to lvl ${response.level_up})`);

    });
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
        if(key != "badges")
        {
          if(key == "stats")
          {
            str += `<tr><td colspan="2">Statistics</td></tr>`;
          }
          else if(key == "game_counter")
          {
            str += `<tr><td colspan="2">Won games</td></tr>`;
          }
          else if(key == "game_score_counter")
          {
            str += `<tr><td colspan="2">Games scores (summed up):</td></tr>`;
          }
          else if(key == "highscore")
          {
            str += `<tr><td colspan="2">Games highscores:</td></tr>`;
          }
          else
          {
            str += `<tr><td colspan="2">${key}</td></tr>`;
            
          }str += JSONtoTable(val);
        }
      }
      else {
        if(key == "0" || key == "1" || key == "username")
        {
          continue;
        }
        else
        {
          if(key == "login_counter")
          {
            str += `<tr>
                <td>login count</td>
                <td>${json[key]}</td>
                </tr>`;
          }
          else{
            str += `<tr>
                    <td>${key}</td>
                    <td>${json[key]}</td>
                    </tr>`;
          }
        }
      }
    }
    return str;
  }

  new RequestWithAuth("GET", `${apiAddress}/userinfo`, null,
    (req) => {
      let resp = JSON.parse(req.response);
      delete resp['password'];
      
      document.getElementById('welcome_header').innerHTML = `Hello ${resp['username']}!`;
      document.getElementById('userinfo').innerHTML += JSONtoTable(resp);
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

function displayBadges() {
  let badges = [
    "first login",
    "5th login", 
    "10th login",
    "MEMO 1 win",
    "MEMO 5 wins", 
    "MEMO 20 wins",
    "MEMO X points",
    "MEMO X points",
    "MEMO X points",
    "Sudoku 1 win",
    "Sudoku 5 wins",
    "Sudoku 20 wins",
    "Sudoku 15 minutes",
    "Sudoku 10 minutes",
    "Sudoku 5 minutes",
    "Snake 100 apples sum",
    "Snake 400 apples sum",
    "Snake 1000 apples sum",
    "Snake 10 apples",
    "Snake 30 apples",
    "Snake all apples"
  ];

  new RequestWithAuth("GET", `${apiAddress}/userinfo`, null,
    (req) => {
      let resp = JSON.parse(req.response);

      let notAchievedBadges = badges.filter(badge => !resp['badges'].includes(badge));
      for (let badge of notAchievedBadges) {
        let id = badge.replace(/\s/g, "-");
        let img = document.getElementById(id);
        if(img) img.style.opacity = "0.3"; // should be without if eventually
      }
    }).send();
}

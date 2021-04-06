function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function setAccessToken(accessToken) {
  localStorage.setItem('accessToken', accessToken);
}

function onSessionLost() {
  alert('Session lost');
  logoutme();
}

function loginFromForm() {
  let form = document.getElementsByTagName("form")[0];
  let credentials = {
    'username': form.username.value,
    'password': form.pass.value
  };
  loginme(credentials);
}

function loginme(credentials) {
  let request = getRequestObject();
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
      if(request.status == 200) {
        let response = JSON.parse(request.response);
        setAccessToken(response.access_token);
        window.location.href = "index.html";
      }
      else {
        alert("Invalid username or password");
      }
    }
  }
  request.open("POST", `${appAddress}/auth`, true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(credentials));
}

function logoutme() {
  localStorage.removeItem("accessToken");
  window.location.href = "index.html";
}
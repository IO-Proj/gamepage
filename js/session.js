//getter and setter for access token
function getAccessToken() {
  return localStorage.getItem("accessToken");
}

function setAccessToken(accessToken) {
  localStorage.setItem('accessToken', accessToken);
}

//getter and setter for refresh token
function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

function setRefreshToken(refreshToken) {
  localStorage.setItem('refreshToken', refreshToken);
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
  let req = new Request("POST", `${apiAddress}/login`, JSON.stringify(credentials), (request) => {
    let response = JSON.parse(request.response);

    setAccessToken(response.access_token);
    setRefreshToken(response.refresh_token);

    if('new_badge' in response)
      alert(`New badge:\n${response.new_badge}!`);

    if('level_up' in response)
      alert(`Level up!\n(to lvl ${response.level_up})`);

    window.location.href = `${webAddress}/index.html`;
  });
  req.send();
}

function logoutme() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = `${webAddress}/index.html`;
}
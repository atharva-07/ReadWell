const usernameInfo = document.getElementById('un-info-btn');
const passwordInfo = document.getElementById('pw-info-btn');
const passwordEye = document.getElementById('pw-eye-btn');
const passwordInput = document.getElementById('password');

let state = false;

function passwordToggle() {
  if (state) {
    passwordInput.setAttribute('type', 'password');
    passwordEye.style.color = '#353535';
    state = false;
  } else {
    passwordInput.setAttribute('type', 'text');
    passwordEye.style.color = '#5448fc';
    state = true;
  }
}

passwordEye.addEventListener('click', passwordToggle);

const usernameRules = document.getElementById('un-info');
const passwordRules = document.getElementById('pw-info');

if (usernameInfo && passwordInfo) {
  window.onclick = function (event) {
    if (event.target == usernameInfo) {
      usernameInfo.style.color = '#5448fc';
      passwordInfo.style.color = '#353535';
      usernameRules.style.display = 'block';
      passwordRules.style.display = 'none';
    } else if (event.target == passwordInfo) {
      passwordInfo.style.color = '#5448fc';
      usernameInfo.style.color = '#353535';
      passwordRules.style.display = 'block';
      usernameRules.style.display = 'none';
    } else {
      usernameInfo.style.color = '#353535';
      passwordInfo.style.color = '#353535';
      usernameRules.style.display = 'none';
      passwordRules.style.display = 'none';
    }
  };
}

const passwordInfo = document.getElementById('pw-info-btn');
const passwordEye = document.getElementById('pw-eye-btn1');
const confirmPasswordEye = document.getElementById('pw-eye-btn2');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');

let state = false;

function passwordToggle(element) {
  if (state) {
    element.setAttribute('type', 'password');
    this.style.color = '#353535';
    state = false;
  } else {
    element.setAttribute('type', 'text');
    this.style.color = '#5448fc';
    state = true;
  }
}

passwordEye.addEventListener(
  'click',
  passwordToggle.bind(passwordEye, passwordInput)
);
confirmPasswordEye.addEventListener(
  'click',
  passwordToggle.bind(confirmPasswordEye, confirmPasswordInput)
);

const passwordRules = document.getElementById('pw-info');

window.onclick = function (event) {
  if (event.target == passwordInfo) {
    passwordInfo.style.color = '#5448fc';
    passwordRules.style.display = 'block';
  } else {
    passwordInfo.style.color = '#353535';
    passwordRules.style.display = 'none';
  }
};

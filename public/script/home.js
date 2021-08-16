const navBar = document.querySelector('nav');

window.onscroll = function () {
  if (window.pageYOffset > 0) {
    navBar.classList.add('invert');
    navBar.style.padding = '0 0.5rem';
    navBar.style.fontSize = '0.65rem';
  } else {
    navBar.classList.remove('invert');
    navBar.style.fontSize = '0.7rem';
  }
};

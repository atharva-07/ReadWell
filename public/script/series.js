const navBar = document.querySelector('nav');
const hiddenElements = navBar.children[1];

window.onscroll = function () {
  if (window.pageYOffset > window.innerHeight - (40 * innerHeight) / 100) {
    navBar.classList.add('invert');
    hiddenElements.style.visibility = 'visible';
    navBar.style.padding = '0 0.5rem';
    navBar.style.fontSize = '0.65rem';
  } else {
    navBar.classList.remove('invert');
    hiddenElements.style.visibility = 'hidden';
    navBar.style.fontSize = '0.7rem';
  }
};

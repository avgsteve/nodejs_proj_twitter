/// <reference path="./../../../../node_modules/@types/jquery/index.d.ts" />

// Must include UserAuthHandler.js before this loginPage.js file

$('.fadeInContainer').hide();
$('.disclaimerContainer').hide();


$(function () {


  $('[data-toggle="tooltip"]').tooltip();

  let functionsToCall = [
    fadeIn1,
    fadeIn2,
    showRunningValue
  ];

  callFunctionWithInterval(functionsToCall, 1000);

});


// Submit registration data
let submitButton = $('#loginBtn');
submitButton.on('click', async (e) => {

  e.preventDefault();
  const loginHelper = new UserAuthHandler('login');

  // show loading animation in button and disable it
  const originalHtmlInBtn = loginHelper.showLoadingAnimationInButton(submitButton, 'processing');
  submitButton.prop('disabled', true);

  const loginResult = await loginHelper.login();

  if (loginResult === true) {
    return setTimeout(
      () => {
        location.assign('/');
      },
      1500);
  }

  console.log('loginResult: ', loginResult);

  loginHelper.showLoginError(loginResult);

  // restore html in button
  submitButton.html(originalHtmlInBtn);
  submitButton.prop('disabled', false);

});

// Call functions by interval
function callFunctionWithInterval(
  functionsToCall = [], intervalMillieSecond) {

  let dataLength = functionsToCall.length;
  let counter = 0;


  let timer = setInterval(() => {
    // console.log('current counter:', counter);
    functionsToCall[counter].call();
    counter++;

    if (counter >= dataLength)
      clearInterval(timer);

  }, intervalMillieSecond);
}

function fadeIn1() {
  setTimeout(() => {
    $('.fadeInContainer').fadeIn(1200);
  }, 500);
}
function fadeIn2() {
  setTimeout(() => {
    $('.disclaimerContainer').fadeIn(1000);
  }, 800);
}

function showRunningValue() {
  const objs = $('span.runningCounter');

  setTimeout(() => {
    objs.each(function () {
      animateValue(this, 0, $(this).data('number'), 900);
    });
  }, 1000);


}

function animateValue(obj, start, end, duration) {

  // animated value
  // https://codepen.io/avgsteve/pen/KKNYxVY?editors=0011
  // https://css-tricks.com/animating-number-counters/

  // Usage:
  // const obj = document.getElementById("value");
  // animateValue(obj, 0, 100, 800);

  let startTimestamp = null;
  // let counter = 1;

  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(progress * (end - start) + start);

    // console.log("progress: ", counter++);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
}

// const obj = document.getElementById("value");
// animateValue(obj, 0, 100, 800);

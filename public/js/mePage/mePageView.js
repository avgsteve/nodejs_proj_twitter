/// <reference path="./../../../node_modules/@types/jquery/index.d.ts" />

import GlobalView from '../GlobalControl/GlobalView';

export default class MePageView {

  static showFunctionTab(tabName = 'detail') {

    let allItems = $('.function_item');
    let itemToShow = $(`.functionsItem_${tabName}`);
    // console.log('selected tab: ', targetTabToShow);

    if (!itemToShow[0])
      throw `Can't find the tab element with class name functionsContainer_${tabName}`;
    allItems.removeClass('active');
    itemToShow.addClass('active');
  }

  static showDeleteRequestResult(isSuccessful, errorMessage = "", timeToReloadPage = 3000) {

    if (isSuccessful === true) {
      GlobalView.showAlert({
        styleOption: 1,
        message:
          'Delete request sent! Reloading page now',
        timeToDisappear: timeToReloadPage - 1000,
        slideIn: true,
      });

      return setTimeout(() => {
        location.reload();
      }, timeToReloadPage);
    }

    if (isSuccessful === false) {
      GlobalView.showAlert({
        styleOption: 3,
        message: `Error: ${errorMessage}`,
        timeToDisappear: timeToReloadPage,
        slideIn: true,
      });
    }

  }

  static toggleConfirmDeleteAccBtn(active) {

    let buttons = $('#confirmDeleteAccBtn, #confirmCancelDeleteAccBtn');

    if (active === true) {
      buttons
        .attr('disabled', false)
        .attr('title', 'Click button to proceed')
        .addClass('active');
    } else {
      buttons
        .attr('disabled', true)
        .attr('title', 'Enter correct password to proceed')
        .removeClass('active');
    }
  }

  static renderCountDownTimer() {

    let timerElement = $('.accountDeleteCountDown .timer');
    let timeToDelete = Date.parse(userLoggedIn.toBeDeletedAt);

    const counterDownTimer = setInterval(() => {
      let currentTime = Date.now();
      let timeDiff = timeToDelete - currentTime;
      let convertedTime = convertEpochTimeToMinSec(timeDiff, false);

      if (parseInt(convertedTime.seconds) <= 0) {
        console.log(`time's up!`);
        clearInterval(counterDownTimer);
        location.reload();
      }

      timerElement.html(
        `
        ${convertedTime.minutes} minutes and 
        ${convertedTime.seconds} seconds
    `
      );

      // console.log('convertedTime: ', convertedTime);
    }, 1000);



  }


  static showMsg(message, style = 2) {

    return GlobalView.showAlert(
      {
        styleOption: style,
        message: message,
        elementToShowAlert: $('body'),
        timeToDisappear: 2000,
        slideIn: true,
      });

  }

}

function convertEpochTimeToMinSec(epochTime,
  addZeroToLastSingleDigit = false, //
  convertToMinusTime = false        // will return minus time if true, otherwise will return 0
) {
  let epochSeconds = epochTime / 1000;
  let minutes, seconds;
  let prefixZero = addZeroToLastSingleDigit === true ? "0" : ""; // ex: 1 -> 01
  minutes = parseInt(epochSeconds / 60, 10);
  seconds = parseInt(epochSeconds % 60, 10);

  minutes = minutes < 10 ? prefixZero + minutes : minutes;
  seconds = seconds < 10 ? prefixZero + seconds : seconds;

  if (epochTime < 0 && convertToMinusTime === true) {
    minutes = minutes.slice(1, minutes.length);
    seconds = seconds.slice(1, seconds.length);
  }

  if (epochTime < 0 && convertToMinusTime === false) {
    minutes = 0;
    seconds = 0;
  }


  // console.log('converted time: ', { minutes, seconds });
  return { minutes, seconds };
}


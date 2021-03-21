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
    if (active === true) {
      $('#confirmDeleteAccBtn')
        .attr('disabled', false)
        .attr('title', 'Click button to proceed')
        .addClass('active');
    } else {
      $('#confirmDeleteAccBtn')
        .attr('disabled', true)
        .attr('title', 'Enter correct password to proceed')
        .removeClass('active');
    }
  }



}

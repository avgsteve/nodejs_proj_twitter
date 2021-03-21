/// <reference path="./../../../node_modules/@types/jquery/index.d.ts" />

import GlobalView from '../GlobalControl/GlobalView';
import MePageView from './mePageView';
import MePageModel from './mePageModel';

const currentPagePath = window.location.pathname;

export default class MePageController {

  constructor() {
    if (!currentPagePath.match(/me/g))
      return console.warn(
        `must run NotificationController in notification page!`);
    this.eventListeners();
  }

  eventListeners() {
    this.event_clickFunctionTabBtn();
    this.event_clickDeleteAccBtn();
    this.event_disableConfirmDeleteBtn();
  }

  event_clickFunctionTabBtn() {
    $('.functionTabsContainer button').on('click', function (e) {

      $('.functionTabsContainer button').removeClass('active');

      let clickedBtn = $(e.target);
      let tabName = $(e.target).data('target');

      clickedBtn.addClass('active');

      // console.log('data: ', tabName);
      MePageView.showFunctionTab(tabName);
    });
  }

  event_disableConfirmDeleteBtn() {

    let accDeletePassword = $('input#passwordForDeleteAcc');
    if (accDeletePassword.length < 1) return;

    $(() => {
      accDeletePassword.on('keyup keydown', function () {
        console.log('run');
        let password = accDeletePassword.val();
        if (password.length < 5) {
          MePageView.toggleConfirmDeleteAccBtn(false);
        } else {
          MePageView.toggleConfirmDeleteAccBtn(true);
        }
      });
    });
  }

  event_clickDeleteAccBtn() {

    $('#confirmDeleteAccBtn').on('click', async function () {

      // 1) get input
      let passwordInput = $('input#passwordForDeleteAcc').val();

      // 2) update btn UI
      let originalBtn = GlobalView.showPreloadInButton($(this));

      // 3) Send request
      let result = await MePageModel.sendDeleteAccountRequest(userLoggedIn._id, passwordInput);

      // 4 reload page if successful
      if (result === true) {
        return MePageView.showDeleteRequestResult(true);
      }

      MePageView.showDeleteRequestResult(false, result.msg);
      $(this).html(originalBtn); // restore btn style and html

    });
  }

}




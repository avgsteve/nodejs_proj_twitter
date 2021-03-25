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
    this.event_renderDeleteCountDownTimer();
    this.event_clickOnCountDownTimer(); // jump to cancel delete btn
    this.event_updatePassword();
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

  event_updatePassword() {
    let updatePwdBtn = $('#updatePwdBtn');
    let btnHtml, data, result;
    updatePwdBtn.on('click', async function (e) {
      e.preventDefault();
      btnHtml = GlobalView.showPreloadInButton(updatePwdBtn);
      data = MePageModel.getDataForUpdatePassword();

      if (!data) {
        updatePwdBtn.html(btnHtml);
        return;
      }

      updatePwdBtn.attr('disabled', 'true');
      result = await MePageModel.sendUpdatePasswordReq(data);

      if (result === true) {
        MePageView.showMsg('Succeed! Reloading now', 1);
        return setTimeout(() => {
          location.reload();
        }, 1500);
      }

      MePageView.showMsg(result, 2);
      updatePwdBtn.html(btnHtml);
      updatePwdBtn.attr('disabled', false);

      return;

    });
  }

  event_disableConfirmDeleteBtn() {

    let pwdInput = $('.functionsContainer .passwordInput');
    if (pwdInput.length < 1) throw Error(`Can't find .passwordInput element`);

    $(() => {
      pwdInput.on('keyup keydown', function (e) {

        let password = $(e.target).val();
        if (password.length < 5) {
          MePageView.toggleConfirmDeleteAccBtn(false);
        } else {
          MePageView.toggleConfirmDeleteAccBtn(true);
        }
      });
    });
  }

  event_clickDeleteAccBtn() {

    $('#confirmDeleteAccBtn, #confirmCancelDeleteAccBtn').on('click',
      async function (e) {

        let isForCancelDelete = e.target.className.includes('cancelBtn');

        let btn = $(e.target);

      // 1) get input
        let passwordInput = btn.closest('.modal-content').find('input').val();

      // 2) update btn UI
        let originalBtn = GlobalView.showPreloadInButton(btn);

      // 3) Send request
        let result = await MePageModel.sendDeleteAccountRequest(
          userLoggedIn._id, passwordInput, isForCancelDelete);

        console.log('result:', result);

      // 4 reload page if successful
      if (result === true) {
        return MePageView.showDeleteRequestResult(true);
      }

      MePageView.showDeleteRequestResult(false, result.msg);
      $(this).html(originalBtn); // restore btn style and html

    });
  }

  event_renderDeleteCountDownTimer() {
    $(async () => {

      let countDownDiv = $('.accountDeleteCountDown');
      if (countDownDiv.length === 0) return;
      MePageView.renderCountDownTimer();

    });

  }

  // jump to cancel delete btn
  event_clickOnCountDownTimer() {
    $('.accountDeleteCountDown').on('click', () => {
      $('.functionTabsContainer .btn').removeClass('active');
      $('.function_item').removeClass('active');
      $('.function_item.functionsItem_deleteMyAccount').addClass('active');
    });
  }


}




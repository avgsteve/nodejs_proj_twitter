/// <reference path="./../../../node_modules/@types/jquery/index.d.ts" />

import GlobalView from '../GlobalControl/GlobalView';
import MePageView from './mePageView';
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
    this.event_clickFunctionTabBtn();
  }

  event_clickFunctionTabBtn() {
    $('.functionTabsContainer button').on('click', function (e) {

      $('.functionTabsContainer button').removeClass('active');

      let clickedBtn = $(e.target);
      let tabName = $(e.target).data('target');

      clickedBtn.addClass('active');

      console.log('data: ', tabName);
      MePageView.showFunctionTab(tabName);
    });
  }

  event_clickDeleteAccBtn() {
  }



}
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
    this.clickFunctionTabEvent();
  }

  clickFunctionTabEvent() {
    $('.functionTabsContainer button').on('click', function (e) {
      let tabName = $(e.target).data('target');
      console.log('data: ', tabName);
      MePageView.showFunctionTab(tabName);
    });
  }



}
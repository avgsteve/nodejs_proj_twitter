/// <reference path="./../../../node_modules/@types/jquery/index.d.ts" />


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
}

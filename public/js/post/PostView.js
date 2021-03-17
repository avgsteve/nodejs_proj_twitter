import GlobalView from './../GlobalControl/GlobalView';

export default class PostView {

  constructor() {
    this._likedPostData = null;
    this._clickedLikeBtn = null;
    this._originalBtnHtml = null;
  }

  get likedPostData() {
    return this._likedPostData;
  }

  set likedPostData(likedPostData) {
    this._likedPostData = likedPostData;
    return this._likedPostData;
  }

  get clickedLikeBtn() {
    return this._clickedLikeBtn;
  }

  set clickedLikeBtn(likeBtn) {
    this._clickedLikeBtn = likeBtn;
    return this._clickedLikeBtn;
  }

  get originalBtnHtml() {
    return this._originalBtnHtml;
  }

  set originalBtnHtml(html) {
    this._originalBtnHtml = html;
    return this._originalBtnHtml;
  }

  showPreloaderInElement(
    preloaderContainer, preloaderText = 'default', preloaderStyle = 0) {

    if (!preloaderContainer) return;

    // preloaderText must be text otherwise make it default
    let textToRender =
      typeof preloaderText === 'string' ? preloaderText : 'default';

    // 
    let loaderStyleNumber =
      typeof preloaderStyle === 'number' ? preloaderStyle : 0;

    // 保存下來原本的HTML    
    let originalHTML = preloaderContainer.html();
    let loaderElement;

    // loading的時候要顯示的訊息
    if (
      preloaderText !== 'default' && preloaderText !== ""
    ) {
      textToRender = preloaderText;
    }
    else {
      textToRender = 'Refreshing page ...';
    }

    // 2) loading 圖案的樣式
    if (loaderStyleNumber === 0)
      loaderElement = `          
        <div class='spinner_loader' 
            style="
              width: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 2rem;
            "
        >

            <div class="spinner-border text-center" role="status">
                <span class="sr-only">Loading...</span>
            </div>          
            <p> ${textToRender} </p>  
        </div>
      `;
    
    if (loaderStyleNumber === 1)
      loaderElement = `          
        <div class="loader-container">
            <div class="loader7 loader">
            </div>
            <p> ${textToRender} </p>              
        </div>
      `;


    preloaderContainer.html(loaderElement);
    return originalHTML;

  }

  showFinishMessage(
    elementToShowMessage, message = "") {

    if (!elementToShowMessage) return;

    let messageElement = $(
      "<p class= 'text-center'> </>"
    )

    let messageText = message === "" ?
      'Success!' : message.toString().trim();

    elementToShowMessage.html(
      messageElement.text(messageText)
    );
  }

  disableSubmitBtnEvent() {

    return $("#postTextarea, #replyTextarea").keyup(event => {

      let textbox = $(event.target);
      let value = textbox.val().trim();

      let isModal = textbox.parents("#replyModal").length === 1;
      // 如果有class 為 .modal的 parent元素↑↑，就判斷↓↓為回覆文章用的 modal (id=submitReplyButton)
      let submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

      if (submitButton.length === 0) return alert("No submit button found");

      if (value === "") {
        // 文字區塊裡面沒有文字的時候就不能按下送出按鈕，才能按下 submitButton 送出資料
        submitButton.prop("disabled", true);
        return;
      }

      submitButton.prop("disabled", false);
    });
  }

  updateUiBeforeNewPostIsCreated(buttonClicked) {
    let originalBtnHtml =
      GlobalView.showPreloadInButton(buttonClicked);
    buttonClicked.prop("disabled", true);
    this.removeAnyNoResultMarkupAndShowPreloader();
    return originalBtnHtml;
  }

  removeAnyNoResultMarkupAndShowPreloader() {
    let noResultsMarkup = $('.noResults');
    if (noResultsMarkup.length !== 0) {
      noResultsMarkup.html("");
      // Show preloader as the container will be empty
      GlobalView.showPreloaderInElement(
        $('.postsContainer'), 'Refreshing Page', 1);
    }
  }

  updateUiAfterNewPostIsCreated(
    inputField, buttonClicked, originalBtnHtml) {
    inputField.val("");
    buttonClicked.html(originalBtnHtml);
    $('#replyModal').modal('hide');
    GlobalView.removePreloaderInElement();
  }

  restoreLikeBtnHtml() {
    this.clickedLikeBtn.html(this.originalBtnHtml);
  }

  updateLikeBtn() {
    this.clickedLikeBtn.find("span")
      .text(this.likedPostData.likes.length || "");
  }

  activateLikeBtn() {
    this.clickedLikeBtn.addClass("active");
    this.clickedLikeBtn.attr('title', 'Click to unlike this post');
  }

  deactivateLikeBtn() {
    this.clickedLikeBtn.removeClass("active");
    this.clickedLikeBtn.attr('title', 'Click to liked this post');
  }

  outputPostHTMLInContainer(postHTML = [], elementToRenderPost, messageWhenNoResults) {

    let container = elementToRenderPost || $(".postsContainer");
    let noResultsFoundMessage = messageWhenNoResults || 'No Post Found. Create New Post?'

    container.html("");
    if (Array.isArray(postHTML) && postHTML.length === 0)
      return container.append(`<p class='noResults'>${noResultsFoundMessage}</p>`);

    if (Array.isArray(postHTML) && postHTML.length !== 0)
      return postHTML.forEach(html => {
      container.append(html);
      });

    container.append(postHTML);
  };


}

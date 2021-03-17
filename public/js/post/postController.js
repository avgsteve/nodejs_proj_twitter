
import SocketIoController from './../clientSideSocket.io/SocketIoController';
import GlobalView from './../GlobalControl/GlobalView';
import PostHTMLCreator from './PostHTMLCreator';

// there's already a socket.io instance in index.js
// so get the created one in case of bug by creating multiple socket instance
const socket = SocketIoController.build_singleton_instance();

import PostModel from './PostModel';
const postModel = new PostModel();

import PostView from './PostView';
const postView = new PostView();

const currentPagePath = window.location.pathname;


export default class PostController {

  constructor() {
  }

  initPostEventListener() {
    const listenersToInit = this.getEventListeners();
    for (let listenerFunction of listenersToInit) {
      listenerFunction.call();
    }
  }

  getEventListeners() {
    return [
      this.event_clickOnPost,
      this.event_deletePost,
      this.event_pinPostEvent,
      this.event_unpinPost,
      this.event_disableSubmitBtnInTextArea,
      this.event_openReplyPostModal,
      this.event_submitPost,
      this.event_clickLikeButton,
      this.event_clickRetweetButton,
    ];
  }

  renderAllPostInPage() {
    $(async () => {

      // Check: No need to render all post in a post page with post id
      if (currentPagePath.match(/posts/g)
        && currentPagePath.split('/')[2] !== undefined)
        return console.warn('current page is not for the posts wall');

      const $postContainer = postModel.getContainerWithClass('postsContainer');

      // update UI
      GlobalView.showPreloaderInElement($postContainer, 'random', 1);

      // get posts data to be rendered in page
      let allPostsData = await postModel.getAllPostsWithOption(
        { postsFromFollowingOnly: true }
      );

      // Check: Data must be in current format to be rendered by rendering function
      if (!Array.isArray(allPostsData))
        throw Error(`Need html data (object) stored in array`);

      let postsHtmlArray = allPostsData.map(postData => {
        return PostHTMLCreator.convertPostToHtml(postData);
      });

      postView.outputPostHTMLInContainer(postsHtmlArray, $postContainer);
    });

  }

  renderPostIdPage() {
    $(async () => {

      // Check if container and post id exist
      const $postContainer = postModel.getContainerWithClass("postsContainer");
      const postIdFromURL = postModel.getPostIdFromUrl();
      let postDataById = await postModel.getPostById(postIdFromURL);

      if (!postDataById.postData) return $postContainer.html(
        `
        <p class='noResults'>
            (°ロ°) <br>
            The post with id: ${postIdFromURL} is not found or deleted
        </p>
        `
      );

      renderPostDataInPostIdPage(postDataById, $postContainer);
    }
    );
  };

  // 按下 .post 元素後 之後將使用者轉向 /post/postId 頁面
  event_clickOnPost() {

    $(document).on("click", ".post", (e) => {
      let clickedElement = $(e.target);
      let postId = postModel.getPostIdFromElement(clickedElement);

      if (postId !== undefined && !clickedElement.is("button")) {
        // postId 不可以為 undefined, 被按到的元素不可以是button
        window.location.href = '/posts/' + postId;
      }
    });
  }

  event_deletePost() {
    // 開啟刪除文章確認的 modal:  createPostHTML
    $("#deletePostModal").on("show.bs.modal", (event) => {

      // 取得 按下 .btn_openDeleteModal 的時候，所點擊的元素:  event.relatedTarget
      let btn_openDeleteModal = $(event.relatedTarget);
      let postId = postModel.getPostIdFromElement(btn_openDeleteModal);

      // 將 postId 寫入 確認刪除按鈕的 data attribute
      $("#confirmDeleteInPostModal").data("id", postId);
    });


    $("#confirmDeleteInPostModal").on('click', async (event) => {
      let postId = $(event.target).data("id");
      console.log('post id to delete:', postId);

      let modalBody = $('#deletePostModal .modal-body');

      postView.showPreloaderInElement(modalBody);

      let isSuccessful = await postModel.sendDeletePostRequest(postId);

      if (isSuccessful) {
        postView.showFinishMessage(
          modalBody, 'Success! Reloading page now...');
        return setTimeout(() => location.reload(), 500);
      }

      postView.showFinishMessage(modalBody, 'Fail to delete post. Please try again later');

    });
  }

  event_pinPostEvent() {

    // 1) 開啟確認文章置頂的 modal，
    $("#confirmPinModal").on("show.bs.modal", (event) => {
      let button = $(event.relatedTarget);
      let postId = postModel.getPostIdFromElement(button);
      // 1-2) 將文章 id 寫入 pinPostButton 的 data attribute
      $("#pinPostButton").data("id", postId);
    });

    // 2) 透過確認文章置頂的 modal -> 送出置頂 request
    $("#pinPostButton").on('click', async (event) => {

      // 1) Get data
      let postId = $(event.target).data("id");
      if (postId === undefined)
        return console.warn('no post id found in');
      let modalBody = $('#confirmPinModal .modal-body');

      // 2) Update UI
      let originalBtnHtml = GlobalView.showPreloadInButton($("#pinPostButton"));

      // 3) Send data
      let isSuccessful = await postModel.sendPinPostRequest(postId);

      // 4) Reload page
      if (isSuccessful) {
        postView.showFinishMessage(modalBody, 'Success! Reloading page now...');
        return setTimeout(() => location.reload(), 500);
      }

      // 5) Update UI if any error occurred
      postView.showFinishMessage(modalBody, 'Fail to pin post. Please try again');
      $("#pinPostButton").html(originalBtnHtml);
    });
  }

  event_unpinPost() {
    $("#confirmUnpinModal").on("show.bs.modal", (event) => {
      let button = $(event.relatedTarget);
      let postId = postModel.getPostIdFromElement(button);
      // 1-2) 將文章 id 寫入 pinPostButton 的 data attribute
      $("#unpinPostButton").data("id", postId);
    });

    $("#unpinPostButton").on('click', async (event) => {

      // 1) Get post id from button
      let postId = $(event.target).data("id");
      if (postId === undefined)
        return console.warn('no post id found in');

      // 2) Update UI
      let originalBtnHtml = GlobalView.showPreloadInButton($("#unpinPostButton"));

      let modalBody = $('#confirmUnpinModal .modal-body');

      postView.showPreloaderInElement(modalBody);

      let isSuccessful = await postModel.sendUnpinPostRequest(postId);

      if (isSuccessful) {
        postView.showFinishMessage(
          modalBody, 'Success! Reloading page now...'
        );
        return setTimeout(() => location.reload(), 500);
      }

      postView.showFinishMessage(modalBody, 'Fail to unpin post. Please try again');
      $("#unpinPostButton").html(originalBtnHtml);

    });
  }

  event_disableSubmitBtnInTextArea = () => {
    // 輸入區塊沒有文字的時候不能送出 submit form 的動作
    postView.disableSubmitBtnEvent();
  };

  // 點擊回覆文章按鈕之後會彈出 #replyModal
  event_openReplyPostModal = () => {

    // 點擊回覆按鈕之後，在modal上方的 #originalPostContainer 顯示要回覆的文章
    $("#replyModal").on("show.bs.modal", async (event) => {

      let button = $(event.relatedTarget);
      let postIdToReply = postModel.getPostIdFromElement(button);
      let originalPostContainer = $("#originalPostContainer");
      $("#submitReplyButton").data("id", postIdToReply);

      postView.showPreloaderInElement(
        originalPostContainer, 'loading original post...'
      );

      // postModel.sendPostReply(postIdToReply, originalPostContainer);

      let data = await postModel.getPostById(postIdToReply);
      if (data.postData) {
        let originalPostHtml = PostHTMLCreator.convertPostToHtml(data.postData);
        postView.outputPostHTMLInContainer(
          originalPostHtml, $("#originalPostContainer"));
      }
      $(".disable-click-on-original-post").click(false);

    });


    // 點擊關閉之後會清空#originalPostContainer
    // 不然文字會留在輸入區塊裡面
    $("#replyModal").on("hidden.bs.modal",
      () => $("#originalPostContainer").html("")
    );

  };

  // 透過 (上面的) #replyModal 或是 #submitReplyButton 送出 post
  event_submitPost = () => {

    $("#submitPostButton, #submitReplyButton").on('click', async (event) => {

      let buttonClicked = $(event.target);

      // 1) decide post action depending on which submit button clicked
      let newPostIsReply = buttonClicked.parents("#replyModal").length === 1;

      // 2) get content from input (depending on which submit button clicked)
      let inputField = postModel.locateInputField(newPostIsReply);
      let dataOfNewPost = {
        post_content: inputField.val()
      };

      // 3) Update UI: Show preloader and disable button
      let originalBtnHtml = postView.updateUiBeforeNewPostIsCreated(buttonClicked);

      // 4) If it is a "REPLY, process dataOfNewPost to be submit as REPLY ":
      if (newPostIsReply)
        dataOfNewPost.isReplyToPost =
          postModel.getPostIdFromReplyBtn(buttonClicked);

      // 5) send new post,
      let createdPost = await postModel.createNewPost(dataOfNewPost);

      // 6) Convert returned data to html and output & Update UI again
      if (createdPost !== null) {

        //
        let htmlForNewPost = PostHTMLCreator.convertPostToHtml(createdPost);
        $(".postsContainer").prepend(htmlForNewPost);

        if (newPostIsReply)
          socket.emitNoticeViaSocketToUser(
            createdPost.isReplyToPost.postedBy._id);

        // Clear Input and restore submit button
        postView.updateUiAfterNewPostIsCreated(
          inputField,
          buttonClicked,
          originalBtnHtml);

        return;
      }
    });
  };

  event_clickLikeButton() {

    $(document).on("click", ".likeButton ", async (event) => {

      // get retweet button and postId
      let likeBtn = $(event.target);
      let postId = postModel.getPostIdFromElement(likeBtn);
      if (postId === undefined) return console.error(`Can't find post id`);;

      let originalBtnHtml = GlobalView.showPreloadInButton(likeBtn);

      let updated_likedPost = await postModel.sendLikePostRequest(postId);

      postView.likedPostData = updated_likedPost;
      postView.clickedLikeBtn = likeBtn;
      postView.originalBtnHtml = originalBtnHtml;

      // restore btn html and update to latest tweets number
      postView.restoreLikeBtnHtml();

      if (updated_likedPost.likes.includes(userLoggedIn._id)) {
        postView.updateLikeBtn();
        postView.activateLikeBtn();
        socket.emitNoticeViaSocketToUser(updated_likedPost.postedBy);
      } else {
        postView.updateLikeBtn();
        postView.deactivateLikeBtn();
      }
    });

  }

  event_clickRetweetButton() {

    $(document).on("click", ".retweetButton", async (event) => {

      // get retweet button and postId
      let retweetBtn = $(event.target);
      let postId = postModel.getPostIdFromElement(retweetBtn);
      if (postId === undefined) return;

      let originalBtnHtml = GlobalView.showPreloadInButton(retweetBtn);

      let updated_retweetedPost = await postModel.createRetweetToPost(postId);

      // restore btn html and update to latest tweets number
      if (updated_retweetedPost) {
        retweetBtn.html(originalBtnHtml);
        retweetBtn.find("span").text(updated_retweetedPost.retweetUsers.length || "");
      }

      if (updated_retweetedPost.retweetUsers.includes(userLoggedIn._id)) {
        retweetBtn.addClass('active');
        retweetBtn.attr('title', 'You have retweeted this post! Click to cancel');

        socket.emitNoticeViaSocketToUser(updated_retweetedPost.postedBy);

        // emitNotification(postData.postedBy);
      } else {
        retweetBtn.removeClass("active");
        retweetBtn.attr('title', 'Click to retweet this post');

      }
    });

  }

}


function renderPostDataInPostIdPage(postDataById, container = $(".postsContainer")) {

  container.html("");

  // console.log('傳進renderPostDataInPostIdPage的 Results: ', postDataById);

  if (ifIsReplyPost(postDataById.postData)) {
    console.log('render results.isReplyToPost: ');
    let html = PostHTMLCreator.convertPostToHtml(postDataById.postData.isReplyToPost,);
    container.append(html);
  }

  let mainPostHtml = PostHTMLCreator.convertPostToHtml(
    postDataById.postData,
    true // "largeFont: true" will enlarge the font for main post selected
  );

  container.append(mainPostHtml);

  postDataById.replies.forEach(result => {
    let html = PostHTMLCreator.convertPostToHtml(result);
    container.append(html);
  });
}

function ifIsReplyPost(postData) {
  if (!postData) throw Error("postData is null or undefined.");
  if (postData.isReplyToPost !== undefined && postData.isReplyToPost._id !== undefined
  ) return true;
  return false;
}
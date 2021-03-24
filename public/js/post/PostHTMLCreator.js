export default class PostHTMLCreator {

  constructor() {

  }

  static buttonTypes = {
    pinnedPostTextOnTop: "pinnedPostTextOnTop",
    postHeaderButtons: "postHeaderButtons"
  };

  static convertPostToHtml = (postDataToConvert, largeFont = false) => {

    if (postDataToConvert === null || postDataToConvert === undefined)
      return console.error("post object is null or undefined:", postDataToConvert);

    if (Array.isArray(postDataToConvert))
      return console.error("can't process postDataToConvert obj as an array:", postDataToConvert);

    const {
      postCreator,
      is_a_reply_post,
      isA_RetweetPost,
      userNameOfRetweeter,
      postHasBeenLiked,
      postHasBeenRetweeted
    } = variablesFromPostData(
      postDataToConvert,
      userLoggedIn // global variable predefined in main-layout.pug
    );

    // Use "isA_RetweetPost" variable to tell if this post is a REPLY or a RETWEET
    postDataToConvert = isA_RetweetPost ? postDataToConvert.isRetweetToPost : postDataToConvert;

    // Optional class will be used in HTML    
    let tag_replyingToPost = "";

    // Check if the field ".isReplyToPost" is populated if it's a REPLY 
    // If so, let tag_replyingToPost have some markup tags. Otherwise have nothing in it
    if (is_a_reply_post) {
      checkIfOriginalPostIsPopulated(postDataToConvert);
      tag_replyingToPost = generateReplyMarkupForReply(postDataToConvert);
    }

    // Markup for one single post: 
    return `
          <div
              class='post ${largeFont ? "largeFont" : ""}' 
              data-id='${postDataToConvert._id}'>

              <!-- == Tag showing if this post a is RETWEET   == -->
              <div class='postActionContainer'>
                  ${this.getRetweetText(isA_RetweetPost, userNameOfRetweeter)}
              </div>

              <!-- == Main content == -->
              <div class='chatRoomMainContainer'>

                  <!-- ==  User Profile Picture  == -->
                  <div class='profileImageContainer'>
                      <img src='${postCreator.profilePic}'>
                  </div>

                  <!-- ==  Post container(flex column)  == -->
                  <div class='postContentContainer'>

                      <!-- ==  Pinned post tag (if it's pinned)  == -->
                      <div class='pinnedPostText optional-header'>
                          ${this.createPostHeaderButtons(this.buttonTypes.pinnedPostTextOnTop, postDataToConvert, userLoggedIn)}
                      </div>

                      <!-- ==  Metadata of post == -->
                      <div class='header postHeader'>                        
                          <a
                            href='/profile/${postCreator.userName}'
                            class='userName' 
                            title='Click to view author page: @${userFullName(postCreator)}' >
                              ${userFullName(postCreator)}
                          </a>
                          <span class='username'>   @${postCreator.userName}  </span>
                          <span class='date'>
                            ${this.timestampWithTimeDifference(new Date(), new Date(postDataToConvert.createdAt))
      }
                          </span>

                          <!-- ==  Post Buttons == -->
                          ${this.createPostHeaderButtons(this.buttonTypes.postHeaderButtons, postDataToConvert, userLoggedIn)}
                      </div>

                      ${tag_replyingToPost}

                      <!-- ==  Post Body == -->
                      <div class='postBody'>
                          <span>${postDataToConvert.content}</span>
                          ${this.getPostImage(postDataToConvert)}
                      </div>

                      <!-- ==  Post footer for Buttons == -->
                      <div class='postFooter'>

                          <!-- ==  Reply button (trigger #replyModal in  mixins.pug) == -->
                          <div class='postButtonContainer'>
                              <button data-toggle='modal' data-target='#replyModal'>
                                  <i class='far fa-comment'></i>
                              </button>
                          </div>

                          <!-- ==  Content will be shown only when it's a RETWEET == -->
                          <div class='postButtonContainer green'>
                              <button class='retweetButton ${postHasBeenRetweeted ? "active" : ""}'>
                                  <i class='fas fa-retweet'></i>
                                  <span>${postDataToConvert.retweetUsers.length || ""}</span>
                              </button>
                          </div>

                          <!-- ==  Like Button == -->
                          <div class='postButtonContainer red'>

                              <!-- ==
                                .likeButton's click event listener is in likeButtonEventListener.js
                              == -->
                              <button class='likeButton ${postHasBeenLiked ? "active" : ""}'>
                                  <i class='far fa-heart'></i>
                                  <span class='likesCount'>${postDataToConvert.likes.length || ""}</span>
                              </button>
                          </div>
                      </div>

                  </div>


              </div>

          </div>
`;
  };


  static timestampWithTimeDifference(currentTime, previous) {
    // ref: https://stackoverflow.com/questions/6108819/javascript-timestamp-to-relative-time
    // demo: http://jsfiddle.net/shooter/YXUwF/

    let msPerMinute = 60 * 1000;
    let msPerHour = msPerMinute * 60;
    let msPerDay = msPerHour * 24;
    let msPerMonth = msPerDay * 30;
    let msPerYear = msPerDay * 365;

    let elapsed = currentTime - previous;

    if (elapsed < msPerMinute) {
      if (elapsed / 1000 < 30) return "Just now";

      return Math.round(elapsed / 1000) + ' seconds ago';
    }

    else if (elapsed < msPerHour) {
      return Math.round(elapsed / msPerMinute) + ' minutes ago';
    }

    else if (elapsed < msPerDay) {
      return Math.round(elapsed / msPerHour) + ' hours ago';
    }

    else if (elapsed < msPerMonth) {
      return Math.round(elapsed / msPerDay) + ' days ago';
    }

    else if (elapsed < msPerYear) {
      return Math.round(elapsed / msPerMonth) + ' months ago';
    }

    else {
      return Math.round(elapsed / msPerYear) + ' years ago';
    }
  }

  static createPostHeaderButtons(buttonType, postDataToConvert, userLoggedIn) {

    if (!buttonType || !postDataToConvert || !userLoggedIn) {
      console.log(
        'error in createPostHeaderButtons function. Please check arguments'
      );
      return "";
    }

    if (postDataToConvert.postedBy._id !== userLoggedIn._id) return "";


    // Pinned Post Icon
    if (buttonType === this.buttonTypes.pinnedPostTextOnTop) {

      let pinnedPostIconTag = "";
      if (postDataToConvert.pinned === true) {
        pinnedPostIconTag = `
      <i class='fas fa-thumbtack'></i>
      <span> Pinned post </span>
    `;
      }
      return pinnedPostIconTag;
    }

    // Buttons in post header
    if (buttonType === this.buttonTypes.postHeaderButtons) {

      let postHeaderButton = '';
      let pinnedClass = '';
      let bootStrapModalTarget = "#confirmPinModal";

      if (postDataToConvert.pinned === true) {
        pinnedClass = "active";
        bootStrapModalTarget = "#confirmUnpinModal";
      }

      postHeaderButton = `
      <!-- == 將文章置頂的按鈕  == -->
      <button class='pinButton ${pinnedClass}' 
              data-id="${postDataToConvert._id}" data-toggle="modal"
              data-target="${bootStrapModalTarget}">
          <i class='fas fa-thumbtack'></i>
      </button>

      <!-- == 刪除文章的按鈕 event: postController -> deletePost()  == -->
      <button
              class='btn_openDeleteModal'
              data-id="${postDataToConvert._id}"
              data-toggle="modal"
              data-target="#deletePostModal">
          <i class='fas fa-times'></i>
      </button>
    `;

      return postHeaderButton;
    }

  }

  static getRetweetText(isA_RetweetPost, userNameOfRetweeter) {
    if (!isA_RetweetPost) return "";
    return `
      <span>
          <i class='fas fa-retweet'></i>
            Retweeted by
          <a href='/profile/${userNameOfRetweeter}'>
            @${userNameOfRetweeter}
          </a>
      </span>
    `;
  }

  static getPostImage(postData) {
    if (!postData.image || !postData.image.url) return "";
    return ` 
      <div class="postImageContainer">
        <img class='postImage' src=${postData.image.url} title=${postData.image.title} alt="img">
      </div>
    `;
  }

}

function variablesFromPostData(postDataToConvert, userLoggedIn) {
  if (postDataToConvert === null || postDataToConvert === undefined)
    throw Error("post object is null");

  if (postDataToConvert.postedBy._id === undefined) {
    throw Error("User object not populated");
  }

  let isA_RetweetPost = postDataToConvert.isRetweetToPost !== undefined;

  return {
    postCreator: postDataToConvert.postedBy,
    is_a_reply_post: is_a_reply_post(postDataToConvert),
    isA_RetweetPost: isA_RetweetPost,
    userNameOfRetweeter: isA_RetweetPost ? postDataToConvert.postedBy.userName : "",
    postHasBeenLiked: postDataToConvert.likes.includes(userLoggedIn._id) ? true : false,
    postHasBeenRetweeted: postDataToConvert.retweetUsers.includes(userLoggedIn._id) ? true : false,
  };
}

function is_a_reply_post(postDataToConvert) {
  if (postDataToConvert.isReplyToPost && postDataToConvert.isReplyToPost._id)
    return true;
  return false;
}

function checkIfOriginalPostIsPopulated(postDataToConvert) {
  // Need to check if these two fields :
  // ".isReplyToPost" & ".isReplyToPost." have been populated
  if (!postDataToConvert.isReplyToPost._id)
    throw Error("The original post for this Reply is not populated");
  if (!postDataToConvert.isReplyToPost.postedBy._id)
    throw Error("The creator of this original post for this Reply is not populated");

}

function generateReplyMarkupForReply(postDataToConvert) {
  let userNameFromReply = postDataToConvert.isReplyToPost.postedBy.userName;
  let tag_replyingToPost = `
        <div class='tag_replyingToPost'>
            Replying to
            <a href='/profile/${userNameFromReply}'>
              @${userNameFromReply}
            <a>
        </div>
      `;

  return tag_replyingToPost;
}

function userFullName(user) {
  if (!user.firstName || !user.lastName) console.warn(`user's firstName or lastName is missing`);
  return user.firstName + " " + user.lastName;
}
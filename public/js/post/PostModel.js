export default class PostModel {

  constructor() {
    
  }

  getPostById(postId) {

    if (!postId) throw Error('need post Id to fetch a post data')

    return new Promise((res, rej) => {
      $.ajax({
        url: `/api/posts/${postId}`,
        type: 'GET',
        success: (data, status, xhr) => {
          if (xhr.status !== 200) {
            console.log('can not get post by post id');
            rej(null)
          }
          console.log('透過id 索取到的postData:', data);
          res(data)
        }
      });
    }
    );


    console.log('queryResult:', queryResult);
  }

  getAllPostsWithOption(queryObj) {

    let queryOption = queryObj || {
      // limit post output to user's own posts and following user's
      postsFromFollowingOnly: true
    };

    return new Promise((res, rej) => {
      $.ajax({
        url: `/api/posts/`,
        type: "GET",
        data: queryOption,
        success: (allPosts) => {
          res(allPosts);
        }
      }).fail((data, textStatus, xhr) => {
        console.log('failed to get all posts!');
        console.log('data: ', data);
        console.log('textStatus: ', textStatus);
        console.log('xhr.status: ', xhr.status);
        rej(null);
      });

    }
    );
  }

  createRetweetToPost(postId) {
    return new Promise((res, rej) => {

      $.ajax({
        url: `/api/posts/${postId}/retweet`,
        type: "POST",
        success: (updatedOriginalPost) => {
          res(updatedOriginalPost);
        }
      }).fail((data, textStatus, xhr) => {
        console.log('failed to create retweet!');
        console.log('data: ', data);
        console.log('textStatus: ', textStatus);
        console.log('xhr.status: ', xhr.status);
        rej(null);
      });

    }
    );
  }

  createNewPost(dataOfNewPost) {
    return new Promise((res, rej) => {

      $.ajax({
        type: "POST",
        url: `/api/posts/`,
        data: dataOfNewPost,
        success: (createdPost) => {
          // console.log('createdPost', createdPost);
          res(createdPost);
        }
      }).fail((data, textStatus, xhr) => {
        console.log('failed to create post/reply!');
        console.log('data: ', data);
        console.log('textStatus: ', textStatus);
        console.log('xhr.status: ', xhr.status);
        rej(null);
      });

    }
    );
  }

  getContainerWithClass(containerClassName = 'postsContainer') {
    let $container = $('.' + containerClassName);
    // Check: Must have a container to render post
    if ($container.length === 0)
      return console.error(
        `The element with class name ".${containerClassName}" is not found in the page to render posts`
      );
    return $container;
  }

  getPostIdFromUrl() {
    const currentPagePath = window.location.pathname;
    let postIdFromUrl = currentPagePath.split('/')[2];
    if (!postIdFromUrl) throw Error(`Can't find post id in URL. Current Url path: ${currentPagePath}`);
    return postIdFromUrl;
  }

  getPostIdFromElement(element) {

    // 檢查是否是有 .post ，不是的話就往上層元素找
    let rootElement =
      element.hasClass("post") === true ?
        element : element.closest(".post");

    let postId = rootElement.data().id;

    if (postId === undefined) return alert("Post id undefined in element's data attribute");

    return postId;
  }

  getPostIdFromReplyBtn(buttonClicked) {
    if (!buttonClicked)
      return console.error("buttonClicked id is null");
    let postIdFromReplyButton = buttonClicked.data().id;
    if (!postIdFromReplyButton)
      return console.error("post id is not found in reply button");
    return postIdFromReplyButton;
  }

  locateInputField(newPostIsReply) {
    if (newPostIsReply) return $("#replyTextarea");
    return $("#postTextarea");
  }

  sendDeletePostRequest(postId) {

    if (!postId)
      return console.log('no postId received in sendDeletePostRequest function');

    return new Promise((res, rej) => {

      try {

        $.ajax({
          url: `/api/posts/${postId}`,
          type: "DELETE",
          success: (data, status, xhr) => {
            if (xhr.status != 204) {
              alert(`could not delete post, postID: ${postID} `);
              res(false);
            }
            res(true);
          }
        });

      } catch (error) {

        console.log('error occurred while sending delete post request: ', error);
        rej(false);
      }

    });

  }

  sendPinPostRequest(postId) {
    return new Promise((res, rej) => {
      $.ajax({
        url: `/api/posts/${postId}`,
        type: "PUT",
        data: { pinned: true },
        success: (data, status, xhr) => {

          if (xhr.status !== 200) {
            alert("could not delete post");
            rej(false);
          }

          res(true);

        }

      });
    });
  }

  sendUnpinPostRequest(postId) {

    return new Promise((res, rej) => {
      $.ajax({
        url: `/api/posts/${postId}`,
        type: "PUT",
        data: { pinned: false },
        success: (data, status, xhr) => {

          if (xhr.status != 200) {
            alert("could not pin post!");
            rej(false);
          }

          res(true);
        }
      });
    });
  }

  sendLikePostRequest(postId) {

    if (!postId)
      return console.log('no postId received in sendDeletePostRequest function');

    return new Promise((res, rej) => {

      try {

        $.ajax({
          url: `/api/posts/${postId}/like`,
          type: "PUT",
          success: (data, status, xhr) => {
            if (xhr.status != 200) {
              alert(`could not like post, postID: ${postID} `);
              res(false);
            }
            res(data);
          }
        });

      } catch (error) {

        console.log('error occurred while sending like post request: ', error);
        rej(false);
      }

    });

  }


}
import SocketIoController from './../clientSideSocket.io/SocketIoController';
const socket = SocketIoController.build_singleton_instance();


import ProfileView from './profilePageView'

import PostHTMLCreator from './../post/PostHTMLCreator'

export default class ProfilePageModel {

  static sendFollowUserRequest(userIdToFollow, followBtn) {

    ProfileView.showPreloaderInFollowButton(followBtn);

    return $.ajax({
      url: `/api/users/${userIdToFollow}/follow`,
      type: "PUT",

      success: (updateUserData, status, xhr) => {

        if (xhr.status === 404) return alert("user not found");

        let numberToUpdate = 1;
        let isFollowing = false;

        if (
          // 如果確認目前使用者的追蹤者清單 (.following array) 
          // 已經有了要追蹤的 user id
          updateUserData.following &&
          updateUserData.following.includes(userIdToFollow)
        ) {
          isFollowing = true;

          socket.emitNoticeViaSocketToUser(userIdToFollow);

          ProfileView.updateFollowBtn(followBtn, isFollowing);
        }

        ProfileView.updateFollowBtn(followBtn, isFollowing);
        numberToUpdate = -1;

        let label = $("#followersLabel ");

        // 檢查 followersLabel 存在，因為其他的頁面就不用去抓 #followersValue
        if (label.length != 0) {
          let currentFollowerNumber = parseInt(label.text());
          // 將 followersLabel 顯示數字 + 1
          followersLabel.text(currentFollowerNumber + numberToUpdate);
        }
      }
    });
  }

  static async getPinnedPost(profileId) {
    if (!profileId) return null;
    return $.get("/api/posts", {
      postedBy: profileId,
      pinned: true
    }, results => {
      // console.log('getPinnedPost:', results);
      return results; // the pinned post is stored an array
    });
  }

  static async getPostsNotPinnedOrReplies(profileId) {
    if (!profileId) return null;
    return await $.get("/api/posts", {
      postedBy: profileId,
      isReply: false,
      pinned: false
    }, results => {
        return results;
    });
  }

  static convertPostsToHtml(postsData) {
    if (!Array.isArray(postsData))
      return console.warn(`Need postData in array format to convert`, postsData);

    if (postsData.length === 0) return "";

    let concatenatedPostsHtml = "";
    postsData.forEach(post => {
      // console.log('post data: ', post);
      let postHtml = PostHTMLCreator.convertPostToHtml(post);
      concatenatedPostsHtml += postHtml;
    });
    return concatenatedPostsHtml;

  }


  static async getReplyPosts(profileId) {
    if (!profileId) return null;
    return await $.get("/api/posts",
      {
        postedBy: profileId, isReply: true
      }, results => {
        // outputPostsInContainer(results, $(".postsContainer"));
        return results;
      });
  }

  static async getFollowers(profileId) {
    if (!profileId) return null;
    return await $.get(`/api/users/${profileUserId}/followers`, results => {
      // outputUsersHTML(
      //   results.followers,
      //   $(".resultsContainer"));
      return results;
    }
    );
  }

  static async getFollowers(profileId) {
    if (!profileId) return null;
    return await $.get(`/api/users/${profileId}/followers`, results => {
      // outputUsersHTML(
      //   results.followers,
      //   $(".resultsContainer"));
      console.log('傳回的資料');
      console.log(results);
      return results;
    }
    );
  }

  static async getFollowing(profileId) {
    if (!profileId) return null;
    return await $.get(`/api/users/${profileId}/following`, results => {
      // outputUsersHTML(
      //   results.followers,
      //   $(".resultsContainer"));
      console.log('傳回的資料');
      console.log(results);
      return results;
    }
    );
  }

  // 取得要查看的使用者 id
  static getProfileIdFromPage() {
    let profileIdElement = $('.userProfileToView-id');
    if (profileIdElement.length < 1) {
      console.error(`can't get id from: .userProfileToView-id`);
      return null;
    }
    return profileIdElement.val();
  }

  // 取得 Profile Page 的 option
  static getProfilePageTabOption() {
    let optionElement = $('.optionOfProfilePageTab');
    if (optionElement.length < 1) {
      console.log('無法取得.optionOfProfilePageTab');
      return null;
    }
    return optionElement.val();
  }

  // 取得 follower or following Page 的 option
  static getFollowerPageTabOption() {
    let optionElement = $('.optionOfFollowerPageTab');
    if (optionElement.length < 1) {
      console.log('無法取得.optionOfFollowerPageTab');
      return null;
    }
    return optionElement.val();
  }


}
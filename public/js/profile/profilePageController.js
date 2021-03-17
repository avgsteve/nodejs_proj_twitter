import PostController from './../post//postController';
const postController = new PostController();
import PostHTMLCreator from './../post/PostHTMLCreator';

import ProfilePageModel from './ProfilePageModel';
import ProfileView from './profilePageView';
import GlobalView from './../GlobalControl/GlobalView';

// import PostModel from './PostModel';
// // const postModel = new PostModel();
// import PostView from './PostView';

export default class ProfilePageController {

    constructor() {
        this._initProfilePageEventListeners();
    }

    // 進入 URL /profile 的時候將 post 內容輸出到使用者 profile 頁面
    renderProfilePage() {

        const profileId = ProfilePageModel.getProfileIdFromPage();
        const optionOfPageTabs = ProfilePageModel.getProfilePageTabOption();

        if (optionOfPageTabs === "replies") {
            // console.log('loading replies tab');
            return this.renderProfilePageWithReplies(profileId);
        }
        // console.log('loading post tab');
        this.renderPostsInProfilePage(profileId);

    };

    async renderPostsInProfilePage(profileId) {

        if (!profileId)
            return console.error('need to pass in profileId for "renderPostsInProfilePage"');

        // 1) Show preloader while fetching data
        GlobalView.showPreloaderInElement($(".postsContainer"), 'Loading', 1);

        let $postContainer = $(".postsContainer");
        let $pinnedPostContainer = $(".pinnedPostContainer");
        let pinnedPost = await ProfilePageModel.getPinnedPost(profileId);
        let otherPosts = await ProfilePageModel.getPostsNotPinnedOrReplies(profileId);

        // 2) Convert and render pinned post
        let pinnedHtml = ProfilePageModel.convertPostsToHtml(pinnedPost);
        ProfileView.outputPinnedPost(pinnedHtml, $pinnedPostContainer);

        // 3) Convert and render OTHER posts 
        let otherPostAsHtml = ProfilePageModel.convertPostsToHtml(otherPosts);
        $postContainer.html(otherPostAsHtml);

        // 4) Show 'no results found'
        if (pinnedPost.length === 0 && otherPosts.length === 0)
            ProfileView.showNoPostResult();
    }

    async renderProfilePageWithReplies(profileId) {

        if (!profileId) return console.error('need to pass in profileId for "renderPostsInProfilePage"');

        // 顯示讀取畫面
        // 1) Show preloader while fetching data
        GlobalView.showPreloaderInElement($(".postsContainer"), 'Loading', 1);

        let $postContainer = $(".postsContainer");
        let replyPosts = await ProfilePageModel.getReplyPosts(profileId);
        let replyPostsHtml = ProfilePageModel.convertPostsToHtml(replyPosts);
        $postContainer.html(replyPostsHtml);

        // outputPostsInContainer(replyPosts, $(".postsContainer"));
        if (replyPosts.length === 0)
            ProfileView.showNoPostResult($postContainer, 'No reply from this user yet');
    }


    // #1 Function for URL:
    // /profile/userName/following 或是 /profile/userName/followers
    // to ender following users or followers.
    // #2 Function is called in index.js
    async renderFollowerPage() {

        console.log('renderFollowerPage is called');

        const profileUserId = ProfilePageModel.getProfileIdFromPage();
        const optionOfPageTabs = ProfilePageModel.getFollowerPageTabOption();
        const renderContainer = $(".resultsContainer");

        ProfileView.showPreloaderInContainer(renderContainer);

        if (optionOfPageTabs === "followers") {
            let userData = await ProfilePageModel.getFollowers(profileUserId);
            ProfileView.outputUsersHTML(userData.followers, renderContainer);
        } else {
            let userData = await ProfilePageModel.getFollowing(profileUserId);
            ProfileView.outputUsersHTML(userData.following, renderContainer);
        }

    }

    // ==== For Event Listeners ====
    _initProfilePageEventListeners() {
        const listenersToInit = this._getEventListenersToInit();
        for (let listenerFunction of listenersToInit) {
            listenerFunction.call();
        }
    }

    _getEventListenersToInit() {
        return [
            this._clickFollowBtnToFollowUser
        ];
    }

    _clickFollowBtnToFollowUser() {
        $(document).on("click", ".followButton", (e) => {
            let followBtn = $(e.target);
            let userId = followBtn.data().user;
            ProfilePageModel.sendFollowUserRequest(userId, followBtn);
        });
    }

}
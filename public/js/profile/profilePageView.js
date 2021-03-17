import PostHTMLCreator from './../post//PostHTMLCreator';
export default class ProfileView {

    constructor() {

    }

    static updateFollowBtn(followBtn, isForFollowing) {

        if (isForFollowing) {
            followBtn.addClass("following");
            followBtn.text("Following");
            followBtn.attr({
                'title': "Click to un-follow user"
            });

        } else {
            followBtn.removeClass("following");
            followBtn.text("Follow");
            followBtn.attr({
                'title': "Click to follow user"
            });
        }
    }

    static showPreloaderInFollowButton(buttonElement) {

        if (!buttonElement) return;


        let originalHTML = buttonElement.html();
        // if (!element)
        let preloader = `
                <span 
                    class="spinner-grow spinner-grow-sm" 
                    role="status" aria-hidden="true"
                ></span>
                <span class="sr-only">Loading...</span>
        `;

        buttonElement.html(preloader);
        setTimeout(() => {
            buttonElement.html(originalHTML);
        }, 2000);
        return originalHTML;

    }

    static clearPreloaderInFollowButton(buttonElement, customMessage = "") {
        if (!element) return;
        buttonElement.html(customMessage);
    }

    static showPreloaderInContainer(containerElement, textToRender = 'Loading') {

        if (!containerElement) return;

        let originalHTML = containerElement.html();
        // if (!element)
        let preloader = `
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

        containerElement.html(preloader);
        return originalHTML;

    }

    static showNoPostResult(containerElement = $(".postsContainer"), message = '') {

        let messageToShow = message === '' ? 'No post from current user' : message;

        containerElement.html(`
            <p class='noResults'>
               ${messageToShow}
            </p>
        `);
    }

    static outputUsersHTML = (results, container) => {
        container.html("");

        if (!Array.isArray(results)) return console.log('(from outputUsersHTML:) results is not Array');

        results.forEach(result => {
            let html = this.createUserHtml(result, true);
            container.append(html);
        });

        if (results.length === 0) {
            container.append("<span class='noResults'>No results found</span>");
        }
    };


    static outputPinnedPost(pinnedPostHtml, container) {
        container.html("");
        container.append(pinnedPostHtml);
    }

    static outputPostsExceptForPinned(dataToOutput, container) {

        container.html("");

        if (Array.isArray(dataToOutput) && dataToOutput.length === 0) {
            return container.append("<p class='noResults'>No Post Found</p>");
        }

        if (!Array.isArray(dataToOutput)) {
            dataToOutput = [dataToOutput];
        }

        dataToOutput.forEach(result => {
            // 每一筆資料都透過 createPostHtml 產生 HTML 後 append 到指定區塊
            let html = PostHTMLCreator.convertPostToHtml(result);
            container.append(html);
        });

    }

    static createUserHtml = (
        userData = Object.assign({
            userName: null
        }),
        toShowFollowButton = false) => {

        if (userData === undefined || userData.userName === null)
            return console.log('(createUserHtml:) please pass in valid user data object');

        let fullName = userData.firstName + " " + userData.lastName;

        // userLoggedIn 是 global variable
        let isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
        let buttonText = isFollowing ? "Following" : "Follow user";
        let buttonClass = isFollowing ? "followButton following" : "followButton";
        let buttonTitle = isFollowing ? "Click to un-follow user" : "Click to follow user";
        let followButton = "";

        // userLoggedIn 是 global variable
        // showFollowButton 為 false 的話就不顯示
        if (userLoggedIn._id != userData._id && toShowFollowButton) {
            followButton = `
            <div class='followButtonContainer'>
                <button
                    class='${buttonClass} follow-btn' 
                    data-user='${userData._id}'
                    title='${buttonTitle}'
                >
                        ${buttonText}
                </button>
            </div>
            `;
        }

        return `<div class='user'>
                <div class='profileImageContainer'>
                    <img src='${userData.profilePic}'>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${userData.userName}'>${fullName}</a>
                        <span class='username'>@${userData.userName}</span>
                    </div>
                </div>
                ${followButton}
            </div>`;
    };


}
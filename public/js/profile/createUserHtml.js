
export const createUserHtml = (userData, showFollowButton) => {

    let name = userData.firstName + " " + userData.lastName;
    let isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
    let buttonText = isFollowing ? "Currently following" : "Follow user";
    let buttonClass = isFollowing ? "followButton following" : "followButton";

    let followButton = "";
    if (showFollowButton && userLoggedIn._id != userData._id) {
        followButton = `<div class='followButtonContainer'>
                            <button class='${buttonClass} follow-btn' data-user='${userData._id}'>${buttonText}</button>
                        </div>`;
    }

    return `<div class='user'>
                <div class='profileImageContainer'>
                    <img src='${userData.profilePic}'>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${userData.userName}'>${name}</a>
                        <span class='username'>@${userData.userName}</span>
                    </div>
                </div>
                ${followButton}
            </div>`;
};

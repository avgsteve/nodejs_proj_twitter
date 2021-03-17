export function createUserHtml(userData, showFollowButton) {

    let userFullName = userData.firstName + " " + userData.lastName;

    let isFollowing =
        userLoggedIn.following &&
        userLoggedIn.following.includes(userData._id);

    let ifIsFollowingText = isFollowing ? "Following" : "Follow";

    // Follow button
    let buttonClass = isFollowing ? "followButton following" : "followButton";    
    let followButton = "";

    if (showFollowButton && userLoggedIn._id != userData._id) {
        followButton = `
        <div class='followButtonContainer'>
            <button
                class='${buttonClass}' 
                data-user='${userData._id}'
            >
            ${ifIsFollowingText}
            </button>
        </div>
        `;
    }

    return `
            <div class='user'>
                <div class='profileImageContainer'>
                    <img src='${userData.profilePic}'>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${userData.userName}'>
                            ${userFullName}
                        </a>
                        <span class='username'>@${userData.userName}</span>
                    </div>
                </div>
                ${followButton}
            </div>
            `;
}
const { outputUsersHTML } = require('./../profile/outputUsersHTML');

export const followerEventLoader = () => {

  return $(document).ready(() => {
    if (optionOfProfilePageTab === "followers") {
      console.log('loading followers tab');

      console.log("selectedTab: ", selectedTab);
      if (selectedTab === "followers") {
        loadFollowers();
      }
      else {
        // todo
        console.log('loading following tab');
        loadFollowing();
      }
    }
  });

};

function loadFollowers() {
  $.get(`/api/users/${profileUserId}/followers`, results => {
    outputUsersHTML(
      results.followers,
      $(".resultsContainer"));
  });
}

function loadFollowing() {
  $.get(`/api/users/${profileUserId}/following`, results => {
    outputUsersHTML(
      results.following,
      $(".resultsContainer"));
  });
}


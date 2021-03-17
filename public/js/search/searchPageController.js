import PostView from './../post//PostView';
const postView = new PostView();

import PostHTMLCreator from './../post//PostHTMLCreator';

import { outputUsersInContainer } from '../user/outputUsers';
import { createUserHtml } from '../user/createUserHtml';
import SearchPageModel from './searchPageModel';
import SearchPageView from './searchPageView';
let timer_executeSearch;

class SearchPageController {
  constructor() {
    this._searchBoxTypingEvent();
  }

  _searchBoxTypingEvent() {

    return $("input#searchBox").on('keydown', (event) => {

      let searchField = $(event.target);
      let searchValue = searchField.val();
      let searchType = searchField.data().search_type;
      let searchResults;
      let resultContainer = $('.resultsContainer');

      SearchPageView.showSearchPreloader(resultContainer, 'Searching...');

      // 清除現有 timer_executeSearch
      clearTimeout(timer_executeSearch);

      // 重設一個新 timer_executeSearch 
      timer_executeSearch = setTimeout(
        async () => {

          console.log('searchBox entered');
          console.log('搜尋類型: ', searchType);

          searchValue = searchField.val().trim();

          if (searchValue === "") return $(".resultsContainer").html("");

          searchResults =
            await SearchPageModel.searchUserOrPostByType(searchValue, searchType);

          if (searchType === 'posts') {

            let postHtmlArray = searchResults.map(post => {
              return PostHTMLCreator.convertPostToHtml(post);
            });

            postView.outputPostHTMLInContainer(
              postHtmlArray,
              $(".resultsContainer"),
              "No results Found. Try different keyword?");

          } else {
            outputUsersInContainer(searchResults, $(".resultsContainer"));
          }

        }, 1000);

    });
  }

  _searchUser() {

    return $("#userSearchTextbox").on('keydown', (event) => {

      let searchBox = $(event.target);
      let searchBoxValue = searchBox.val();

      clearTimeout(timer_executeSearch);

      if (searchBoxValue === "" && (event.which === 8 || event.keyCode === 8)) {
        // remove user from selection
        selectedUsers.pop();
        updateSelectedUsersHtml();
        $(".resultsContainer").html("");

        if (selectedUsers.length === 0) {
          $("#createChatButton").prop("disabled", true);
        }

        return;
      }

      timer_executeSearch = setTimeout(() => {
        searchBoxValue = searchBox.val().trim();

        if (searchBoxValue === "") {
          $(".resultsContainer").html("");
        }
        else {
          searchUsers(searchBoxValue);
        }
      }, 1000);

    });
  }
}


function searchUsers(searchTerm) {
  $.get("/api/users", { search: searchTerm }, results => {
    outputSelectableUsers(results, $(".resultsContainer"));
  });
}


function outputSelectableUsers(results, container) {
  container.html("");

  results.forEach(result => {

    if (result._id === userLoggedIn._id || selectedUsers.some(u => u._id === result._id)) {
      return;
    }

    let html = createUserHtml(result, false);
    let element = $(html);
    element.click(() => userSelected(result));

    container.append(element);
  });

  if (results.length === 0) {
    container.append("<span class='noResults'>No results found</span>");
  }
}


function updateSelectedUsersHtml() {
  let elements = [];

  selectedUsers.forEach(user => {
    let name = user.firstName + " " + user.lastName;
    let userElement = $(`<span class='selectedUser'>${name}</span>`);
    elements.push(userElement);
  });

  $(".selectedUser").remove();
  $("#selectedUsers").prepend(elements);
}


function userSelected(user) {
  selectedUsers.push(user);
  updateSelectedUsersHtml();
  $("#userSearchTextbox").val("").focus();
  $(".resultsContainer").html("");
  $("#createChatButton").prop("disabled", false);
}

function updateSelectedUsersHtml() {
  let elements = [];

  selectedUsers.forEach(user => {
    let name = user.firstName + " " + user.lastName;
    let userElement = $(`<span class='selectedUser'>${name}</span>`);
    elements.push(userElement);
  });

  $(".selectedUser").remove();
  $("#selectedUsers").prepend(elements);
}


export default SearchPageController;
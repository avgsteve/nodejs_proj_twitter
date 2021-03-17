class SearchPageModel {

  constructor() {

  }

  static searchUserOrPostByType(searchTerm, searchType) {

    let url = searchType === "users" ?
      "/api/users" : "/api/posts";

    return new Promise((res, rej) => {

      $.get(url,
        {
          searchTerm: searchTerm
        },
        (results) => {
          console.log('search result: ', results);
          res(results);
        })
        .fail((error) => {
          console.log('error while searching...', error);
          rej(error);
        });
    });
  }


}



export default SearchPageModel;
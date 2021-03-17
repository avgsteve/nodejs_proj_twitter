
const { createUserHtml } = require('./createUserHtml');

export function outputUsersInContainer(results, container) {
  container.html("");

  results.forEach(result => {
    let html = createUserHtml(result, true);
    container.append(html);
  });

  if (results.length === 0) {
    container.append("<span class='noResults'>No results Found. Try different keyword?</span>");
  }
}

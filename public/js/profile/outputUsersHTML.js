import { isArray } from 'jquery';

const { createUserHtml } = require('./createUserHTML');

export const outputUsersHTML = (results, container) => {
  container.html("");

  if (!Array.isArray(results)) return console.log('results is not Array');

  results.forEach(result => {
    let html = createUserHtml(result, true);
    container.append(html);
  });

  if (results.length === 0) {
    container.append("<span class='noResults'>No results found</span>");
  }
};
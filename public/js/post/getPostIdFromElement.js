
export default function getPostIdFromElement(element) {
  let isRoot = element.hasClass("post");
  let rootElement = isRoot === true ? element : element.closest(".post");
  let postId = rootElement.data().id;

  if (postId === undefined) return alert("Post id undefined");

  return postId;
}
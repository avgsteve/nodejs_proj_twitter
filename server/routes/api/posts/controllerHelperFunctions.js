
const User = require('../../../database/schemas/UserSchema');
const Post = require('../../../database/schemas/PostSchema');
const { ObjectId } = require('mongodb');

exports.searchOptionsFilter = (req, res) => {

  // todo
  let searchObj = req.query;

  // default option is not showing deleted post
  searchObj.isDeleted = {
    $ne: true
  };

  // 1) 找出是回覆文章的post
  if (searchObj.isReply !== undefined) {    
    let isReply = searchObj.isReply === "true";    
    
    // 將searchObj.isReply 換成 searchObj.isReplyToPost
    delete searchObj.isReply;

    searchObj.isReplyToPost = { $exists: isReply };
    // equals to query syntax:
    // Post.find(
    //   { isReplyToPost: { $exists: true } }
    // )
  }

  // 2) 搜尋content field 的內文
  if (searchObj.searchTerm !== undefined) {
    let searchKeyword = searchObj.searchTerm.toString();
    console.log('searchObj.searchTerm: ', searchObj.searchTerm);
    delete searchObj.searchTerm;
    searchObj.content = {
      $regex: searchKeyword, $options: "i"
      // $options: "i"  => case insensitive
      // https://tinyurl.com/mongodbRegexOption
    };
  }

  // 3) 前端 root path 會送出 req.query.postsFromFollowingOnly = true 的 API call
  // 限制只能顯示自己和追蹤使用者的文章
  if (searchObj.postsFromFollowingOnly) {

    let showPostFromFollowingOnly = searchObj.postsFromFollowingOnly === "true";

    if (showPostFromFollowingOnly) {
      let idsToShowPostsFrom = [];

      if (!res.locals.user.following
        || res.locals.user.following.length === 0) 
        res.locals.user.following = [];

      // 加入所有追蹤使用者的 id
      res.locals.user.following.forEach(user => {
        idsToShowPostsFrom.push(user);
      });

      // 也要加上登入使用者本身的 id
      idsToShowPostsFrom.push(res.locals.user._id);

      // 在 Post document 中 .find({ $in: (ids array) })
      searchObj.postedBy = { $in: idsToShowPostsFrom };
    }

    delete searchObj.postsFromFollowingOnly;
  }



  // 5) return searchObj to be used in Model.find() method as search condition
  return searchObj;
};

exports.findPostsWithFilterOptions = async (filter) => {

  // console.log('filter:', filter);

  let results = await Post.find(filter)
    .populate("postedBy", "_id userName firstName lastName profilePic")
    .populate("isRetweetToPost")
    .populate("isReplyToPost")
    .sort({ "createdAt": -1 }) // 新的資料最先出現
    .catch(error => console.log(error));
  
  // console.log("results:", results);

  let filteredResults = results.filter(
    r => {
      if (r.isRetweetToPost !== undefined) {
        return r.isRetweetToPost.isDeleted !== true;
      }
      return r;
    }
  );

  // console.log('filteredResults:', filteredResults);

  // 1) populate field for nested .postedBy field
  results =
    await User.populate(
      filteredResults,
      {
        path: "isReplyToPost.postedBy",
        // ↓↓↓ optionally select fields to output 
        // as some fields can be huge and not used 
        select: '_id userName firstName lastName profilePic'
      });

  results = await User.populate(filteredResults, { path: "isRetweetToPost.postedBy" });



  return results
};


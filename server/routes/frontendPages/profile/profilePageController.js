const User = require('../../../database/schemas/UserSchema');

async function getPayload(userNameToView, currentLoggedInUser) {

  // 1) 預設的 payload
  let payload = {
    pageTitle: `User: "${userNameToView}" is not found`,
    userLoggedIn: currentLoggedInUser,
    userLoggedInJs: JSON.stringify(currentLoggedInUser),
    userProfileToView: null
  };

  // 2) 使用 userName 去找使用者
  let userDocumentByUserName = await User.findOne({ userName: userNameToView });

  try {

    if (userDocumentByUserName !== null) {
      console.log(`使用 userName: "${userNameToView}" 找到使用者文件!`);
      payload.pageTitle = userDocumentByUserName.userName;
      payload.userProfileToView = userDocumentByUserName;
    }

    // 3) 使用 id 去找使用者    
    let userDocumentById = await User.findById(userNameToView);
    if (userDocumentById !== null) {
      console.log(`使用 user id: "${userNameToView}" 找到使用者文件!`);
      payload.pageTitle = userDocumentById.userName;
      payload.userProfileToView = userDocumentById;
    }

    // 如果有找到正確的結果的話，payload 會被 2) 或 3) 修改過。    
    return payload;

    // 而使用不存在的 userName 去找 User document 的話 mongoose 會拋出錯誤
    // 就使用 4) catch block 傳出 1) 的預設 payload

  } catch (error) {

    // 4)
    if (error.value !== undefined && error.path !== undefined) {
      console.log(
        '(getPayload function) mongoose 錯誤: 找不到使用者',
        { value: error.value, path: error.path }
      );
      return payload;
    }

    // 5) 如果發生意外錯誤，依然傳出預設 payload
    console.log('getPayload function 錯誤:  發生預期以外的錯誤 \n', error);
    return payload;
  }
}


// 完整路徑:  host/profile/
exports.getUserPage = (req, res, next) => {
  const userData = res.locals.user;
  let payload = {
    pageTitle: userData.userName,
    userLoggedIn: userData,
    userLoggedInJs: JSON.stringify(userData),
    userProfileToView: userData
  };


  // .optionOfProfilePageTab 是給 PUG 檔案中決定顯示哪一個分頁的選項
  payload.optionOfProfilePageTab = 'posts';

  res.status(200).render("profilePage/profilePage", payload);
};

// 取得使用者頁面 & 顯示發布過的文章   
// 完整路徑:  host/profile/:userName
exports.getUserPageById = async (req, res, next) => {
  const loggedInUser = res.locals.user;
  const userNameToView = req.params.userName;

  console.log('頁面的:userName: ', req.params.userName);

  let payload = await getPayload(
    userNameToView, loggedInUser);

  // .optionOfProfilePageTab 是給 PUG 檔案中決定顯示哪一個分頁的選項
  payload.optionOfProfilePageTab = 'posts';
  console.log('"/:userName/replies" payload :  ', payload);


  payload.userLoggedIn.following = payload.userLoggedIn.following.map(e => {
    return e.toString();
  });
  console.log('轉換後的 payload.userLoggedIn.following: ', payload.userLoggedIn.following);

  res.status(200).render("profilePage/profilePage", payload);
};

// 取得使用者頁面 & 顯示回覆過的文章   
// 完整路徑: host/profile/:userName/replies
exports.getUserPageById_withReplies = async (req, res, next) => {
  const loggedInUser = res.locals.user;
  const userNameToView = req.params.userName;

  console.log('頁面的:userName: ', req.params.userName);

  let payload = await getPayload(
    userNameToView, loggedInUser);

  // .optionOfProfilePageTab 是給 PUG 檔案中決定顯示哪一個分頁的選項
  payload.optionOfProfilePageTab = 'replies'; // 顯示 reply 分頁

  console.log('"/:userName/replies" payload :  ', payload);

  res.status(200).render("profilePage/profilePage", payload);
};

// 取得使用者頁面 & 顯示追蹤的使用者
// 完整路徑: host/profile/:userName/following
exports.getFollowingUsersPage = async (req, res, next) => {
  const loggedInUser = res.locals.user;
  const userNameToView = req.params.userName;
  let payload = await getPayload(
    userNameToView, loggedInUser);

  payload.userLoggedIn.following = payload.userLoggedIn.following.map(e => {
    return e.toString();
  });

  payload.optionOfFollowerPageTab = 'following'; // 顯示 reply 分頁

  res.status(200).render("profilePage/followersAndFollowingPage", payload);
};


// 取得使用者頁面 & 顯示追蹤的使用者
// 完整路徑: host/profile/:userName/following
exports.getFollowersPage = async (req, res, next) => {
  const loggedInUser = res.locals.user;
  const userNameToView = req.params.userName;
  let payload = await getPayload(
    userNameToView, loggedInUser);

  // payload.userLoggedIn.following = payload.userLoggedIn.following.map(e => {
  //   return e.toString();
  // });

  payload.optionOfFollowerPageTab = 'followers'; // 顯示 reply 分頁

  res.status(200).render("profilePage/followersAndFollowingPage", payload);
}



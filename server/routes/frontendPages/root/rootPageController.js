
exports.rootPage = function (req, res, next) {

  console.log('req.originalUrl: ', req.originalUrl);
  console.log('req.originalUrl.length: ', req.originalUrl.length);

  if (req.originalUrl[0] === '/' && req.originalUrl.length > 1)
    return next(); // means url is not for root path page (home page)

  console.log('??');

  const userData = res.locals.user;
  if (!res.locals.user) return res.redirect('/login');

  let payload = {
    pageTitle: "Home",

    // 給 Pug 用的物件
    userLoggedIn: userData,

    // 作為前端 JavaScript 變數用的物件
    userLoggedInJs: JSON.stringify(userData),

    // 因為 profile route 有這個屬性給前端，讓 main-layout.pug 的變數內容有一致性
    userProfileToView: JSON.stringify(userData),
  };
  res.status(200).render("home", payload);
};
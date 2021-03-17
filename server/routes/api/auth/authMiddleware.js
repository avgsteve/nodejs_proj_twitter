exports.requireLogin = (req, res, next) => {
    // 檢查是否已經有透過登入程序登入後建立含有使用者資訊的 session

    console.log({
        'req.session': req.session,
        'res.locals.user': res.locals.user,
    });

    if (req.session && res.locals.user) {
        return next();
    }
    else {
        return res.redirect('/login');
    }
}
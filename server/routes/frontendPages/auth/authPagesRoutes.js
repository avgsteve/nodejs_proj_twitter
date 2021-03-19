const express = require('express');
const router = express.Router();
const statistic = require('./../../../database/statisticData')

router.get("/login", (req, res, next) => {

  const { totalRegisteredUsers,
    totalCreatedPosts,
    totalPostLikes,
    totalPostRetweets,
    lastUpdated } = statistic.data;

  // console.log('data for front: ', {
  //   totalRegisteredUsers,
  //   totalCreatedPosts,
  //   totalPostLikes,
  //   totalPostRetweets,
  //   lastUpdated
  // });

  res.status(200).render("authPage/login", {
    totalRegisteredUsers,
    totalCreatedPosts,
    totalPostLikes,
    totalPostRetweets,
    lastUpdated,
    pageTitle: 'Login'
  }
  );
});

router.get("/register", (req, res, next) => {

  const { totalRegisteredUsers,
    totalCreatedPosts,
    totalPostLikes,
    totalPostRetweets,
    lastUpdated } = statistic.data;


  res.status(200).render("authPage/register", {
    totalRegisteredUsers,
    totalCreatedPosts,
    totalPostLikes,
    totalPostRetweets,
    lastUpdated,
    pageTitle: 'Register'
  });
});

router.get("/logout", (req, res, next) => {

  if (res.locals.user) res.locals.user = null;

  if (req.session) {
    req.session.destroy(() => {
      // res.redirect("/login");
    });
  }

  res.cookie("jwtCookie", "loggedOut", {
    expires: new Date(Date.now() + 1),
    httpOnly: true,
  });

  res.redirect('/login');
});

router.get("/activateAccount", (req, res, next) => {
  res.status(200).render("authPage/activateAccount", {
    pageTitle: 'Activate You Account'
  });
});

router.get("/resendActivationCode", (req, res, next) => {
  res.status(200).render("authPage/resendActivation",
    {
      pageTitle: 'Resend Activation'
    });
});


router.get("/activationSent", (req, res, next) => {
  res.status(200).render("authPage/activationSent",
    {
      pageTitle: 'Activation has been sent'
    });
});

module.exports = router;
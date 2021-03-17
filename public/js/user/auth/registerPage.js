
let submitRegisterBtn = $('#registerBtn');

submitRegisterBtn.on('click', async (e) => {
  e.preventDefault();
  const registerHelper = new UserAuthHandler('register');
  const originalHtmlInBtn = registerHelper.showLoadingAnimationInButton(submitRegisterBtn);
  submitRegisterBtn.prop('disabled', true);

  const signupResult = await registerHelper.signupNewUser();

  if (signupResult) {
    return setTimeout(
      () => {
        location.assign('/');
      },
      1300);
  }

  // restore html in button
  submitRegisterBtn.html(originalHtmlInBtn);
  submitRegisterBtn.prop('disabled', false);

});



// export { loginEventListener };

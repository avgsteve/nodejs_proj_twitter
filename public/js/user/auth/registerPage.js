
let submitRegisterBtn = $('#registerBtn');

$(document).on('click', '#registerBtn', async (e) => {
  e.preventDefault();
  const registerHelper = new UserAuthHandler('register');
  registerHelper.showLoadingAnimationInButton(submitRegisterBtn);
  submitRegisterBtn.prop('disabled', true);

  const signupResult = await registerHelper.signupNewUser();
  if (signupResult === true) {
    return setTimeout(
      () => {
        location.assign('/');
      },
      1300);
  } 
  
  console.log('registration error:', signupResult);
  registerHelper.showRegisterError(signupResult);

});



// export { loginEventListener };

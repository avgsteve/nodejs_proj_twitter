UserAuthHandler.clearAllFields()
let submitRegisterBtn = $('#registerBtn');

$(document).on('click', '#registerBtn', async (e) => {
  const registerHelper = new UserAuthHandler('register');
  e.preventDefault();
  registerHelper.showLoadingAnimationInButton(submitRegisterBtn);
  submitRegisterBtn.prop('disabled', true);

  const signupResult = await registerHelper.signupNewUser();
  if (signupResult === true) {
    return setTimeout(
      () => {
        location.assign('/activationSent');
      },
      700);
  } 
  
  console.log('registration error:', signupResult);
  registerHelper.showRegisterError(signupResult);

});



// export { loginEventListener };

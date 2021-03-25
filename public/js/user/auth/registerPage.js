/// <reference path="./../../../../node_modules/@types/jquery/index.d.ts" />


UserAuthHandler.clearAllFields()
let submitRegisterBtn = $('#registerBtn');

$(document).on('click', '#registerBtn', async (e) => {
  e.preventDefault();

  const registerHelper = new UserAuthHandler('register');

  registerHelper.showLoadingAnimationInButton(
    submitRegisterBtn, 'processing ...', 4000);

  submitRegisterBtn.prop('disabled', true);

  const signupResult = await registerHelper.signupNewUser();

  if (signupResult === true) {
    registerHelper.showRegisterSucceed();
    return setTimeout(
      () => {
        location.assign('/activationSent');
      },
      2000);
  } 
  
  console.log('registration error:', signupResult);
  registerHelper.showRegisterError(signupResult);

});



// export { loginEventListener };

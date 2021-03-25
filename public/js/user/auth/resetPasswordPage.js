let helper = new UserAuthHandler('activation');


$(document).on('click',
  '.resetPasswordBtn, .reqResetPasswordTokenBtn',
  async function (e) {

    e.preventDefault();
    let isForgotPwdPage = window.location.toString().includes('forgot');

    let data = isForgotPwdPage === true ?
      helper.getResetPasswordData('token')
      : helper.getResetPasswordData('resetPassword');

    // console.log('data: ', data);
    // return;

    if (!data) return;

    // If successfully fetched data from page, update UI and send request
    $('errorMessage').text('');
    helper.showWholePagePreloader();


    try {


      let result = await
        helper.sendPasswordResetReq(data, isForgotPwdPage);

      console.log('result:', result);

      if (result === true) {
        helper.showWholePagePreloader("", false); // turn off
        helper.showActivationSucceed('Success!');
        helper.showRequestSucceed(true); // 
        return setTimeout(() => {
          window.location.assign(`${isForgotPwdPage ? "/resetTokenSent" : "/login"}`);
        }, 1500);
      }

    } catch (error) {
      console.log('error:', error);
      // if result is not true, means something went wrong      
      helper.showErrorMessage(error.errorMessage);
      helper.showWholePagePreloader("", false); // turn off

    }
  });


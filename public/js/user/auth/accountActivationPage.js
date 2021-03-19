let helper = new UserAuthHandler('activation');


$(document).on('click',

  '#activateAccBtn, #resendActivationBtn', async function (e) {
    e.preventDefault();
    let btn = $(e.target);
    let result;
    let currentPage = btn.hasClass('activationBtn') === true ? 'activation' : 'resendActivation';
    $('errorMessage').text('');

    if (currentPage === 'activation') {
      let { userName, activationCode } = helper.getActivationData();
      helper.showLoadingAnimationInButton($(btn));
      result = await helper.sendActivationCode({ userName, activationCode });
    }

    if (currentPage === 'resendActivation') {
      let userName = $('#loginAccount').val();
      if (!userName) return helper.showActivationError('Please enter username or email');
      helper.showLoadingAnimationInButton($(btn));
      result = await helper.reqToResendActivationCode({ userName });
    }

    if (result === true) {
      helper.showActivationSucceed(currentPage);
      return setTimeout(() => {
        window.location.assign(`${currentPage === 'activation' ? '/login' : '/activateAccount'}`);
      }, 2000);
    }

    // if result is not true, means something went wrong
    helper.showActivationError(result.errorMessage || '');
  });


/// <reference path="./../../../../node_modules/@types/jquery/index.d.ts" />

class UserAuthHandler {

  constructor(authType) {

    this.authType = authType;

    // 註冊用的 private fields
    if (authType === 'register') {
      const registerData = this.getRegisterData();
      this.registerData = {
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        userName: registerData.userName,
        password: registerData.password,
        passwordConf: registerData.passwordConf,
        email: registerData.email
      };
      this.newUserRegistered = false;
    }

    // 登入用的 private fields
    if (authType === 'login') {
      const loginData = this.getLoginData();
      this.loginData = {
        account: loginData.account,
        password: loginData.password,        
      };
      this.newUserRegistered = false;
    }


  }

  async signupNewUser() {
    $('.errorHints').remove();
    this.checkIfLoginDataIsCorrect();

    return new Promise((res, rej) => {

      try {

        $.post({
          url: '/register',
          data: this.registerData,
        }).done((data, textStatus, xhr) => {

          if (xhr.status === 201) {
            return res(true);
          }
          return res(false);

        }).fail((data, textStatus, xhr) => {
          console.log('register fail!');
          console.log('data: ', data);
          return res(data.responseJSON);
        });

      } catch (error) {
        console.log('error: ', error);
        rej(error);
      }

    });

  }

  async login() {

    this.checkIfLoginDataIsCorrect();

    return new Promise((res, rej) => {

      try {


        $.post({
          url: '/login',
          data: this.loginData,
        }).done((data, textStatus, xhr) => {

          if (xhr.status === 200) {
            return res(true);
          }
          return res(data.responseJSON);

        }).fail((data, textStatus, xhr) => {
          console.log('login fail!');
          console.log('data: ', data);
          return res(data.responseJSON);
        });
      } catch (error) {
        console.log('error: ', error);
        rej(error);
      }
    });
  }

  async sendActivationCode(data) {
    return new Promise((res, rej) => {
      console.log('data:', data);
      $.ajax({
        method: "POST",
        url: "/activateUser",
        data: data
      }).done(function (data, textStatus, xhr) {
        if (xhr.status === 200) {
          console.log(data.responseJSON);
          return res(true);
        }
        rej(data.responseJSON);
      }).fail(function (data, textStatus, xhr) {
        console.log('failed');
        return res(data.responseJSON);
      });
    }
    );
  }

  async reqToResendActivationCode(data) {
    return new Promise((res, rej) => {
      console.log('data:', data);
      $.ajax({
        method: "POST",
        url: "/resendActivation",
        data: data
      }).done(function (data, textStatus, xhr) {
        if (xhr.status === 200) {
          console.log(data.responseJSON);
          return res(true);
        }
        rej(data.responseJSON);
      }).fail(function (data, textStatus, xhr) {
        console.log('failed');
        return res(data.responseJSON);
      });
    }
    );
  }

  static clearAllFields() {
    $(document).on('click', '.clearRegisterInput', () => {
      console.log('this: ', this);
      $('#registerForm input').each(function () {
        $(this).val('');
      });
      $('.errorHints').remove();
    });
  }

  checkIfLoginDataIsCorrect() {

    let dataToCheck = this.authType === "register" ? this.registerData : this.loginData;
    let errorData = { errors: [] };

    console.log('dataToCheck:', dataToCheck);

    for (let key in dataToCheck) {
      if (dataToCheck[key] === null) {
        $('.errorMessage').text('Please fill all fields');
        errorData.errors.push({ param: `${key}`, msg: 'Please fill this field' });
      }
    }

    // Check if passwords match
    if (
      !dataToCheck.account // no need to check when it's login data
      && dataToCheck.password !== dataToCheck.passwordConf) {
      let errorMsg = `passwords don't match`;
      let error = { errors: [{ param: 'password', msg: errorMsg }] };
      this.showRegisterError(error);
      throw Error(errorMsg);
    }

    if (errorData.errors.length !== 0) {
      this.showRegisterError(errorData);
      throw Error(`Need to complete all fields`);
    }
  }

  showRegisterError(data) {

    data.errors.forEach(error => {
      let errorField = error.param;
      $(`#${errorField}`).after(`<span class='errorHints'>${error.msg}</span>`);
    });

    $('input').on('keydown', (e) => {
      let input = $(e.target);
      $('.errorMessage').text('');
      input.next('.errorHints').remove();
    });

  }

  showRegisterSucceed() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    $('p.successMessage')
      .text('Success! Please check your email').fadeIn('1800')
      .after(`<p class='successMessage two' style="display:none">Redirecting to activation page</p>`);
    setTimeout(() => {
      $('p.successMessage.two').fadeIn('4000');
    }, 1000);
  }

  showLoginError(data) {

    data.errors.forEach(error => {
      let errorField = error.param; // Currently not used
      $('.errorMessage').text(`${error.msg}`);
    });

    $('input').on('keydown', (e) => {
      let input = $(e.target);
      $('.errorMessage').text('');
      input.next('.errorHints').remove();
    });

  }

  showActivationError(errorMessage = 'error message') {

    let errorP = $('p.errorMessage').text(errorMessage);

    $('input#loginAccount, input#activationCode, input#loginAccount')
      .on('keydown keyup', (e) => {
        errorP.text('');
      });

  }

  showActivationSucceed(currentPage = 'activation') {
    let successMessage =
      'Successful! ' +
      `${currentPage === 'activation' ?
        'Redirect to login page' :
        'Please check email. Redirecting to activation page'}`;

    console.log('successMessage:', successMessage);
    $('.successMessage').text(successMessage);
  }

  showLoadingAnimationInButton(btn = $('#loginBtn'), message, timeout = 1000) {

    let messageToShow = message || 'processing ...';

    let originalHtmlInBtn = btn.html();
    let loadingAnimation = `
        <span class="submitStatusMessage">  ${messageToShow} </span>
        <span
          class="spinner-grow spinner-grow-sm" 
          role="status" aria-hidden="true"
        >
        </span>
        <span class="sr-only"> ${messageToShow}  </span>
      `;

    btn.html(loadingAnimation);
    submitRegisterBtn.prop('disabled', false);

    setTimeout(() => {
      btn.html(originalHtmlInBtn);
      btn.prop('disabled', false);
    }, timeout);

    return originalHtmlInBtn;

  }

  getRegisterData() {

    const element = (id) => document.getElementById(id);

    const registerData = {
      firstName: element('firstName').value || null,
      lastName: element('lastName').value || null,
      userName: element('userName').value || null,
      email: element('email').value || null,
      password: element('password').value || null,
      passwordConf: element('passwordConf').value || null,
    };

    return registerData;
  };

  getLoginData() {
    const element = (elementId) => document.getElementById(elementId);
    const loginData = {
      account: element('loginAccount').value || null,
      password: element('loginPassword').value || null,
    };
    console.log('取得的loginData: ', loginData);
    return loginData;
  };

  getActivationData() {
    let activationCode = $('#activationCode').val().trim();
    let userName = $('#loginAccount').val().trim();

    if (!activationCode || !userName)
      return this.showActivationError('Please fill both fields!');

    return { userName, activationCode };
  }

  getResendActivationData() {
    let userName = $('#loginAccount').val().trim();
    let captcha = $('#captcha').val().trim();

    if (!userName || !captcha)
      return this.showActivationError('Please fill both fields!');

    return { userName, captcha };
  }

}
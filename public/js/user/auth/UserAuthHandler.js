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
        password: registerData.newPassword,
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

    this.clearAllFields();

  }

  async signupNewUser() {

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
        return res(false)

      }).fail((data, textStatus, xhr) => {
        console.log('login fail!');
        // console.log('data: ', data);
        return res(false)
      });
      } catch (error) {
        console.log('error: ', error);
        rej(error);
      }
    });
  }

  clearAllFields() {
    $(document).on('click', '.clearRegisterInput', () => {
      console.log('this: ', this);
      $('#registerForm input').each(function () {
        $(this).val('');
      });
    });
  }

  checkIfLoginDataIsCorrect() {

    console.log('checking data');
    let dataToCheck = this.authType === "register" ? this.registerData : this.loginData
    console.log('dataToCheck:', dataToCheck);
    console.log(this);

    for (let key in dataToCheck) {
      if (dataToCheck[key] === null) {
        $('.errorMessage').text('Please fill all fields');
        throw Error(`The value of property:${key} is null. Please check`);
      }
    }




  }

  showRegisterError(data) {

    data.errors.forEach(error => {
      let errorField = error.param;
      $(`#${errorField}`).after(`<span class='errorHints'>${error.msg}</span>`);
    });

    $('input').on('keydown', (e) => {
      let input = $(e.target);
      input.next('.errorHints').remove();
    })

  }


  showLoadingAnimationInButton(btn = $('#loginBtn'), message) {

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
    }, 1500);

    return originalHtmlInBtn;

  }

  getRegisterData() {

    const element = (id) => document.getElementById(id);

    // 檢查新密碼是否符合 & 透過UI提示密碼不符合
    if (element('password').value !== element('passwordConf').value) {
      let errorParagraph = element('errorMessage');

      if (!errorParagraph) return;
      let errorMessage = "Password don't match";

      console.log(errorMessage);
      errorParagraph.innerText = errorMessage;
    }

    const registerData = {
      firstName: element('firstName').value || null,
      lastName: element('lastName').value || null,
      userName: element('userName').value || null,
      email: element('email').value || null,
      newPassword: element('password').value || null,
      newPasswordConfirm: element('passwordConf').value || null,
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
}
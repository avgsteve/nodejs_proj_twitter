
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


  }

  async signupNewUser() {


    this.checkIfLoginDataIsCorrect();

    return new Promise((res, rej) => {

      $.post({
        url: '/register',
        data: this.registerData,
      }).done((data, textStatus, xhr) => {
        console.log('註冊成功!');
        console.log('data: ', data);
        console.log('textStatus: ', textStatus);
        console.log('xhr: ', xhr);

        if (xhr.status === 201) {
          res(true);
        }

      }).fail((data, textStatus, xhr) => {

        console.log('註冊失敗!');
        console.log('data: ', data);
        console.log('textStatus: ', textStatus);
        console.log('xhr.status: ', xhr.status);

        rej(false);
      });
    });

  }

  async login() {

    this.checkIfLoginDataIsCorrect();

    return new Promise((res, rej) => {

      $.post({
        url: '/login',
        data: this.loginData,
      }).done((data, textStatus, xhr) => {
        console.log('登入成功!');
        console.log('data: ', data);
        console.log('textStatus: ', textStatus);
        console.log('xhr: ', xhr);

        if (xhr.status === 200) {
          res(true);
        }

      }).fail((data, textStatus, xhr) => {

        console.log('登入失敗!');
        console.log('data: ', data);
        console.log('textStatus: ', textStatus);
        console.log('xhr.status: ', xhr.status);

        rej(false);
      });
    });

  }

  checkIfLoginDataIsCorrect() {

    let dataToCheck = this.authType === "register" ? this.registerData : this.loginData

    for (let key in dataToCheck) {
      if (this[key] === null) {
        throw Error(`The value of property:${key} is null. Please check`);
      }
    }
  }

  showErrorInUI(errorMessage = 'error') {
    const element = (id) => document.getElementById(id);

    // 檢查新密碼是否符合 & 透過UI提示密碼不符合
    if (element('password').value !== element('passwordConf').value) {
      let errorParagraph = element('errorMessage');

      if (!errorParagraph) return;
      let errorMessage = "Password don't match";

      console.log(errorMessage);
      errorParagraph.innerText = errorMessage;
    }
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
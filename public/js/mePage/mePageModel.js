import GlobalView from '../GlobalControl/GlobalView';

export default class MePageModel {
  constructor() {

  }

  static sendDeleteAccountRequest(userIdToDelete, password) {

    if (!userIdToDelete) throw Error('need to pass in parameter: userIdToDelete');
    if (!password) throw Error('need to pass in parameter: password');

    return new Promise((res, rej) => {
      $.ajax({
        url: `/api/me/${userIdToDelete}/delete`,
        type: "POST",
        data: { password: password }
      }).then(null, (responseData) => {
        console.log('response data for delete request', responseData);
        if (responseData.status === 200)
          return res(true);
        res(responseData.responseJSON.errors[0]);
      }).fail(
        function (data) {
          console.log('reject data: ', data);
          rej(data);
        }
      );

    }
    );
  }

  static getPasswordFromDeleteModal(inputField = $('input#passwordForDeleteAcc')) {

    if (!inputField.val() || inputField.val().length < 5) {
      GlobalView.showAlert({
        styleOption: 2,
        message: 'Need to enter correct password',
        timeToDisappear: 2000,
        slideIn: true,
      });
      return;
    }

    return inputField.val();

  }
}

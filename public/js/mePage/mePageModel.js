import GlobalView from '../GlobalControl/GlobalView';

export default class MePageModel {
  constructor() {

  }

  static sendDeleteAccountRequest(userIdToDelete, password, isForCancelDelete = false) {

    if (!userIdToDelete) throw Error('need to pass in parameter: userIdToDelete');
    if (!password) throw Error('need to pass in parameter: password');
    let url =
      isForCancelDelete === true ?
        `/api/me/${userIdToDelete}/delete/cancel` :
        `/api/me/${userIdToDelete}/delete`;

    return new Promise((res, rej) => {
      $.ajax({
        url: url,
        type: "POST",
        data: { password: password },
        success: function (responseData, textStatus, xhr) {
          console.log('xhr: ', xhr);
          console.log('status: ', textStatus);
          console.log('responseData: ', responseData);

          if (xhr.status !== 200) {
            return rej(responseData.responseJSON.errors[0]);
          }
          if (xhr.status === 200) {
            return res(true);
          }

        }
      }).fail(
        function (data) {
          console.log('reject data: ', data);
          return res(data.responseJSON.errors[0]);
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

import GlobalView from '../GlobalControl/GlobalView';
import MePageView from './mePageView'
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
          // console.log('xhr: ', xhr);
          // console.log('status: ', textStatus);
          // console.log('responseData: ', responseData);

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

  static getDataForUpdatePassword() {
    let currentPassword = $('#myCurrentPassword').val();
    let newPassword = $('#myNewPassword').val();
    let confirmPassword = $('#myNewPasswordConfirm').val();

    if (!newPassword || !confirmPassword || !currentPassword) {
      MePageView.showMsg('Please fill all field');
      return null;
    }
    if (newPassword !== confirmPassword) {
      MePageView.showMsg(`Passwords don't match`);
      return null;

    }
    return { currentPassword, newPassword, confirmPassword };

  }

  static sendUpdatePasswordReq(data) {

    return new Promise((res, rej) => {
      $.ajax({
        url: 'api/me/updatePassword',
        type: "PUT",
        data: data,
        success: function (responseData, textStatus, xhr) {
          console.log('xhr: ', xhr);
          console.log('status: ', textStatus);
          console.log('responseData: ', responseData);

          if (xhr.status === 200) {
            return res(true);
          }

          if (xhr.status !== 200) {
            return res(responseData.errorMessage);
          }

        }
      }).fail(
        function (responseData, textStatus, xhr) {
          console.log('reject data: ', responseData);
          return res(responseData.responseJSON.errors[0].msg);
        }
      );

    }
    );
  }


}

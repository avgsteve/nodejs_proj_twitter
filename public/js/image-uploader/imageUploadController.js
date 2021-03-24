
import Cropper from 'cropperjs';
let cropper;

export default class ImageUploader {

  constructor() {
    this._initEvenListener();
    this._loadedImage = null;
    this._imageFileRead = new FileReader();
  }

  _initEvenListener() {
    let eventListenersList = this._getListOfEventListener();
    eventListenersList.forEach(eventListener => {
      eventListener.call();
    });
  }

  _getListOfEventListener() {
    return [
      this._edit__ProfileImage,
      this._uploadProfileImage,
      this._edit__ProfileCover,
      this._uploadProfileCover,
    ];
  }


  _edit__ProfileImage() {

    return $("#profileImageUploadInput").on('change', function () {

      console.log('#profileImageUploadInput 讀取新圖片!');

      if (this.files && this.files[0]) {

        let file = this.files[0];
        console.log('fetched file', file);

        // 透過 Web API FileReader Class 來讀取 input 裡面開啟的資料
        // ref: https://developer.mozilla.org/en-US/docs/Web/API/FileReader/onload

        let reader = new FileReader();

        reader.onload = (e) => {

          console.log('image is loaded: ', e.target);

          // 將透過 input 取得的圖檔顯示在.imagePreviewContainer區塊中的img#imagePreview
          let imageReviewInPage = $('img#imagePreview').attr('src', e.target.result);

          // Cropper Js 如果已經存在於 global 變數 "cropper" 裡面，
          // 就把 cropper 變數銷毀建立一個新的 instance 
          if (cropper !== undefined) {
            cropper.destroy();
          }

          // Cropper Js: https: //github.com/fengyuanchen/cropperjs/blob/master/README.md#example
          // 另外要在 CSS 裡設定 img#imagePreview 的屬性 (參照上面網址內的example)
          cropper = new Cropper(imageReviewInPage[0], {
            // settings: https://github.com/fengyuanchen/cropperjs/blob/master/README.md#usage
            aspectRatio: 1 / 1,
            background: false
          });

        };

        reader.readAsDataURL(this.files[0]);

      }
      else {
        console.log("nope");
      }
    });
  }

  _uploadProfileImage() {
    return $("#imageUploadButton").click(() => {

      // 透過 cropper 變數裡面 已經建立的 CropperJS 實例，取得剪裁過的圖片
      // https://tinyurl.com/convertToBlob

      let canvas = cropper.getCroppedCanvas();

      if (canvas === null) {
        alert("Could not upload image. Make sure it is an image file.");
        return;
      }

      canvas.toBlob((blob) => {
        
        console.log('讀取到的 blob : ', blob);

        let formData = new FormData();
        formData.append("croppedImage", blob);

        $.ajax({
          url: "/api/users/profilePicture",
          type: "POST",
          data: formData,
          processData: false, // 強制 jQuery 不要轉成 string
          contentType: false, // 強制 jQuery 不要指定 content type
          success: () => {
            console.log('upload profile image OK');
            location.reload();
          }
        });
      });
    });
  }

  _edit__ProfileCover() {

    $("#coverPhoto").change(function () {
      if (this.files && this.files[0]) {
        let reader = new FileReader();
        reader.onload = (e) => {
          let image = document.getElementById("coverPreview");
          image.src = e.target.result;

          if (cropper !== undefined) {
            cropper.destroy();
          }

          cropper = new Cropper(image, {
            aspectRatio: 16 / 9,
            background: false
          });

        };
        reader.readAsDataURL(this.files[0]);
      }
    });

  }

  _uploadProfileCover() {

    $("#uploadCoverPhotoButton").click(() => {
      let canvas = cropper.getCroppedCanvas();

      if (canvas === null) {
        alert("Could not upload image. Make sure it is an image file.");
        return;
      }

      canvas.toBlob((blob) => {
        let formData = new FormData();
        formData.append("croppedImage", blob);

        $.ajax({
          url: "/api/users/coverPhoto",
          type: "POST",
          data: formData,
          processData: false,
          contentType: false,
          success: () => location.reload()
        });
      });
    });

  }

}

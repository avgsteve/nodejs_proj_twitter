/// <reference path="./../../../../node_modules/@types/jquery/index.d.ts" />


export default class GlobalDataModel {
  constructor() {

  }
  static getServerTime() {
    console.log('getServerTime');
    return new Promise((res, rej) => {
      $.ajax({
        url: `/time`,
        method: "GET",
        success: (data, textStatus, jqXHR) => {
          res(data);
        }
      }).fail(
        function (data, textStatus, xhr) {
          console.log('reject data: ', data);
          rej(data);
        }
      );
    }
    );


  }
}
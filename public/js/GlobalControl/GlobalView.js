import NotificationModel from '../notification/NotificationModel';
import GlobalViewModel from './GlobalViewModel';
const globalViewModel = new GlobalViewModel();
export default class GlobalView {

  static showPreloaderInElement(
    preloaderContainer, preloaderText = 'default', preloaderStyle = 0) {

    if (!preloaderContainer) return;

    // check parameters' value
    let textToRender =
      typeof preloaderText === 'string' ? preloaderText : 'default';
    let loaderStyleNumber =
      typeof preloaderStyle === 'number' ? preloaderStyle : 0;

    // keep original html in case need to restore the button
    let originalHTML = preloaderContainer.html();
    let loaderElement;

    // message to show in preloader
    if (
      preloaderText !== 'default' && preloaderText !== ""
    ) {
      textToRender = preloaderText;
    }

    if (preloaderText === 'random') {
      textToRender = this.getRandomLoadingText();
    } else {
      textToRender = 'Loading Content ...';
    }

    // 2) loading 圖案的樣式
    if (loaderStyleNumber === 0)
      loaderElement = `          
        <div class='spinner_loader' 
            style="
              width: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 2rem;
            "
        >

            <div class="spinner-border text-center" role="status">
                <span class="sr-only">Loading...</span>
            </div>          
            <p> ${textToRender} </p>  
        </div>
      `;

    if (loaderStyleNumber === 1)
      loaderElement = `          
        <div class="loader-container">
            <div class="loader7 loader">
            </div>
            <p> ${textToRender} </p>              
        </div>
      `;


    preloaderContainer.html(loaderElement);
    return originalHTML;

  }

  static removePreloaderInElement() {
    let loaderElement = $('.loader-container');
    if (loaderElement.length !== 0) {
      loaderElement.remove();
    }
  }

  static showPreloadInButton(buttonElement, originalChildElement) {

    if (!buttonElement) return;

    // Make button restored to original style and content
    if (originalChildElement) return buttonElement.html(originalChildElement);

    let originalHTML = buttonElement.html();
    // if (!element)
    let preloader = `
                <span 
                    class="spinner-grow spinner-grow-sm" 
                    role="status" aria-hidden="true"
                ></span>
                <span class="sr-only">Loading...</span>
        `;

    buttonElement.html(preloader);
    return originalHTML;
  }

  static getRandomLoadingText() {
    let randomText = [
      'Loading Awesome Content',
      'Loading. Please BE PATIENT!',
      'Loading. Won\'t be looooong',
      'Loading...😺',

    ];
    let randomIndex = Math.floor(Math.random() * randomText.length);
    return randomText[randomIndex];
  }

  static showAlert(
    {
      styleOption = 0,
      message = 'alert message',
      elementToShowAlert = $(document.body),
      timeToDisappear = 1000,
      slideIn = false,
      closeManually = false,
      removeElementOnClose = true,
    } = {}
  ) {

    if (
      typeof styleOption !== 'number' || parseInt(styleOption) > 3
    )
      styleOption = 0; // default

    let alertStyle = [
      'default',
      'success',
      'danger',
      'warning'
    ][styleOption];

    let alertMessage = message || 'alert Message';
    let alertMarkup = `    
        <div
            class=
              " ${slideIn === false ? "" : "slide-in"}
                globalAlert alert
                ${alertStyle}-alert
              "
            >
            <h3> ${alertMessage} </h3>
            <a class="close">&times;</a>
        </div>
    `;

    elementToShowAlert.prepend($(alertMarkup));

    $(".close").on('click', function () {
      $(this)
        .parent(".alert")
        .fadeOut();
      if (removeElementOnClose)
        $(this)
          .parent(".alert").remove();
    });



    if (!closeManually)
      setTimeout(
        () => {
          // $('.globalAlert').css('display', 'none');
          $('.globalAlert')
            // .removeClass('slide-in')
            .addClass('slide-out');
        }
        , timeToDisappear || 1200
      );
  }

  static async refreshMessagesBadge(data) {
    let numResults = data.length;
    if (numResults > 0) {
      $("#messagesBadge").text(numResults).addClass("active");
    }
    else {
      $("#messagesBadge").text("").removeClass("active");
    }

    ;
  }

  static showNotificationPopup(noticeData) {

    let popupMarkup = NotificationModel.convertNoticeToPopupHtml(noticeData);

    let element = $(popupMarkup); // convert to jQuery obj
    element
      .hide()
      .prependTo("#popupNoticeContainer")
      .slideDown("fast"); // Need to call .hide() before .slideDown
    setTimeout(() => element.fadeOut(400), 5000);
  }

  // Called by:GlobalViewController.showNoticeInPopup()
  static showMessagePopup(popupHtml) {
    let popupElement = $(popupHtml);
    // Need to set CSS for #popupNoticeContainer
    popupElement.hide().prependTo("#popupNoticeContainer").slideDown("fast");
    setTimeout(() => popupElement.fadeOut(400), 5000);
  }

  static activateNotificationBadge(unreadCounts) {
    return $("#notificationBadge").text(unreadCounts).addClass("active");
  }

  static deactivateNotificationBadge() {
    return $("#notificationBadge").text("").removeClass("active");
  }

  static activateMessagesBadge(unreadCounts) {
    return $("#messagesBadge").text(unreadCounts).addClass("active");
  }


  static deactivateMessagesBadge() {
    return $("#messagesBadge").text("").removeClass("active");
  }


  static showMobileLayout(activated = true) {

    let navElement = $('.nav-col');
    let mainContainer = $('.mainSectionContainer ');

    let currentSideMenuIsOpen = window.localStorage.getItem('keepSideMenuOpen');

    if (activated === true) {
      this.sideMenuBtn(true);
    }

    if (activated === false) {
      this.sideMenuBtn(false);
    }

    if (currentSideMenuIsOpen === 'true') {
      this.showSideMenu(true);
    }

    if (currentSideMenuIsOpen === 'false') {

      navElement.removeClass('active').removeClass('col-2');
      navElement.css('align-items', 'flex-end');
      mainContainer.removeClass('col-10');

    }


  }


  static showSideMenu(active) {

    let navElement = $('.nav-col');
    let mainContainer = $('.mainSectionContainer ');
    let _2ColClass = 'col-2';
    let _10ColClass = 'col-10';
    let activeClass = 'active';

    // When nav is active, make it inactive
    if (active &&
      !navElement.hasClass(activeClass) // if already active , do nothing about it    
    ) {
      navElement.fadeIn();
      navElement.addClass(activeClass).addClass(_2ColClass);
      mainContainer.addClass(_10ColClass);
      return;
    }

    if (active === false) {
      navElement.fadeOut();

      // Make main container full width
      navElement.removeClass(activeClass).removeClass(_2ColClass);
      mainContainer.removeClass(_10ColClass);
    }

  }

  static sideMenuBtn(active = true) {
    if (active)
      $('.floatingMenuButtonContainer').addClass('active');
    if (!active)
      $('.floatingMenuButtonContainer').removeClass('active');
  }

}






/*
      ==== showAlert CSS =====
*/


/*

:root {
    --global-alert-top-position: 2rem;
}
@import url("https://fonts.googleapis.com/css?family=Quicksand&display=swap");


.globalAlert * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.globalAlert h3 {
    color: #3b547af2;
}

.globalAlert {
    width: 50%;
    margin: var(--global-alert-top-position) 0 0;
    padding: 30px;
    position: absolute;
    left: 50vw;
    transform: translateX(-50%);
    border-radius: 5px;
    box-shadow: 0 0 7px 3px #ccc;
    z-index: 2000;
}

@media only screen and (max-width: 400px) {
    .globalAlert {
        width: 100%;
    }
}

.globalAlert .close {
    width: 30px;
    height: 30px;
    opacity: 0.5;
    border-width: 1px;
    border-style: solid;
    border-radius: 50%;

    position: absolute;
    right: 15px;
    top: 10px;

    text-align: center;
    font-size: 1.6em;
    cursor: pointer;
}

.default-alert {
    background-color: #ebebeb;
    border-left: 5px solid #6c6c6c;
}

.default-alert .close {
    border-color: #6c6c6c7c;
    color: #6c6c6c;
}

.success-alert {
    background-color: #91caec;
    border-left: 5px solid #1fa2f1;
}

.success-alert .close {
    border-color: #178344;
    color: #178344;
}

.danger-alert {
    background-color: #efb7b7fc;
    border-left: 5px solid #e2225e;
}

.danger-alert .close {
    border-color: #8f130c;
    color: #8f130c;
}

.warning-alert {
    background-color: #ffd48a;
    border-left: 5px solid #8a5700;
}

.warning-alert .close {
    border-color: #8a5700;
    color: #8a5700;
}

.globalAlert.slide-in {
    animation: slide-in 0.8s;
}

@keyframes slide-in {
    from {
        opacity: 0.2;
        top: -20vh;
    }

    to {
        opacity: 1;
        top: 0;
    }
}

.globalAlert.slide-out {
    animation: slide-out 0.3s forwards;
}

@keyframes slide-out {
    from {
        opacity: 1;
        top: 0;
    }

    to {
        opacity: 0.2;
        top: -20vh;
    }
}

*/

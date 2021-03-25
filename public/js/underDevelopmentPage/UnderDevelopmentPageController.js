/// <reference path="./../../../node_modules/@types/jquery/index.d.ts" />

const devPageContainer = $('.underDevelopmentPageContainer');

class UnderDevelopmentPageController {
  constructor() {
    if (devPageContainer.length === 0)
      throw Error(`.underDevelopmentPageContainer element doesn't exist in page!`);
    this.renderContentForUnderDevelopmentPage();
  }

  renderContentForUnderDevelopmentPage() {
    this.generateElement();
  }

  getRandomImage() {

    const numberOfPics = 6;
    const randomNumber = Math.ceil(Math.random() * numberOfPics);
    console.log('random number: ', randomNumber);

    return `https://my-profile-site-storage.sgp1.cdn.digitaloceanspaces.com/img/image/underDevPage/underConstruction${randomNumber}.jpg`;
  }

  getRandomEmoji() {
    const emojis = [
      "😁",
      "😏",
      "😐",
      "😯",
      "😜",
      "🤭",
    ];
    const randomNumber = Math.ceil(Math.random() * emojis.length) - 1;

    return emojis[randomNumber];
  }


  get visitsCounts() {
    let visitsCount = Number.parseInt(window.localStorage.getItem('visitsCount'));
    if (!visitsCount || visitsCount === 0) {
      window.localStorage.setItem('visitsCount', 1);
      return 1;
    }
    return visitsCount;
  }

  set visitsCounts(increment) {
    let visitsCount = Number.parseInt(window.localStorage.getItem('visitsCount'));
    if (!visitsCount) {
      visitsCount = 1;
    }
    window.localStorage.setItem('visitsCount', visitsCount + 1);
    return visitsCount;
  }

  generateElement() {
    let visitCounts = Number.parseInt(this.visitsCounts);
    let firstVisitMessage = "It's your first time visit this page";
    let notFirstTimeVisitMessage = `You have visited this page for ${visitCounts} times`;
    this.visitsCounts = this.visitsCounts + 1; // actually it's ++this.visitsCounts
    return devPageContainer.append(`
        <p class='developmentMessage emoji'> ${this.getRandomEmoji()} </p>
        <p class='developmentMessage'> This Page Is Temporary Unavailable </p>
        <img src="${this.getRandomImage()}" />
        <p class='timesOfVisit'>           
            ${visitCounts === 1 ? firstVisitMessage : notFirstTimeVisitMessage}
        </p>
    `);
  }


};

let controller = new UnderDevelopmentPageController();
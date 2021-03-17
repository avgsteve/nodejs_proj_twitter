
class SearchPageView {

  constructor() {

  }

  static showSearchPreloader(
    elementToShowReloader, preloaderText = 'default') {

    if (!elementToShowReloader) return;

    let textToRender = 'Refreshing page ...';

    if (preloaderText !== 'default' && typeof preloaderText === 'string')
      textToRender = preloaderText;

    let originalHTML = elementToShowReloader.html();
    // if (!element)

    // let preloader = `          
    //   <div class='search-box-spinner-container' 
    //   >
    //       <div class='spinner_loader' 
    //           style="
    //             width: 100%;
    //             display: flex;
    //             flex-direction: column;
    //             align-items: center;
    //             padding: 2rem;
    //             margin: 2rem 0 2rem;
    //           "
    //       >

    //           <div class="spinner-border text-center" role="status">
    //               <span class="sr-only">Loading...</span>
    //           </div>

    //           <p> ${textToRender} </p>  
    //       </div>
    //   </div>          
    //   `;

    let preloader = `     
        <div class="loader-container">    
            <div class="loader7 loader">
            </div>    
            <p> ${textToRender} </p>              
        </div>
    `;


    elementToShowReloader.html(preloader);
    return originalHTML;

  }



}



export default SearchPageView;
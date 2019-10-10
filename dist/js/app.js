import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {select, settings, classNames} from './settings.js';
import {Booking} from './components/Booking.js';

const app = {
  initMenu: function(){
    const thisApp = this;

    //console.log('thisApp.data: ', thisApp.data);
    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  init: function(){
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);
    thisApp.initPages();
    thisApp.initData();
    thisApp.initBooking();

  },
  initData: function(){
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;
    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });
  //  console.log('thisApp.data ', JSON.stringify(thisApp.data));
  },
  initCart: function(){
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },
  initPages: function(){
    const thisApp = this;
    thisApp.pages = Array.from(document.querySelector(select.containerOf.pages).children);

    thisApp.navLinks = Array.from(document.querySelectorAll(select.nav.links));

    let pagesMatchingHash = [];
    if(window.location.hash.length > 2){
      const idFromHash = window.location.hash.replace('#/','');
      pagesMatchingHash = thisApp.pages.filter(function(page){
        return page.id == idFromHash;

      });
      thisApp.activatePage(pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id);
    }
    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();
        //get page id from href
        const pageHref = clickedElement.getAttribute('href');
        //console.log('href ',pageHref);
        const pId = pageHref.replace('#', '');
        //console.log('pId ',pId);
        //activate page
        thisApp.activatePage(pId);
      });
    }
  },
  activatePage: function(pageId){
    const thisApp = this;
    for(let link of thisApp.navLinks){
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
      //console.log('click', link);
    }
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.getAttribute('id') ==  pageId);
      // to id to jest id z pętli wyżej pId
      //console.log('clack', page);
    }
    window.location.hash = '#/' + pageId;
    const activated = document.querySelector('.home-div');
    activated.classList.add('hidden');
  },
  initBooking: function(){
    const thisApp = this;
    const bookingWidget = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingWidget);
  }
};
app.init();
app.initCart();

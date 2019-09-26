import {Product} from './components/Product.js';
//import {AmountWidget} from './components/AmountWidget}.js';
import {Cart} from './components/Cart.js';
//import {CartProduct} from './components/CartProduct.js';
import {select, settings} from './settings.js';
//import {utils} from '../utils.js';

const app = {
  initMenu: function(){
    const thisApp = this;

    //console.log('thisApp.data: ', thisApp.data);
    for(let productData in thisApp.data.products){
      //new Product(productData, thisApp.data.products[productData]);
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

    thisApp.initData();
    //thisApp.initMenu();
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
        console.log('parsedResponse', parsedResponse);
        //save parsedResponse as thisApp.data.product
        thisApp.data.products = parsedResponse;
        console.log('tA.d.p ', thisApp.data.products);
        //execute initMenu method
        thisApp.initMenu();
      });
    console.log('thisApp.data ', JSON.stringify(thisApp.data));
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
};
app.init();
app.initCart();

import {select, settings, templates} from '../settings.js';
import {CartProduct} from './CartProduct.js';
import {utils} from '../utils.js';

export class Cart {
  constructor(element){
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
    //sums it up
    thisCart.deliveryFee = settings.cart.deliveryFee;
    //console.log('new Cart', thisCart);
  }
  getElements(element){
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    //console.log(thisCart.dom.toggleTrigger);
    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

    for(let key of thisCart.renderTotalsKeys){
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    }
  }
  initActions(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle('active');
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  add(menuProduct){
    const thisCart = this;
    console.log('adding product ', menuProduct);

    const generatedHTML = templates.cartProduct(menuProduct);
    thisCart.element = utils.createDOMFromHTML(generatedHTML);
    const cartContainer = thisCart.dom.productList;
    cartContainer.appendChild(thisCart.element);
    const generatedDOM = thisCart.element;
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    //console.log('thisCart.products', thisCart.products);
    thisCart.update();
  }
  update() {
    const thisCart = this;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    thisCart.deliveryFee = 0;
    if (thisCart.products.length > 0) {
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    }
    for (let product of thisCart.products) {
      thisCart.subtotalPrice = thisCart.subtotalPrice + product.price;
      thisCart.totalNumber = thisCart.totalNumber + parseInt(product.amount);
    }
    //const deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    console.log('T number ', thisCart.totalNumber);
    console.log('s price ', thisCart.subtotalPrice);
    console.log('T price ', thisCart.totalPrice);
    //console.log('D price ', settings.cart.defaultDeliveryFee);
    for (let key of thisCart.renderTotalsKeys) {
      for (let elem of thisCart.dom[key]) {
        elem.innerHTML = thisCart[key];
        console.log(elem, key, thisCart.dom[key]);
      }
    }
  }
  remove(cartProduct){
    const thisCart = this;
    const index = thisCart.products.indexOf('cartProduct');
    thisCart.products.splice(index, 1);
    cartProduct.dom.wrapper.remove();
    thisCart.update();
  }
  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for(let product of thisCart.products){
      payload.products.push(product.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
  }
}

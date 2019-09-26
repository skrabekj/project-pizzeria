import {AmountWidget} from './AmountWidget.js';
import {select} from '../settings.js';

export class CartProduct {
  constructor(menuProduct, element){
    const thisCartProduct = this;
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));
    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
    //console.log('new CartProduct ', thisCartProduct);

  }

  getElements(element){
    const thisCartProduct = this;
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
  }
  initAmountWidget(){
    const thisCartProduct = this;
    /*thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
    thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
      //console.log(thisCartProduct.price);
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });*/
    thisCartProduct.amountWidget = new AmountWidget(
      thisCartProduct.dom.amountWidget,
      thisCartProduct.amount
    );
  }
  remove(){
    const thisCartProduct = this;
    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });
    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }
  /*edit(){
    console.log('click');
    const thisCartProduct = this;

    const data = {name:thisCartProduct.name,
      price:thisCartProduct.price,
      params:thisCartProduct.params,
      label:thisCartProduct.params.label};
    const generatedHTML = templates.modal(data);
    console.log(generatedHTML);
    const modal = document.querySelector('#modal');
    modal.innerHTML = generatedHTML;

  }*/
  initActions(){
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function(event){
      event.preventDefault();
      thisCartProduct.edit();
    });
    thisCartProduct.dom.remove.addEventListener('click', function(event){
      event.preventDefault();
      thisCartProduct.remove();
      console.log('remove');
    });
  }
  getData(){
    const thisCartProduct = this;
    return thisCartProduct.id,
    thisCartProduct.amount,
    thisCartProduct.price,
    thisCartProduct.priceSingle,
    thisCartProduct.params;
  }
}

/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };
  class Product {
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      //console.log('new product: ', thisProduct);
    }

    renderInMenu(){
      const thisProduct = this;
      /*generate HTML based on template*/
      const generatedHTML = templates.menuProduct(thisProduct.data);
      //console.log(generatedHTML);
      /*create element using utils.createElementFromHTML*/
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /*find menu container*/
      const menuContainer = document.querySelector(select.containerOf.menu);
      /*add element to menu*/
      menuContainer.appendChild(thisProduct.element);
    }
    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }
    initAccordion(){
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      //const trigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      //console.log(trigger);
      /* START: click event listener to trigger */
      thisProduct.accordionTrigger.addEventListener('click', function(){
        //console.log('clicked');
        /* prevent default action for event */
        event.preventDefault();
        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.add('active');
        /* find all active products */
        const activeProducts = document.querySelectorAll('.product.active');
        /* START LOOP: for each active product */
        for(let activeProduct of activeProducts){
          /* START: if the active product isn't the element of thisProduct */
          if (activeProduct != thisProduct.element) {
            /* remove class active for the active product */
            activeProduct.classList.remove('active');
          /* END: if the active product isn't the element of thisProduct */
          }
        /* END LOOP: for each active product */
        }
        /* END: click event listener to trigger */
      });
    }
    initOrderForm(){
      const thisProduct = this;
      //console.log('initOrderForm');

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    processOrder(){
      const thisProduct = this;
      //console.log('processOrder');
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData: ', formData);
      /* set variable price to equal thisProduct.data.price */
      thisProduct.params = {};
      let price = thisProduct.data.price;
      /* START LOOP: for each paramId in thisProduct.data.params */
      for(let paramId in thisProduct.data.params){
        /* save the element in thisProduct.data.params with key paramId as const param */
        const param = thisProduct.data.params[paramId];
        //console.log('param: ', param);
        /* START LOOP: for each optionId in param.options */
        for(let optionId in param.options){
          /* save the element in param.options with key optionId as const option */
          const option = param.options[optionId];
          //console.log('option: ', option);
          /* START IF: if option is selected and option is not default */
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          if(optionSelected && !option.default){
          /* add price of option to variable price */
            price = price + option.price;

          /* END IF: if option is selected and option is not default */
          }
          /* START ELSE IF: if option is not selected and option is default */
          else if (!optionSelected && option.default){
            /* deduct price of option from price */
            price = price - option.price;

          /* END ELSE IF: if option is not selected and option is default */
          }
          const productImages = thisProduct.imageWrapper.querySelectorAll('img.' + paramId + '-' + optionId);
          //console.log('proimg ', productImages);
          if(optionSelected) {
            //const image = thisProduct.data.images;
            //console.log('img', image);
            //WTF
            if (!thisProduct.params[paramId]){
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }
            thisProduct.params[paramId].options[optionId] = option.label;
            //console.log(thisProduct.params);
            //WTF END
            for(let image of productImages){
              image.classList.add('active');
            }
          }
          else{
            for(let image of productImages){
              image.classList.remove('active');
            }
          }
          /* END LOOP: for each optionId in param.options */
        }
      /* END LOOP: for each paramId in thisProduct.data.params */
      }
      /* multiplay price by amount */
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = thisProduct.price;
      //console.log(thisProduct.priceElem);
    }
    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }
    addToCart(){
      const thisProduct = this;
      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;
      app.cart.add(thisProduct);
    }
  }

  class AmountWidget {
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.initActions();
      thisWidget.announce();

      //console.log('AmountWidget: ', thisWidget);
      //console.log('constructor arguments: ', element);
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    /*setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);
      //console.log('cval ', thisWidget.value);
      //console.log('mval ', settings.amountWidget.defaultMin);
      /* Add validation*/
    /*if(newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
        thisWidget.value = newValue;
        //console.log('nval ', thisWidget.value);
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;
    }*/

    set value(value){
      const thisWidget = this;
      const newValue = parseInt(value);

      if(newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
        thisWidget.input.value = value;
        thisWidget.announce();
      }
    }
    get value(){
      return this.input.value;
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function() {thisWidget.value = thisWidget.input.value;});
      thisWidget.linkDecrease.addEventListener('click', function() {thisWidget.value = thisWidget.input.value - 1;});
      thisWidget.linkIncrease.addEventListener('click', function() {
        const inputValue = parseInt(thisWidget.input.value);
        thisWidget.value = inputValue + 1; });
    }
    announce(){
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }
  class Cart {
    constructor(element){
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
      console.log('new Cart', thisCart);
    }
    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      console.log(thisCart.dom.toggleTrigger);
    }
    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        event.preventDefault();
        thisCart.dom.wrapper.classList.add('active');
      });
    }
    add(menuProduct){
      const thisCart = this;
      console.log('adding product ', menuProduct);

      const generatedHTML = templates.cartProduct(menuProduct);
      thisCart.element = utils.createDOMFromHTML(generatedHTML);
      const cartContainer = thisCart.dom.productList;
      cartContainer.appendChild(thisCart.element);

    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;

      //console.log('thisApp.data: ', thisApp.data);
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
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
      thisApp.initMenu();
    },
    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },
    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
  };
  app.init();
  app.initCart();

}

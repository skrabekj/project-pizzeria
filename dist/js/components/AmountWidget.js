import {select, settings} from '../settings.js';
import {BaseWidget} from './BaseWidget.js';

export class AmountWidget extends BaseWidget {
  constructor(wrapper, value = settings.amountWidget.defaultValue) {
    super(wrapper, settings.amountWidget.defaultValue);
    const thisWidget = this;
    thisWidget.getElements(/*element*/);
    thisWidget.value = value;
    thisWidget.initActions();
    //thisWidget.announce();

    //console.log('AmountWidget: ', thisWidget);
    //console.log('constructor arguments: ', element);
  }

  getElements(/*element*/){
    const thisWidget = this;

    //thisWidget.element = element;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
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

  /*set value(value){
    const thisWidget = this;
    const newValue = parseInt(value);

    if(newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
      thisWidget.input.value = value;
      thisWidget.announce();
    }
  }*/
  isValid(newValue){
    return !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax;
  }
  get value(){
    return this.input.value;
  }

  initActions(){
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function() {thisWidget.value = thisWidget.dom.input.value;});
    thisWidget.dom.linkDecrease.addEventListener('click', function() {thisWidget.value = thisWidget.dom.input.value - 1;});
    thisWidget.dom.linkIncrease.addEventListener('click', function() {
      const inputValue = parseInt(thisWidget.dom.input.value);
      thisWidget.value = inputValue + 1; });
  }
  renderValue(){
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }
  /*announce(){
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }*/
}

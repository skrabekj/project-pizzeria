import {select, settings} from '../settings.js';
import {BaseWidget} from './BaseWidget.js';

export class AmountWidget extends BaseWidget {
  constructor(wrapper, value = settings.amountWidget.defaultValue) {
    super(wrapper, settings.amountWidget.defaultValue);
    const thisWidget = this;
    thisWidget.getElements();
    thisWidget.value = value;
    thisWidget.initActions();

    //console.log('AmountWidget: ', thisWidget);
    //console.log('constructor arguments: ', element);
  }

  getElements(){
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(newValue){
    return !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax;
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

}

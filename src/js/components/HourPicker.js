
import {BaseWidget} from './BaseWidget.js';
import {utils} from '../utils.js';
import {select, settings} from '../settings.js';

export class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.hours.open);
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisWidget.dom.output  = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.output);
    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input.value;
  }
  initPlugin() {
    const thisWidget = this;
    rangeSlider.create(thisWidget.dom.input);
    thisWidget.dom.input.addEventListener('input', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });
  }
  parseValue(value){
    return utils.numberToHour(value);
  }
  isValid(){
    event.preventDefault();
    return true;
  }
  renderValue(){
    const thisWidget = this;
    //thisWidget.value = thisWidget.dom.input.value;
    thisWidget.dom.output = thisWidget.value;

  }
}

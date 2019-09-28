import {templates, select} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';

export class Booking {
  constructor(bookingWidget){
    const thisBooking = this;
    thisBooking.render(bookingWidget);
    thisBooking.initWidgets();

  }
  render(bookingWidget){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    console.log(generatedHTML);
    thisBooking.dom = {};
    console.log(thisBooking.dom);
    thisBooking.dom.wrapper = bookingWidget;
    console.log(thisBooking.dom.wrapper);
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    console.log(thisBooking.dom.wrapper.innerHTML);
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    console.log(thisBooking.dom.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    console.log(thisBooking.dom.hoursAmount);
  }
  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

  }
}

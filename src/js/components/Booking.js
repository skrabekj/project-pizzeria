import {templates, select, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';
import {DatePicker} from './DatePicker.js';
import {HourPicker} from './HourPicker.js';

export class Booking {
  constructor(bookingWidget){
    const thisBooking = this;
    thisBooking.render(bookingWidget);
    thisBooking.initWidgets();
    thisBooking.getData();
    //thisBooking.tableSelector();
  }
  render(bookingWidget){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    //console.log(generatedHTML);
    thisBooking.dom = {};
    //console.log(thisBooking.dom);
    thisBooking.dom.wrapper = bookingWidget;
    //console.log(thisBooking.dom.wrapper);
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    //console.log(thisBooking.dom.wrapper.innerHTML);
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    //console.log(thisBooking.dom.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    //console.log(thisBooking.dom.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    thisBooking.dom.formSubmitButton = thisBooking.dom.wrapper.querySelector(select.booking.formSubmit);
  }
  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

  }
  getData(){
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };

    console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
        thisBooking.tableSelector();
        thisBooking.starterSlector();
      });
    thisBooking.dom.formSubmitButton.addEventListener('click', function(){
      event.preventDefault();
      thisBooking.eventSender();
    });

  }
  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;
    thisBooking.booked = {};
    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;
    //console.log(date, hour, duration, table);
    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if(!thisBooking.booked[date][hourBlock]){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
    //console.log(thisBooking.booked);
  }
  updateDOM(){
    //console.log('uDom');
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    for(let table of thisBooking.dom.tables){
      //console.log(parseInt(table.getAttribute('data-table')));
      //console.log(thisBooking.booked[thisBooking.date], thisBooking.booked[thisBooking.date][thisBooking.hour], console.log(thisBooking.booked[thisBooking.date][thisBooking.hour].indexOf(table)) );
      if(thisBooking.booked[thisBooking.date]  &&
      thisBooking.booked[thisBooking.date][thisBooking.hour]  &&
      thisBooking.booked[thisBooking.date][thisBooking.hour].indexOf(parseInt(table.getAttribute('data-table'))) !== -1){
        table.classList.add(classNames.booking.tableBooked);
      }else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }
  tableSelector(){
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    for(let table of thisBooking.dom.tables){
      table.addEventListener('click', function() {
        if (!table.classList.contains(classNames.booking.tableBooked)){
          table.classList.toggle('active');
          thisBooking.newDate = thisBooking.date;
          thisBooking.newHour = thisBooking.hour;
        }
        if(thisBooking.newDate != thisBooking.date || thisBooking.newHour != thisBooking.hour){
          table.classList.remove('active');
        }
        if(table.classList.contains('active')) {
          thisBooking.selectedTable = table.getAttribute('data-table');
          /*table.data = table.getAttribute('data-table');
          console.log('table-data',table.data);*/
        }
      });
    }
  }
  starterSlector(){
    const thisBooking = this;
    thisBooking.selectetStarters = [];
    for (let starter of thisBooking.dom.starters) {
      starter.addEventListener('change', function() {
        if(starter.checked){
          thisBooking.selectetStarters.push(starter.value);
          console.log(starter.value);
        } else {
          thisBooking.selectetStarters.splice(thisBooking.starters.indexOf(starter.value, 1));
        }
      });
      console.log(thisBooking.selectetStarters);
    }

  }
  eventSender(){

    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;
    const hAmount = thisBooking.dom.hoursAmount.querySelector('input').value;
    const pAmount = thisBooking.dom.peopleAmount.querySelector('input').value;

    const payload =  {
      date: thisBooking.date,
      hour: thisBooking.hour,
      table:   thisBooking.selectedTable,
      repeat: false,
      duration: hAmount,
      ppl: pAmount,
      starters: thisBooking.selectetStarters,
    };

    console.log(payload);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    /*fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });*/
  }
}

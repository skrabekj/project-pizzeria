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
  updateData(){
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
        //thisBooking.tableSelector();
        //thisBooking.starterSlector();
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
      console.log(item.table);

      for (let table of item.table) {
        thisBooking.makeBooked(item.date, item.hour, item.duration, table);
      }
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
    const thisBooking = this;
    const newDate = thisBooking.datePicker.value;
    const newHour = utils.hourToNumber(thisBooking.hourPicker.value);

    if (thisBooking.date !== newDate || thisBooking.hour !== newHour) {
      for (let table of thisBooking.dom.tables) {
        table.classList.remove('active');
      }
    }
    thisBooking.date = newDate;
    thisBooking.hour = newHour;
    //console.log('uDom');
    thisBooking.date = thisBooking.datePicker.value;
    //console.log(thisBooking.datePicker.value);
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    //console.log(thisBooking.hourPicker.value);
    //console.log(thisBooking.hour);
    for(let table of thisBooking.dom.tables){
      if(thisBooking.booked[thisBooking.date]  &&
      thisBooking.booked[thisBooking.date][thisBooking.hour]  &&
      thisBooking.booked[thisBooking.date][thisBooking.hour].indexOf(parseInt(table.getAttribute('data-table'))) !== -1){
        table.classList.add(classNames.booking.tableBooked);
      }else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
    //console.log('date', thisBooking.booked[thisBooking.date]);
    //console.log('datehouer',thisBooking.booked[thisBooking.date][thisBooking.hour]);
  }
  tableSelector(){
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    thisBooking.selectedTableArray = [];

    for(let table of thisBooking.dom.tables){
      table.addEventListener('click', function() {
        console.log('click');
        if (!table.classList.contains(classNames.booking.tableBooked)){
          table.classList.toggle('active');
          thisBooking.newDate = thisBooking.date;
          thisBooking.newHour = thisBooking.hour;
        }
        if(table.classList.contains('active')) {
          thisBooking.selectedTable = table.getAttribute('data-table');
          //console.log('TS', thisBooking.selectedTable);
          thisBooking.selectedTableArray.push(thisBooking.selectedTable);
          console.log('array', thisBooking.selectedTableArray);
        }
        else{
          thisBooking.selectedTableArray = thisBooking.selectedTableArray.filter(function(item) {
            return item != table.getAttribute('data-table');
          });
          console.log('array', thisBooking.selectedTableArray);
          //console.log('array', thisBooking.selectedTableArray.value);
        }
      });
    }
  }


  starterSlector(){
    const thisBooking = this;
    thisBooking.selectedStarters = [];
    for (let starter of thisBooking.dom.starters) {
      starter.addEventListener('change', function() {
        if(starter.checked){
          thisBooking.selectedStarters.push(starter.value);
          console.log(starter.value);
        } else {
          thisBooking.selectedStarters.splice(thisBooking.starters.indexOf(starter.value, 1));
        }
      });
    }

  }
  eventSender(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;
    const hAmount = thisBooking.dom.hoursAmount.querySelector('input').value;
    const pAmount = thisBooking.dom.peopleAmount.querySelector('input').value;

    const payload =  {
      date: thisBooking.date,
      hour: utils.numberToHour(thisBooking.hour),
      table: thisBooking.selectedTableArray.map(function(item) {
        return parseInt(item);
      }),
      repeat: false,
      duration: parseInt(hAmount),
      ppl: pAmount,
      starters: thisBooking.selectedStarters,
    };

    console.log(payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response) {
        return response.json();
      })
      .then(function(parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      })
      .then(function() {
        for (let table of thisBooking.dom.tables) {
          if (table.classList.contains('active')) {
            table.classList.add(classNames.booking.tableBooked);
            table.classList.remove('active');
          }
        }
        thisBooking.updateData();
      });
  }
}

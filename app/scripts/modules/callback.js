/* global luxon, Swal */

// Callbacks App
import { API } from "../modules/api.js"
var DateTime = luxon.DateTime;

// Private vars
var Callbacks = {};

Callbacks.callbacks = [];
Callbacks.loaded = false;

Callbacks.get = function(){
    if(!Callbacks.loaded){
        Callbacks.load();
    }
    return Callbacks.callbacks;
};

Callbacks.load = function(){
    var cb;
    API.userAPI("READ", ["callbacks"],
        function(data){
            data.forEach(
                callback => {
                    Callbacks.callbacks.push(
                        new Callback(
                            callback.name, 
                            callback.phone, 
                            Callbacks.getDateTime(callback.dateTime), 
                            callback.remind
                        )
                    );
                });
        });
    return cb;
};

Callbacks.push = function(callback, success){
    API.userAPI("PUSH", ["callback", JSON.stringify(callback)], success);
    Callbacks.loaded = false;
};

Callbacks.remove = function(callback, success){
    API.userAPI("REMOVE", ["callback", JSON.stringify(callback)], success);
    Callbacks.loaded = false;
};

Callbacks.overwrite = function(callback, success){
    API.userAPI("WRITE", ["callback", JSON.stringify(callback)], success);
    Callbacks.loaded = false;
};

Callbacks.addFromCustomer = function(customerObj, dateTime){
    var customer = customerObj.values;
    var callback = new Callback(customer.name, customer.phone);
    Callbacks.push(callback);
};

Callbacks.getDateTime = function(dateTimeString){
    var dateTimeFormat = "MM/dd/yyyy hh:mm a";
    return DateTime.fromFormat(dateTimeString, dateTimeFormat);
};

function Callback(name, phone, dateTime, remind){
    
    this.name = name;
    this.phone = phone;
    this.dateTime = dateTime;
    this.remind = remind|5;
    this.alerted = false;
    this.reminded = false;
    this.snoozed = false;
    
    this.alert = () => {
        Swal.fire({
            title: "Callback Scheduled",
            icon: "info",
            html: `A call was scheduled for <strong>${this.name}</strong> at <strong><em>${this.dateTime.toLocaleString(DateTime.TIME_SIMPLE)}</em></strong> on ${this.dateTime.toLocaleString(DateTime.DATE_SHORT)}. Callback number is <h2 style="font-family:'Roboto',sans-serif">${this.phone}</h2>`
        });
        this.alerted = true;
    };
    
    this.remind = () => {
        this.reminded = true;
    };
    
    this.snooze = () => {
        this.snoozed = true;
    };
    
}

export { Callbacks, Callback };
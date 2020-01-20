/* global $, luxon, Swal */

// Callbacks App
import { API } from "../modules/api.js"
var DateTime = luxon.DateTime;

// Private vars
var Callbacks = {};

Callbacks.callbacks = [];
Callbacks.loaded = false;

Callbacks.clock = null;

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
                            callback.dateTime, 
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

Callbacks.startClock = function(){
    if(!Callbacks.clock)
        Callbacks.clock = setTimeout(()=>{
            
            var dateTime = DateTime.local();
            
            Callbacks.get().forEach(callback => {
                
                if(!callback.alerted){
                    if(callback.dateTime >= dateTime)
                        callback.alert();
                }
                
                if(!callback.reminded){
                    if(callback.remindDateTime >= dateTime)
                        callback.remind();
                }
            });
            
        }, 1000);
    else console.warn("Callbacks clock is already running!");
}

Callbacks.createFromJSON = function(json){
    return new Callback(json.name, json.phone, DateTime.fromISO(json.dateTime), json.remind);
}

// Callback object with built in alerts
function Callback(name, phone, dateTime, remind){
    
    this.name = name;
    this.phone = phone;
    this.dateTime = dateTime;
    this.remind = remind|5;
    this.remindDateTime = dateTime.minus({minutes: this.remind});
    this.alerted = false;
    this.reminded = false;
    this.snoozed = false;
    
    this.alert = () => {
        var snoozeSelect = $("<select id='snoozeselect'>");
        var options = [
                {
                    value: 5,
                    label: "5 Minutes"
                },
                {
                    value: 10,
                    label: "10 Minutes"
                },
                {
                    value: 15,
                    label: "15 Minutes"
                },
                {
                    value: 30,
                    label: "30 Minutes"
                },
                {
                    value: 60,
                    label: "1 Hour"
                },
                {
                    value: 1440,
                    label: "1 Day"
                }
            ];
            
        options.forEach(option => snoozeSelect.append(`<option value=${option.value}>${option.label}</option>`));
        
        Swal.fire({
            title: "Callback Scheduled",
            icon: "info",
            html: `A call was scheduled for <strong>${this.name}</strong> at <strong><em>${this.dateTime.toLocaleString(DateTime.TIME_SIMPLE)}</em></strong> on ${this.dateTime.toLocaleString(DateTime.DATE_SHORT)}. Callback number is <h2 style="font-family:'Roboto',sans-serif">${this.phone}</h2> <div><strong>Snooze: </strong>${snoozeSelect[0].outerHTML}</div>`,
            cancelButtonText: "Snooze",
            showCancelButton: true
        }).then((result)=>{
            if(result.dismiss=="cancel"){
                this.snooze($("#snoozeselect option:selected"));
            }else this.alerted=true;
        });
    };
    
    this.remind = () => {
        Swal.fire({
            icon: "info",
            html: `<strong>Upcoming Callback</strong> for <em>${this.name}</em>. <strong>${this.phone}</strong>`,
            toast: true,
            position: "bottom-end"
        });
        this.reminded = true;
    };
    
    this.snooze = (snoozeOption) => {
        Swal.fire({
            icon: "info",
            html: `<strong>Snoozed Callback</strong> for <em>${this.name}</em> for ${snoozeOption.text()}`,
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 2500
        });
        
        var newDateTime = dateTime.plus({minutes: parseInt(snoozeOption.val())});
        
        this.dateTime = newDateTime;
        this.alerted = false;
    };
}

export { Callbacks, Callback };
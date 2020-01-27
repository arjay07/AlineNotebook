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
    var cb=[];
    API.userAPI("READ", ["callbacks"],
        function(data){
            data.forEach(
                callback => {
                    cb.push(
                        Callbacks.createFromJSON(callback)
                    );
                });
            Callbacks.loaded = true;
        }, false);
    Callbacks.callbacks = cb;
    return cb;
};

Callbacks.save = function(){
    API.userAPI("WRITE", ["callbacks", JSON.stringify(Callbacks.get())], false)
}

Callbacks.push = function(callback, success){
    API.userAPI("PUSH", ["callbacks", JSON.stringify(callback)], success);
    Callbacks.loaded = false;
};

Callbacks.remove = function(callback, success){
    API.userAPI("REMOVE", ["callbacks", JSON.stringify(callback.getSimple())], success);
    Callbacks.loaded = false;
};

Callbacks.overwrite = function(callbacks, success){
    API.userAPI("WRITE", ["callbacks", JSON.stringify(callbacks)], success);
    Callbacks.loaded = false;
};

Callbacks.addFromCustomer = function(customerObj, dateTime, remind, saveNotes){
    var customer = customerObj.values;
    var callback = new Callback(customer.name, customer.phone, dateTime, remind);
    if(saveNotes){
        callback.notes = [];
        callback.notes = callback.notes.concat(customer);
        customerObj.notes.forEach(note => {
            callback.notes.push(note.values);
        })
    }
    Callbacks.push(callback);
};

Callbacks.getDateTime = function(dateTimeString){
    var dateTimeFormat = "MM/dd/yyyy hh:mm a";
    return DateTime.fromFormat(dateTimeString, dateTimeFormat);
};

Callbacks.startClock = function(){
    if(Callbacks.clock===null){
    
        console.log("Callbacks clock started...");
        Callbacks.clock = setInterval(function(){
            
            var dateTime = DateTime.local();
            
            Callbacks.get().forEach(callback => {
                
                if(!callback.alerted){
                    if(dateTime >= callback.dateTime)
                        callback.alert();
                }
                if(!callback.reminded){
                    if(dateTime >= callback.remindDateTime)
                        callback.remind();
                }
            });
        }, 1000);
    }else console.warn("Callbacks clock is already running!");
}

Callbacks.createFromJSON = function(json){
    return new Callback(
        json.name, 
        json.phone, 
        DateTime.fromISO(json.dateTime), 
        parseInt(json.remind), 
        json.notes, 
        json.alerted, 
        json.reminded, 
        json.snoozed, 
        json.status);
}

// Callback object with built in alerts
function Callback(name, phone, dateTime, remind, notes, alerted, reminded, snoozed, status){
    
    this.name = name;
    this.phone = phone;
    this.dateTime = dateTime;
    this.remind = remind||5;
    this.remindDateTime = dateTime.minus({minutes: this.remind});
    this.alerted = alerted||false;
    this.reminded = reminded||false;
    this.snoozed = snoozed||false;
    this.status = status||"upcoming";
    this.notes = [];
    
    if(notes){
        notes.forEach(note => {
            for(var property in note){
                var value = {};
                value.id = property;
                value.value = note[property];
                if(note.type)value.parent = note.type
                this.notes.push(value);
            }
        });
    }
    
    this.alert = () => {
        
        this.status = "alerted";
        this.alerted = true;
        Callbacks.save();
        
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
                this.alerted = false;
                this.snooze($("#snoozeselect option:selected"));
                Callbacks.save();
            }
        });
    };
    
    this.remind = () => {
        
        this.reminded = true;
        this.status = "upcoming";
        
        Callbacks.save();
        
        Swal.fire({
            icon: "info",
            html: `<strong>Upcoming Callback</strong> for <em>${this.name}</em>. <strong>${this.phone}</strong>`,
            toast: true,
            position: "bottom-end"
        });
    };
    
    this.snooze = (snoozeOption) => {
        
        var newDateTime = dateTime.plus({minutes: parseInt(snoozeOption.val())});
        
        this.dateTime = newDateTime;
        this.alerted = false;
        this.status = "snoozed";
        
        Callbacks.save();
        
        Swal.fire({
            icon: "info",
            html: `<strong>Snoozed Callback</strong> for <em>${this.name}</em> for ${snoozeOption.text()}`,
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 2500
        });
    };
    
    this.getSimple = () => {
        return {
            name: this.name, 
            phone: this.phone, 
            dateTime: this.dateTime, 
            remind: this.remind
        };
    };
}

export { Callbacks, Callback };
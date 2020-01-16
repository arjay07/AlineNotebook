/* global luxon */

// Bind Log

import { API } from "./api.js"
const DateTime = luxon.DateTime;

var BindLog = {};

BindLog.loaded = false;

BindLog.get = () => {
    if(!BindLog.loaded){
        BindLog.load();
    }
    return BindLog.bindlog;
};

BindLog.load = () => {
    var bl;
    API.userAPI("READ", ["bindlog"], function(data){
        bl = data;
        BindLog.bindlog = data;
        BindLog.loaded = true;
    }, false);
    return bl;
}

BindLog.push = (bind, callback) => {
    API.userAPI("PUSH", ["bindlog", JSON.stringify(bind)], callback);
    BindLog.loaded = false;
}

BindLog.remove = (bind, callback) => {
    API.userAPI("REMOVE", ["bindlog", JSON.stringify(bind)], callback);
    BindLog.loaded = false;
}

BindLog.overwrite = (bindlog, callback) => {
    API.userAPI("WRITE", ["bindlog", JSON.stringify(bindlog)], callback);
    BindLog.loaded = false;
}

BindLog.items = (bindlog) => {
    if(bindlog===undefined)bindlog = BindLog.get();
    var items = 0;
    bindlog.forEach(
        bind => {
            items+=parseInt(bind.items);
        })
    return items;
}

BindLog.filter = filter => {
    var bindlog = BindLog.get();
    var filteredBindLog = [];
    var currentDate = DateTime.local();
    var dateFormat = {month:"2-digit", day:"2-digit", year: "numeric"};
    if(typeof filter !== 'function'){
        switch(filter){
            case "MTD":
                filter = function(bind){
                    var bindDate = DateTime.fromFormat(bind.date, "MM/dd/yyyy");
                    return bindDate.month == currentDate.month;
                }
                break;
            case "LAST_MONTH":
                filter = function(bind){
                    var bindDate = DateTime.fromFormat(bind.date, "MM/dd/yyyy");
                    return bindDate.month == currentDate.minus({months: 1}).month;
                }
                break;
            case "LAST_7_DAYS":
                filter = function(bind){
                    var bindDate = DateTime.fromFormat(bind.date, "MM/dd/yyyy");
                    return bindDate>=currentDate.minus({days: 7})&&bindDate<=currentDate;
                }
                break;
            case "TODAY":
                filter = function(bind){
                    var currentDateString = currentDate.toLocaleString(dateFormat);
                    return bind.date == currentDateString;
                }
                break;
            case "ALL":
                filter = function(bind){return true;}
                break;
        }
    }
    
    bindlog.forEach(
        function(bind){
            if(filter(bind))filteredBindLog.push(bind);
        });
    
    return filteredBindLog;
}

BindLog.bundles = (bindlog) => {
    if(bindlog===undefined)bindlog = BindLog.load();
    var bindsPerCustomer = {};
    var bundles = 0;
    bindlog.forEach(
        bind => {
            var x = bind.date.replace(/\//g, "")+(bind.name.replace(/[\W_]+/g,"").toLowerCase());
            bindsPerCustomer[x] = (bindsPerCustomer[x]||0)+1;
        })
    for(var key in bindsPerCustomer){
        if(bindsPerCustomer[key]>1){
            bundles++;
        }
    }
    return bundles;
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

BindLog.addFromCustomer = (customer, onsuccess,onerror) => {
    var notes = customer.notes;
    
    notes.forEach(
        noteData => {
            var note = noteData.values;
            var bind = new Bind(
                customer.values.name, 
                note.controlnumber, 
                note.quotedprice,
                note.vehicles,
                note.policynumber,
                note.refnumber);
                
            var validate = bind.validate();
            
            if(validate.valid){
                if(typeof onsuccess === "function")onsuccess();
                BindLog.push(bind);
            }
            else{
                if(typeof onerror === "function")onerror(validate.invalidProperties);
            }
        });
}

function Bind(name, controlnumber, premium, items, policynumber, referencenumber){
    
    this.date = DateTime.local().toLocaleString({month:"2-digit", day:"2-digit", year:"numeric"});
    this.name = name;
    this.controlnumber = controlnumber;
    this.premium = premium;
    this.items = items?items:1;
    this.policynumber = policynumber;
    this.referencenumber = referencenumber;
    
    this.validate = () => {
        var invalidProperties = [];
        
        for(var key in this){
            if(this[key]===undefined || this[key] === null){
                invalidProperties.push(key);
            }
        }
        if(invalidProperties.length === 0){
            return {valid: true}
        }else{
            return {valid: false, invalidProperties: invalidProperties}
        }
    }
    
}

export {BindLog, Bind}
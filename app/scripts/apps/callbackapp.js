/*global $, luxon, Swal*/

// Callback App

import { Modal } from "../modules/modal.js";
import { Callbacks, Callback } from "../modules/callback.js";
import { Note } from "../modules/note.js"
import { views } from "../modules/views.js"
const DateTime = luxon.DateTime;

const dateFormat = {month: "2-digit", day: "2-digit", year: "numeric"};

const CallbackApp = {};

CallbackApp.open = function(){
    CallbackApp.dialog = new Modal("Callbacks", {
        content: [CallbackApp.constructCallbackList()]
    }).show();
};

CallbackApp.close = function(){
    CallbackApp.dialog.close();
}

CallbackApp.constructCallbackList = function(){
    
    var view = $("<div class='callbacklist'></div>");
    
    var callbacks = Callbacks.get();
    
    callbacks.sort((a, b)=>a.dateTime-b.dateTime);
    
    callbacks.forEach(callback => {
        addCallbackCard(view, callback);
    });
    
    return view;
    
};

function addCallbackCard(view, callback){
    
    var callbackDate = callback.dateTime.toLocaleString(DateTime.DATE_SHORT);
    var callbackTime = callback.dateTime.toLocaleString(DateTime.TIME_SIMPLE);
    
    var callbackCard = $("<div class='callbackcard'></div>");
    var labelNumber = $(`<div class="callbacknumber">${callback.phone}</div>`);
    var labelName = $(`<div class="callbackname">${callback.name}</div>`);
    var labelDate = $(`<div class="callbackdate">${callbackDate}</div>`);
    var labelTime = $(`<div class="callbacktime">${callbackTime}</div>`);
    var viewNote = $(`<div class="btn viewnote">Open Note <i class="fas fa-sticky-note"></i></div>`);
    var status = $(`<i class="callbackstatus"></i>`);
    var deleteBtn = $(`<div class="btn deletecallback"><i class="fas fa-trash-alt"></i></div>`)
    var icon = "fas fa-bell";
    
    switch(callback.status){
        case "upcoming":
            icon = "fas fa-bell";
            break;
        
        case "snoozed":
            icon = "far fa-bell";
            break;
            
        case "alerted":
            icon = "fas fa-bell-slash";
            break;
    }
    status.addClass(icon);
    status.attr("title", callback.status.replace(/^\w/, c => c.toUpperCase()));
    status.tooltipster({
        theme: "tooltipster-light"
    });
    
    callbackCard.append(
        labelNumber,
        labelName,
        labelDate,
        labelTime,
        deleteBtn,
        status
    );
    
    deleteBtn.click(function(){
        Swal.fire({
            title: "Delete Callback?",
            text: "This cannot be undone. You are deleting the callback and all notes associated with it.",
            showCancelButton: true,
            cancelButtonColor: "#a70000",
            icon: "warning"
        }).then(result => {
            if(result.value){
                Callbacks.remove(callback);
                callbackCard.remove();
            }
        });
    });
    
    if(callback.notes)
        if(callback.notes.length>0){
            viewNote.click(function(){
                // console.log(callback.notes);
                var values = Callbacks.convertToValues(callback.notes);
                views.loadValues(values);
                CallbackApp.close();
            });
            callbackCard.append(viewNote);
        }
    
    view.append(callbackCard);
}

CallbackApp.ScheduleCallback = {};

CallbackApp.ScheduleCallback.open = () => {
    var dialog = new Modal("Schedule Callback", {
        style: {
            maxWidth: 300,
            height: "auto",
            padding: 10,
            borderRadius: 8
        }
    });
    
    dialog.loadIntoContent("/views/callbackscheduler.html", ()=>{
        
        // Must call dialog.show before accessing elements
        dialog.show();
        
        var name = $("#schedulername");
        var phone = $("#schedulerphone");
        var date = $("#schedulerdate");
        var time = $("#schedulertime");
        var remind = $("#schedulerremind");
        var savenote = $("#schedulersavenote");
        var create = $("#schedulercreate");
        
        name.val($("[data-id='name']").val());
        phone.val($("[data-id='phone']").val());
        
        phone.blur(function(){
            phone.val(formatPhoneNumber(phone.val()));
        });
        
        time.val(DateTime.local().plus({minutes: 30}).toLocaleString(DateTime.TIME_SIMPLE));
        time.timepicker({
            timeFormat: "h:i A"
        });
        
        date.val(DateTime.local().toLocaleString(dateFormat));
        date.datepicker();
        
        create.click(function(){
            var notes = [];
            Note.getActiveNotes().forEach(e => { notes.push(new Note(e).gatherInfo()); });
    
            var customer = new Note.Customer(notes).gatherInfo();
            
            var canCreate = false;
            
            if(customer.values.name && customer.values.phone){
            
                Callbacks.addFromCustomer(
                    customer, 
                    Callbacks.getDateTime(date.val() + " " + time.val()), 
                    parseInt(remind.val()),
                    savenote.is(":checked"));
                    canCreate = true;
            }else{
                if(name.val()!="" && phone.val() != ""){
                    Callbacks.push(new Callback(name.val(), phone.val(), Callbacks.getDateTime(date.val() + " " + time.val()), parseInt(remind.val())));
                    canCreate = true;
                }
            } 
            
            if(canCreate){
                Swal.fire({
                    html: `Scheduled callback for <strong>${name.val()}</strong>`,
                    showConfirmButton: false,
                    icon: "success",
                    timer: 2500,
                    toast: true,
                    position: "top",
                    showClass: {
                        popup: 'animated fadeInDown faster'
                    },
                    hideClass: {
                        popup: 'animated fadeOutUp faster'
                    }
                });
                
                if(Callbacks.clock===null)Callbacks.startClock();
                
                dialog.close();
            
            }else{
                Swal.fire({
                    text: "Unable to create callback. Please check name or phone number.",
                    icon: "error"
                });
            }
        });
        
    });
};

function formatPhoneNumber(phoneNumberString) {
    var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
    var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3]
    }
    return phoneNumberString
}

export { CallbackApp };
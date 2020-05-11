/* global $, swal */

import {views} from "./views.js"
import {API} from "./api.js"
import {Modal} from "./modal.js"
import {BindLog, Bind} from "./bindlog.js" 
import { Apps } from "../apps/apps.js"

const func = {};

// Vehicles
func.updateVehicles = () => {
    
}

// Toggles Drawer
func.toggleDrawer = () => {
    var drawer=$(".drawer");
    var bars=$(".fa-bars");
    if(drawer.hasClass("hidden")){
        animateCSS(".drawer", "slideInLeft");
        bars.css("margin-left", "-7px");
        drawer.removeClass("hidden");
    }else{
        bars.css("margin-left", "-2px");
        animateCSS(".drawer", "slideOutLeft", function(){
            drawer.addClass("hidden");
        });
    }
};

func.hideDrawer = () => {
    var drawer=$(".drawer");
    var bars=$(".fa-bars");
    
    if(!drawer.hasClass("hidden")){
        bars.css("margin-left", "-2px");
        animateCSS(".drawer", "slideOutLeft", function(){
            drawer.addClass("hidden");
        }); 
    }
};

// Toast Message
func.toastMessage = (msg, length) => {
    var toast = $("<div></div>");
    toast.text(msg);
    toast.addClass("toast faster");

    var toastLength = length ? length : 2500;

    $(document.body).append(toast);


    animateCSS(".toast", "fadeInDown");

    setTimeout(()=>{
        animateCSS(".toast", "fadeOutUp", function () {
            toast.remove();
        });
    }, toastLength);

};

func.copyText = value => {
    var tempInput = document.createElement("textarea");
    tempInput.style = "position: absolute; left: -1000px; top: -1000px";
    tempInput.value = value;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
}

func.openApp = (appName) => {
    Apps.open(appName);
}

func.openModal = (modal) =>{
    switch(modal){
        case "settings":
            API.getSession(
                function(data){
                    func.hideDrawer();
                    if(data.loggedin)API.userAPI("READ", ["settings"], function(data){
                        views.openSettings(data);
                    });
                    else views.openLoginDialog();
                });
            break;
    }
}

func.login = () => {
    views.openLoginDialog();
}

func.init = () => window.func = func;

// Animate.CSS
const animateCSS = (element, animationName, callback) => {
    const node = document.querySelector(element)
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
        node.classList.remove('animated', animationName)
        node.removeEventListener('animationend', handleAnimationEnd)

        if (typeof callback === 'function') callback()
    }

    node.addEventListener('animationend', handleAnimationEnd)
}

function filter(myArray, myFilter){
    var filtered = [];

    for(var arr in myArray){
       for(var filter in myFilter){
           if(!(myArray[arr].date == myFilter[filter].date 
           && myArray[arr].name == myFilter[filter].name
           && myArray[arr].controlnumber == myFilter[filter].controlnumber
           && myArray[arr].premium == myFilter[filter].premium
           && myArray[arr].items == myFilter[filter].items
           && myArray[arr].policynumber == myFilter[filter].policynumber
           && myArray[arr].referencenumber == myFilter[filter].referencenumber)){
              filtered.push(myArray[arr]);
            }
       }
    }
    
    return filtered;
}

export {func}
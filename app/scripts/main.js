/* global $ */

// Main Script

// Libraries
import {API} from "./modules/api.js"
import {views} from "./modules/views.js"
import {func} from "./modules/dom.js"
import {Modal} from "./modules/modal.js";

// Loaded variables 
// Prevents views from loading again in same session
var drawerLoaded=false;
var noteViewsLoaded=false;
var customerViewsLoaded=false;

const init = function(){

    // Init DOM functions
    func.init();

    // Load Drawer
    if(!drawerLoaded){
        API.readClientJSON("views/drawer.json", views.loadDrawer);
        drawerLoaded=true;
    }
    // Load Customer Info
    if(!customerViewsLoaded){
        API.readClientJSON("views/customer.json", data=>views.loadView(data,"customerinfo"), false);
        customerViewsLoaded=true;
    }

    // Load Notes View
    if(!noteViewsLoaded){
        API.readClientJSON("views/notes.json", data=>views.loadView(data,"note"), false);
        noteViewsLoaded=true;
    }

    views.initQuoteDropdown();
    views.initTabs();
    views.loadNotepad();
    views.loadNoteMenu();
    views.loadValues();

    API.getSession(function(data) {
        views.startSplash(data);
        views.displayUser(data);
    });
}

$(document).ready(init);

$(window).on("beforeunload", function(){
    views.saveValues();
});
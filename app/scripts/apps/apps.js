/* global $, Swal */

import { API } from "../modules/api.js";
import { views } from "../modules/views.js";
import { BindLogApp } from "./bindlogapp.js"
import { CallbackApp } from "./callbackapp.js";

// Apps

const Apps = {
    BindLog: BindLogApp,
    Callbacks: CallbackApp
};

Apps.open = app => {
    
    API.getSession(
        function(data){
            if(data.loggedin)Apps[app].open();
            else views.openLoginDialog();
        });
}

export { Apps }
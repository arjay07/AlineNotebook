/* global $, Swal */

import { API } from "../modules/api.js";
import { views } from "../modules/views.js";
import { BindLogApp } from "./bindlogapp.js"

// Apps

const Apps = {
    BindLog: BindLogApp
};

Apps.open = app => {
    
    API.getSession(
        function(data){
            var loggedin = data.loggedin;
            if(loggedin)Apps[app].open();
            else views.openLoginDialog();
        });
}

export { Apps }
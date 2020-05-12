/* global $, Swal */

import { API } from "../modules/api.js";
import { views } from "../modules/views.js";
import { BindLogApp } from "./bindlogapp.js"
import { CallbackApp } from "./callbackapp.js";
import { NarrativeGeneratorApp } from "./narrativegeneratorapp.js";
import {func} from "../modules/dom.js";

// Apps

const Apps = {
    BindLog: BindLogApp,
    Callbacks: CallbackApp,
    ScheduleCallback: CallbackApp.ScheduleCallback,
    NarrativeGenerator: NarrativeGeneratorApp
};

Apps.open = app => {
    
    API.getSession(
        function(data){
            func.hideDrawer();
            if(data.loggedin)Apps[app].open();
            else views.openLoginDialog();
        });
}

export { Apps }
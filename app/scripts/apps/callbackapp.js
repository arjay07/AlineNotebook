/*global $, luxon*/

// Callback App

import { Modal } from "../modules/modal.js";
import { Callbacks, Callback } from "../modules/callback.js";
const DateTime = luxon.DateTime;

const CallbackApp = {};

CallbackApp.open = function(){
    var dialog = new Modal("Callbacks", {
        
    }).show();
};

export { CallbackApp };
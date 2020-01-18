/* global $, Swal */
// Login Page

import { API } from "./modules/api.js"

const init = function(){
    API.getSession(function(session){
        console.log(session);
        if(session.errorMessage){
            Swal.fire({
                text: session.errorMessage,
                icon: "error",
                toast: true,
                position: "bottom-start"
            });
        }
    });
    
    $("#login").click(function(){
        $("#loginform").submit();
    });
}

$(document).ready(init);
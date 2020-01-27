/* global $, Swal */

// API Methods

const API = {};

API.readClientJSON = (json, success, isAsync)=>{
    $.ajax({
        async: isAsync===undefined?true:false,
        type: "POST",
        url: "/clientapi",
        data: {
            functionname: "READ_CLIENT_JSON",
            arguments: [json]
        },
        success: function (data) {
            if(typeof success === "function")success(data);
        },
        error: function(xhr, status, error) {
            xhrError(xhr, "readClientJSON");
        }
    });
}

API.readClientText=(text, success, isAsync)=>{
    $.ajax({
        async: isAsync===undefined?true:false,
        type: "POST",
        url: "/clientapi",
        data: {
            functionname: "READ_CLIENT_TXT",
            arguments: [text]
        },
        success: function (data) {
            if(typeof success === "function")success(data);
        },
        error: function(xhr, status, error) {
            xhrError(xhr, "readClientText");
        }
    });
}

API.readJSON=(json, success, isAsync)=>{
    $.ajax({
        async: isAsync===undefined?true:false,
        type: "POST",
        url: "/api",
        data: {
            functionname: "READ_APP_JSON",
            arguments: [json]
        },
        success: function (data) {
            if(typeof success === "function")success(data);
        },
        error: function(xhr, status, error) {
            xhrError(xhr, "readJSON");
        }
    });
}

API.readText=(text, success, isAsync)=>{
    $.ajax({
        async: isAsync===undefined?true:false,
        type: "POST",
        url: "/api",
        data: {
            functionname: "READ_APP_TXT",
            arguments: [text]
        },
        success: function (data) {
            if(typeof success === "function")success(data);
        },
        error: function(xhr, status, error) {
            xhrError(xhr, "readText");
        }
    });
}

API.writeFile = (filename, content, success, isAsync) => {
    $.ajax({
        async: isAsync===undefined?true:false,
        type: "POST",
        url: "/api",
        data: {
            functionname: "WRITE_FILE",
            arguments: [filename, content]
        },
        success: function (data) {
            if(typeof success === "function")success(data);
        },
        error: function(xhr, status, error) {
            xhrError(xhr, "writeFile");
        }
    });
}

API.getSession = (success, isAsync) => {
    $.ajax({
        async: isAsync===undefined?true:false,
        type: "POST",
        url: "/session",
        success: function (data) {
            console.log(data);
            if(typeof success === "function")success(data);
        },
        error: function(xhr, status, error) {
            xhrError(xhr, "getSession");
        }
    });
}

API.userAPI = (funcname, args, success, isAsync) => {
    $.ajax({
        async: isAsync===undefined?true:false,
        type: "POST",
        url: "/userapi",
        data: {
            functionname: funcname,
            arguments: args
        },
        success: function (data) {
            if(typeof success === "function")success(data);
        },
        error: function(xhr, status, error) {
            xhrError(xhr, "userAPI");
        }
    });
}

API.db = (funcname, args, success, isAsync) => {
    $.ajax({
        async: isAsync===undefined?true:false,
        type: "POST",
        url: "/db",
        data: {
            functionname: funcname,
            arguments: args
        },
        success: function (data) {
            if(typeof success === "function")success(data);
        },
        error: function(xhr, status, error) {
            xhrError(xhr, "Database");
        }
    });
}

function xhrError(xhr, functionname){
    
    Swal.fire({
        title: "API Error ("+functionname+")",
        html: `<div style="overflow:auto">${xhr.responseText}</div>`,
        icon: "error"
    });
}

export {API}
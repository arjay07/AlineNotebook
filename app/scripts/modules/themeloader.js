/* global $, less */

// Theme Loader

import {API} from "../modules/api.js"

var ThemeLoader = {};

ThemeLoader.read = function(themeFile){
    
    var themeObj;
    
    API.readJSON("/themes/"+themeFile, function(data){
        themeObj = data;
    }, true);
    
    return themeObj;
};

ThemeLoader.load = function(themeFile){
    var theme = ThemeLoader.read(themeFile);
    if(theme)less.modifyVars(theme);
    else console.error("No theme found.");
};

export { ThemeLoader };
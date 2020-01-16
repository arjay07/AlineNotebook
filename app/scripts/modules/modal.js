// Modal Module
// Overlay windows

function Modal(title, options){

    var overlay = $("<div class='overlay'></div>");
    var label = $(`<div class='modaltitle'><h2>${title}</h2></div>`);
    var closebtn = $("<span class='modalclose'>&times;</span>");
    closebtn.on("click", ()=>{
        this.close();
    });

    var content = $("<div class='modal'></div>");

    if(options){
        if(options.content){
            if(Array.isArray(options.content))options.content.forEach(
                e => {
                    content.append(e);
                }
            );
            else if(typeof options.content === "string"){
                content.html(options.content);
            }
        }
        if(options.style){
            content.css(options.style);
        }
    }

    overlay.append(label, closebtn, content);

    $(window).resize(function(){
        closebtn.css(
        {
            left: `calc(${content.css("width")} + ${content.css("margin-left")} - (${closebtn.css("width")} / 2))`,
            top: `calc(${content[0].scrollTop})`,
            textAlign: "center"
        });
    });
    
    this.show = (callback) => {

        overlay.appendTo(document.body);
        overlay.animateCSS("fadeIn");
        content.animateCSS("slideInUp");
        label.add(closebtn).animateCSS("slideInDown");
        closebtn.css(
        {
            left: `calc(${content.css("width")} + ${content.css("margin-left")} - (${closebtn.css("width")} / 2))`,
            top: `calc(${content[0].scrollTop})`,
            textAlign: "center"
        });

        if(typeof callback === "function")callback(this);
    }
    
    this.close = (callback) => {
        overlay.animateCSS("fadeOut");
        content.animateCSS("slideOutDown");
        label.add(closebtn).animateCSS("slideOutUp", function(){
            overlay.remove();
        });
        if(typeof callback === "function")callback(this);
    }

}

// Animate CSS
function animateCSS(element, animationName, callback){
    const node = document.querySelector(element)
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
        node.classList.remove('animated', animationName)
        node.removeEventListener('animationend', handleAnimationEnd)

        if (typeof callback === 'function') callback()
    }

    node.addEventListener('animationend', handleAnimationEnd)
}

// jQuery custom methods
(function($) {
    $.fn.isAfter = function(sel){
        return this.prevAll().filter(sel).length !== 0;
    };

    $.fn.isBefore= function(sel){
        return this.nextAll().filter(sel).length !== 0;
    };

    $.fn.animateCSS = function(animationName, callback){
        $(this).addClass(`animated ${animationName}`);

        function handleAnimationEnd() {
            $(this).removeClass(`animated ${animationName}`);
            $(this).off('animationend', handleAnimationEnd);

            if (typeof callback === 'function') callback();
        }

        $(this).on('animationend', handleAnimationEnd);
    }
})(jQuery);

export {Modal}
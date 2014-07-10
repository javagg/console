(function($) {

    var lTruncate = function(container, options) {

        var self = this;
        
        self.items = null;
        self.status = null;
        self.showText = null;
        self.hideText = null;
        
        var defaultOptions = {
            length: 10,
            showText: "More",
            showClass: "show",
            hideText: "Less",
            hideClass: "hide",
            startStatus: "hidden",
            showCountHiddenItems: false
        };
        
        var options = $.extend(defaultOptions, options);
        
        var init = function() {
            
            self.status = options.startStatus;
            self.items = container.children();
            
            if (self.items.length > options.length) {
                
                self.items.each(function(index) {
                    if (index + 1 > options.length) {
                        $(this).addClass('more-less-item').css('display', 'none');
                    }
                });
                
                self.showContent = $('.more-less-item', container);
                
                self.showText = (options.showCountHiddenItems ? options.showText + ' (' + (self.items.length - options.length) + ') ' : options.showText) + '...';
                self.hideText = options.hideText + '...';
                
                self.showLink = $('<li>').addClass("more-less-link").append(self.showText);
                container.append(self.showLink);
                
                createTrigger();
                
                setStartStatus();
            }
            
        };
        
        var setStartStatus = function() {
            switch(options.startStatus) {
                case "hidden" :
                    self.hideItems();
                    break;
                case "show" :
                    self.showItems();
                    break;
                default:
                    throw "InvalidStartStatusException";
            }
        };
        
        var createTrigger = function() {            
            self.showLink.click(function() {
                if (self.status == "hidden") {
                    self.showItems();
                } else {
                    self.hideItems();
                }
                return false;
            });
        };
        
        self.hideItems = function() {
            self.showContent.hide();
            self.showLink.text(self.showText).addClass(options.hideClass).removeClass(options.showClass);
            self.status = "hidden";
        };
        
        self.showItems = function() {
            self.showContent.show();
            self.showLink.text(self.hideText).addClass(options.showClass).removeClass(options.hideClass);
            self.status = "show";
        };
        
        init();
        
    };
    
    $.fn.lTruncate = function(options) {
        return this.each(function() {
            new lTruncate($(this), options);
        });
    };
    
})(jQuery);

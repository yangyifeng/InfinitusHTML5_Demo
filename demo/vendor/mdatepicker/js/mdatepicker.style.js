(function ($) {

	$.mdatepicker.i18n.zh = $.extend($.mdatepicker.i18n.zh, {
        setText: '设置',
        cancelText: '取消'
    });
/**
Android Style
*/
    $.mdatepicker.themes.android = {
        defaults: {
            dateOrder: 'Mddyy',
            mode: 'clickpick',
            height: 50
        }
    };

/**
Android ICS Style
*/
	var theme = {
        defaults: {
            //dateOrder: 'Mddyy',
            mode: 'mixed',
            rows: 5,
            width: 70,
            height: 36,
            showLabel: false
        }
    }

    $.mdatepicker.themes['android-ics'] = theme;
    $.mdatepicker.themes['android-ics light'] = theme;

/**
Windows Phone Style
*/
    $.mdatepicker.themes.wp = {
        defaults: {
            width: 70,
            height: 76,
            dateOrder: 'mmMMddDDyy'
        },
        init: function(elm, inst) {
            var click,
                active;

            $('.dwwl', elm).bind('touchstart mousedown DOMMouseScroll mousewheel', function() {
                click = true;
                active = $(this).hasClass('wpa');
                $('.dwwl', elm).removeClass('wpa');
                $(this).addClass('wpa');
            }).bind('touchmove mousemove', function() {
                click = false;
            }).bind('touchend mouseup', function() {
                if (click && active) {
                    $(this).removeClass('wpa');
                }
            });
        }
    }

    $.mdatepicker.themes['wp light'] = $.mdatepicker.themes.wp;


/**
IOS Style
*/
	$.mdatepicker.themes.ios = {
        defaults: {
            dateOrder: 'MMdyy',
            rows: 5,
            height: 30,
            width: 55,
            headerText: false,
            showLabel: false
        }
    }

})(jQuery);


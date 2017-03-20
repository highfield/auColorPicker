;
/**
    MIT License
    Copyright (c) 2017 Mario Vernari
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
 */


(function ($) {
    "use strict";

    var web16 = (function () {
        var colors = [
            { name: 'white' },
            { name: 'silver' },
            { name: 'gray' },
            { name: 'black' },
            { name: 'red' },
            { name: 'maroon' },
            { name: 'yellow' },
            { name: 'olive' },
            { name: 'lime' },
            { name: 'green' },
            { name: 'aqua' },
            { name: 'teal' },
            { name: 'blue' },
            { name: 'navy' },
            { name: 'fuchsia' },
            { name: 'purple' }
        ];

        var me = {}, init;

        me.colors = function () {
            if (!init) {
                init = true;
                colors.forEach(function (c) {
                    c.rgb = $.fn.auColorPicker.utils.toRGB(c.name);
                });
            }
            return colors.slice(0);
        }

        me.getColorByName = function (name) {
            for (var i = 0; i < colors.length; i++) {
                if (colors[i].name === name) return colors[i].rgb;
            }
            return $.fn.auColorPicker.utils.toRGB('transparent');
        }

        me.getNameByColor = function (rgb) {
            for (var i = 0; i < colors.length; i++) {
                if (colors[i].rgb === rgb) return colors[i].name;
            }
            return '';
        }

        return me;
    })();


    $.fn.auColorPicker = function (options) {
        return this.each(function () {
            var obj = AuColorPicker();
            obj.init(options, this);
            $(this).data('auColorPicker', obj);
        });
    };

    $.fn.auColorPicker.options = {
        goBackElement: null,
        goNextElement: null,
        openPickerElement: null,
        colorPadElement: null,
        palette: 'web16',
        color: 'black',
        modal: true,
        fx: true,
        fxmobile: true,
        title: null,
        autoSubmit: true
    };

    $.fn.auColorPicker.utils = (function () {
        var me = {};

        me.toRGB = function (c) {
            var el = $('<div>').appendTo('body');
            var rgb = el.css('color', c).css('color');
            el.remove();
            return rgb;
        }

        return me;
    })();


    function AuColorPicker() {

        function hookevents(mode) {
            var picker_node_el = '.au-color.fg-picker-focus';
            var ui_event;
            if (isMobile) {
                ui_event = {
                    i: 'touchstart',
                    m: 'touchmove',
                    e: 'touchend'
                }
            }
            else {
                ui_event = {
                    i: 'mousedown',
                    m: 'mousemove',
                    e: 'mouseup'
                }
            }

            $(document)[mode]('click', hClosePicker);

            $(document)[mode](ui_event.i, picker_node_el + ' .pick-submit', hSubmit);
            $(window)[mode]('resize', hResize);
        }


        function hClosePicker(e) {
            if (tmr) return;
            if (!me.$elem.is(e.target) && !picker.is(e.target) && picker.has(e.target).length === 0) {
                picker_hide();
            }
        }

        function hSubmit() {
            picker_hide();
            me.setColor(color_temp);
        }

        function hResize() {
            picker_offset();
            is_fx_mobile();
        }


        /**
         * Support functions
         */

        function picker_show() {
            color_temp = color_curr;
            picker_create();
            picker_update();
            is_fx_mobile();
            picker_offset();
            picker.addClass('fg-picker-focus');
            if (picker.hasClass('au-color-modal')) {
                $('body').append('<div class="au-color-modal-overlay"></div>')
            }
            hookevents('on');
            tmr = setTimeout(function () {
                tmr = null;
            }, 300);
        }


        function picker_hide() {
            $('.au-color-modal-overlay').remove();
            hookevents('off');
            picker.remove();
            picker = null;
        }


        function picker_create() {
            picker = $('<div>').addClass('au-color').addClass(me.options.theme || 'primary').appendTo('body');
            if (me.options.modal) picker.addClass('au-color-modal');
            if (me.options.fx) picker.addClass('au-color-fxs');
            var inner = $('<div>').addClass('fg-picker').appendTo(picker);

            var ul = $('<ul>').addClass('pick').appendTo(inner);
            palette.colors().forEach(function (o) {
                $('<li>').css({
                    'background-color': o.rgb
                }).data('key', o.name).appendTo(ul).on('click', picker_select);
            })

            if (!me.options.autoSubmit) {
                //buttons
                var pb = $('<div>').addClass('pick-btns').appendTo(inner);
                var bsub = $('<div>').addClass('pick-submit').appendTo(pb);
                $('<span>').addClass('glyphicon glyphicon-ok').attr('aria-hidden', true).appendTo(bsub);
            }

            //title
            if (me.options.modal && me.options.title) {
                $('<div>').addClass('au-color-title').text(me.options.title).appendTo(picker);
            }
        }


        function picker_update() {
            picker.find('.fg-picker .pick li').each(function () {
                var match = $(this).css('background-color') === color_temp;
                $(this).css({
                    'outline-color': match ? 'gray' : 'transparent'
                });
            });
        }


        function picker_select() {
            var name = $(this).data('key');
            color_temp = palette.getColorByName(name);
            if (me.options.autoSubmit) {
                hSubmit();
            }
            else {
                picker_update();
            }
        }


        function picker_offset() {
            if (!picker.hasClass('au-color-modal')) {
                var left = me.$elem.offset().left + me.$elem.outerWidth() / 2;
                var top = me.$elem.offset().top + me.$elem.outerHeight();
                picker.css({
                    'left': left,
                    'top': top
                });
            }
        }


        function is_fx_mobile() {
            if (picker && me.options.fx && !me.options.fxmobile) {
                if ($(window).width() < 480)
                    picker.removeClass('fg-picker-fxs');
                else
                    picker.addClass('fg-picker-fxs')
            }
        }


        function buildAttach() {
            if (me.options.goBackElement) {
                $(me.options.goBackElement).on('click', me.goBack);
            }
            if (me.options.goNextElement) {
                $(me.options.goNextElement).on('click', me.goNext);
            }
            if (me.options.openPickerElement) {
                $(me.options.openPickerElement).on('click', me.openPicker);
            }
        }


        function input_change_value(raise) {
            if (me.options.colorPadElement) {
                $(me.options.colorPadElement).css('background-color', color_curr);
            }
            var name = palette && palette.getNameByColor(color_curr);
            me.$elem.val(name);
            if (raise) me.$elem.change();
        }


        function indexOfColor(s) {
            if (!palette) return -1;
            var colors = palette.colors();
            for (var i = 0; i < colors.length; i++) {
                if (s === colors[i].rgb) return i;
            }
            return -1;
        }

        var me = {}, picker, overlay, tmr;
        var palette, color_curr, color_temp, ixcolor;
        var isMobile = !!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

        me.init = function (options, elem) {
            me.$elem = $(elem);
            me.options = $.extend({}, $.fn.auColorPicker.options, options);

            me.$elem.attr('readonly', 'readonly');
            me.$elem.focus(function (e) {
                e.preventDefault();
                me.$elem.blur();
            });

            palette = web16;
            color_curr = $.fn.auColorPicker.utils.toRGB(me.options.color);
            ixcolor = indexOfColor(color_curr);
            //if (typeof palette === 'string') {
            //    switch (me.options.palette || 'web16') {
            //        case 'web16':
            //    }
            //}
            //else {
            //    palette = me.options.palette;
            //}

            buildAttach();
            input_change_value(false);
        };

        me.goBack = function () {
            if (!palette) return;
            var colors = palette.colors();
            --ixcolor;
            if (ixcolor < 0) ixcolor = colors.length - 1;
            me.setColor(colors[ixcolor].name);
        }

        me.goNext = function () {
            if (!palette) return;
            var colors = palette.colors();
            ++ixcolor;
            if (ixcolor >= colors.length) ixcolor = 0;
            me.setColor(colors[ixcolor].name);
        }

        me.openPicker = function () {
            if (!palette) return;
            picker_show();
        }

        me.getColor = function () {
            return color_curr;
        }

        me.setColor = function (v) {
            color_curr = $.fn.auColorPicker.utils.toRGB(v || '');
            ixcolor = indexOfColor(color_curr);
            input_change_value(true);
        }

        return me;
    }

} (jQuery));
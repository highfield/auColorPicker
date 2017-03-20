
$(function () {
    "use strict";

    var options1 = {
        goNextElement: $('#cp1-next'),
        openPickerElement: $('#cp1-edit'),
        colorPadElement: $('#cp1-edit'),
        title: 'Select a color...'
    };

    $('#cp1').auColorPicker(options1);
    $('#cp1').on('change', function () {
        $('#cp1-target').css('background-color', $(this).val());
    });


    var options2 = {
        openPickerElement: $('#cp2,#cp2-pad'),
        colorPadElement: $('#cp2-pad'),
        title: 'Select a color...'
    };

    $('#cp2').auColorPicker(options2);
    var cp2 = $('#cp2').data('auColorPicker');
    $('#cp2').on('change', function () {
        $('#cp2-target').css('background-color', cp2.getColor());
    });

});

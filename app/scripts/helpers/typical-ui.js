/*global define*/

/*стандартный js для типичных элементов на странице*/
define([
    'jquery'
], function ($) {
    'use strict';

    /*функция фильтрации ввода в инпут: только числа или клавиши с кодами  - 0, 8, 13, 9, 37*/
    function filterNumbers(event) {
        var key,
            keyChar;

        if (event.keyCode) {
            key = event.keyCode;
        } else if(event.which) {
            key = event.which;
        }
        if(key === null || key === 0 || key === 8 || key === 13 || key === 9 || key === 37 ) {
            return true;
        }
        keyChar=String.fromCharCode(key);
        if(!/[0-9]{1,10}/.test(keyChar)) {
            return false;
        } else {
            return true;
        }
    }

    /*клик на обёртке инпута переносит фокус на инпут*/
    $(document)
        .on('click', '.input', function(e){
            e.stopPropagation();
            $(this).find('.input__field').trigger('focus');
        });

    /*фокус на инпуте меняет состояние его обёртки*/
    (function(){
        var focusClass = 'input_state_focus';

        $(document)
            .on('click', '.input__field', function(e){
                e.stopPropagation();
            })
            .on('focus', '.input__field', function(){
                $(this).closest('.input').addClass(focusClass);
            })
            .on('focusout', '.input__field', function(){
                $(this).closest('.input').removeClass(focusClass);
            });
    }());

    /*инпуты только с числовым вводом*/
    $(document)
        .on('keypress', '.num-input', filterNumbers)

        /*фокус на числовых инпутах выделяет содержимое*/
        .on('focus click', '.num-input', function(){
            var $that = $(this);

            setTimeout(function(){
                $that.select();
            }, 0);
        });

    /*убрать фокус с кликнутой кнопки*/
    $(document)
        .on('click', '.button', function(){
            $(this).blur();
        })
        .on('mouseup', function(){
            $('.button:focus').blur();
        })
        /*button mousedown fix*/
        .on('mousedown mouseup', '.button', function(e){
            $(this).toggleClass( 'active', e.type === 'mousedown' );
        }).on('mouseleave', '.button', function(){
            $(this).removeClass( 'active');
        });

});













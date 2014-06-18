/*global define*/

/*модуль View для табличной строки продукта*/
define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'jquery.ba-throttle-debounce'
], function ($, _, Backbone, JST) {
    'use strict';

    var ProductView = Backbone.View.extend({
        template: JST['app/scripts/templates/product.ejs'],

        events: {
            /*пересчитываем стоимость продукта после ввода нового количества*/
            'keyup .basket__product-count': $.debounce(350, function(e){
                this.changeQuantity(e);
            }),
            /*удаляем продукт по клику на контрол*/
            'click .basket__product-delete': 'removeProduct'
        },

        initialize: function () {
            /*рендерим тотал корзины при изменении количества товара в одной из моделей коллекции*/
            this.listenTo(this.collection, 'change:quantity', function(model) {
                this.renderSum(model);
            });
            /*удаляем html модели при её удалении*/
            this.listenTo(this.collection, 'destroy', function(model) {
                this.removeProduct(model);
            });
            /*рендерим новый продукт при синхронизации коллекции с localStorage,
            но только если в ответе синхронизационного запроса установлен флаг 'addedNewProduct: true'*/
            this.listenTo(this.collection, 'sync', function(model, data, response) {
                if (response.addedNewProduct) {
                    this.renderNewProduct(model);
                }
            });
        },

        /*первоначальный рендер, происходит только при первичной отрисовке view*/
        render: function () {
            var $el = this.$el,
                template = this.template,
                html = '';

            /*для каждой модели в коллекции генерируем html*/
            this.collection.each(function(model){
                html += template(model.toJSON());
            });

            $el.append(html);

            return this;
        },

        /*метод изменения количества товара при вводе новых значений в инпут, в том числе
        нолей, а также при полном удалении значения из инпута*/
        changeQuantity: function (e) {
            var $input = $(e.currentTarget),
                minVal = 1,
                wasEmpty = !$input.val().length,
                wasZero = parseInt($input.val()) === 0,
                currentVal = wasEmpty || wasZero ? minVal : parseInt($input.val(), 10),
                prevVal = $input.data('prev-val') ? $input.data('prev-val') : $input[0].defaultValue,
                finalHash = {};

            /*при полном удалении значения из инпута или при вводе нуля -
            значение устанавливается в минимально возможное (в 1)*/
            if (wasEmpty || wasZero) {
                $input.val(minVal);
                $input.data('prev-val', minVal);
            } else {
                $input.data('prev-val', currentVal);
            }

            /*возвращаемся, если итоговое введённое значение не поменялось*/
            if (currentVal === prevVal) {
                return;
            }

            $input.val(currentVal);
            finalHash.quantity = currentVal;

            /*Сохраняем модель, в которой сменилось количество товара. Модель находится по
            * предустановленному в шаблоне продукта атрибуту 'data-id', который содержит id модели.
            * Сгенерированный с помощью шаблона html продукта содержит id модели после её сохранения в localStorage.
            * Это необходимо, т.к. в качестве view используется контейнер табличных строк продукта, а не сама строка.
            * Событие смены количества продукта делегировано этому контейнеру (как и событие удаления продукта),
            * и чтобы узнать, с какой моделью произошло взаимодействие, надо с помощью data-атрибутов идентифицировать
            * нужные элементы при генерации шаблона.*/
            this.collection
                .get($input.data('id'))
                .set(finalHash)
                .save(finalHash, {
                    success: function () {},
                    error: function () {}
                });

        },

        /*рендер нового продукта в контейнер view*/
        renderNewProduct: function (model) {
            this.$el.append(this.template(model.toJSON()));

        },

        /*Удаление продукта из контейнера view. Метод принимает в качестве аргумента
        * событие или модель, т.к. может вызываться либо после клика на контрол удаления
        * (в этом случае передаётся событие клика), либо после удаления модели
        * (в этом случае передаётся модель)*/
        removeProduct: function (eventOrModel) {
            var isModelWasPassed = eventOrModel instanceof Backbone.Model,
                $row = isModelWasPassed ? this.$el.find('#' + eventOrModel.id) :
                    $(eventOrModel.currentTarget).closest('.basket__product'),
                /*если модель не была передана в аргументе, то она определяется по тому же принципу,
                * что и модель в методе 'changeQuantity'*/
                model = isModelWasPassed ? eventOrModel : this.collection.get($row.attr('id'));

            /*удаляем html продукта*/
            $row.remove();

            /*если модель не была передана в аргументе - удаляем модель продукта
            * в противном случае модель уже была удалена ранее*/
            if (!isModelWasPassed) {
                model.destroy({
                    success: function () {},
                    error: function () {}
                });
            }

        },

        /*рендер конечной стоимости продукта с учётом его количества*/
        renderSum: function (model) {
            this.$el.find('#' + (model.isNew() ? model.cid : model.id) + ' .basket__product-sum').html(model.get('price') * model.get('quantity'));

        }
    });

    return ProductView;
});

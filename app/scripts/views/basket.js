/*global define*/

/*модуль View для всё корзины*/
define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'models/product'
], function ($, _, Backbone, JST, ProductModel) {
    'use strict';

    var BasketView = Backbone.View.extend({
        template: JST['app/scripts/templates/basket.ejs'],

        events: {
            /*при сабмите формы добавления товара - добавляем рандомный товар*/
            'submit .basket__add-unique-product': 'addRandomProduct',
            /*при сабмите корзины - исполняем метод 'submitBasket'*/
            'submit .basket__form': 'submitBasket'
        },

        initialize: function () {
            /*слушаем события коллекции, чтобы отражать текущее состояние всей корзины (пустая или нет) и отрисовывать тотал*/
            this.listenTo(this.collection, 'change:quantity add remove reset', function(modelOrCollection, x, response) {
                /*Разные события передают в качестве аргумента в коллбэк разные объекты - либо модель,
                * либо коллекцию. По необходимости непосредственно в каждом методе мы определяем,
                * модель это или коллекция.*/
                this.handleEmptyState(modelOrCollection, x, response);
                this.renderTotal(modelOrCollection);
            });
        },

        /*первичный рендер view, с учётом состояния коллекции*/
        render: function () {
            var $el = this.$el,
                template = this.template,
                html = template({
                    products: this.collection.toJSON()
                });
            $el.append(html);
            return this;
        },

        /*метод добавления рандомного продукта*/
        addRandomProduct: function (e) {
            var productData = {
                    'pic': 'http://placebacn.com/70/70',
                    'name': 'Бекон, сорт №' + Math.ceil((Math.random()*20)),
                    'price': Math.ceil((Math.random()*1500)),
                    'quantity': 1
                },
                randomProduct = new ProductModel(productData);

            e.preventDefault();
            this.collection.add(randomProduct);

            /*Сохраняем модель добавленного продукта и передаём соответствующий флаг в запрос, чтобы в
            * ProductView.renderNewProduct() было понятно, что синхронизация коллекции произошла именно
            * в результате добавления новой модели продукта в коллекцию.*/
            randomProduct.save(null, {
                addedNewProduct: true
            });

        },

        /*метод сабмита корзины*/
        submitBasket: function (e) {
            var collection = this.collection;
            e.preventDefault();

            window.alert('POST-запрос на url, указанный в конструкторе коллекции. Все продукты удаляются из коллекции, как "купленные".');

            /*Функционал сохранения данных на сервер отзеркален в Backbone.ajaxSync,
            * т.к. Backbone.sync используется плагином Backbone.localStorage для сохранения в
            * localStorage. Все модели коллекции поочерёдно удаляются с установкой флага
            * 'allDestroyed: true' в опциях запроса. Этот флаг используется в методе
            * BasketView.handleEmptyState для определения состояния 'после покупки'.*/
            Backbone.ajaxSync('create', collection, {
                success: function () {},
                error: function () {
                    window.alert('Неудачный запрос, url не найден. Но сделаем вид, что покупка прошла успешно.');

                    collection.destroyModels({
                        allDestroyed: true
                    });
                }
            });

        },

        /*метод обработки состояния корзины (пустая или нет, пустая в результате покупки или нет)*/
        handleEmptyState: function (modelOrCollection, x, response) {
            /*вычленяем коллекцию из переданного аргумента*/
            var collection = modelOrCollection.collection ? modelOrCollection.collection : modelOrCollection,
                $basket = this.$el.find('.basket'),
                emptyClass = 'basket_state_empty',
                submittedClass = 'basket_state_submitted';

            /*Если в ответе установлен флаг 'allDestroyed: true', значит был сабмит корзины и
            * все модели в localStorage были уничтожены, а также была совершена покупка,
            * поэтому корзине устанавливается соответствующий класс.*/
            if (response.allDestroyed) {
                if (collection.length === 0) {
                    $basket.addClass(submittedClass);
                }
            } else {
                $basket.removeClass(submittedClass);
                if (collection.length === 0) {
                    $basket.addClass(emptyClass);
                } else {
                    $basket.removeClass(emptyClass);
                }
            }

        },

        /*рендер тотала корзины*/
        renderTotal: function (modelOrCollection) {
            /*вычленяем коллекцию из переданного аргумента*/
            var collection = modelOrCollection.collection ? modelOrCollection.collection : modelOrCollection,
                total = _.reduce(collection.toJSON(), function(memo, item){
                return memo + (item.price * item.quantity);
            }, 0);
            this.$el.find('.basket__total').html(total);

        }

    });

    return BasketView;
});

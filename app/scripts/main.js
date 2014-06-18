/*global require*/
'use strict';

/*конфиг require.js*/
require.config({
    shim: {
        'jquery.ba-throttle-debounce': {
            deps: ['jquery'],
            exports: 'jQuery.throttle'
        }
    },
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        underscore: '../bower_components/underscore/underscore',
        backbone: '../bower_components/backbone/backbone',
        'backbone.localStorage': '../bower_components/backbone.localStorage/backbone.localStorage',
        'jquery.ba-throttle-debounce': '../bower_components/jquery-throttle-debounce/jquery.ba-throttle-debounce'
    }
});

require([
    'jquery',
    'backbone',
    'views/product',
    'views/basket',
    'collections/products',
    'helpers/typical-ui'
], function ($, Backbone, ProductView, BasketView, ProductsCollection) {
    var defaultProducts = [/*дефолтные данные корзины*/
            {
                'pic': 'http://placebacn.com/70/70',
                'name': 'Бекон екон екон екон екон екон екон екон екон екон екон екон екон екон екон екон екон екон екон екон екон екон екон екон екон екон екон екон екон екон екон екон, сорт №1',
                'price': 350,
                'quantity': 2
            },
            {
                'pic': 'http://placebacn.com/70/70',
                'name': 'Бекон, сорт №2',
                'price': 1654
            }
        ],
        products = new ProductsCollection(),
        productsView = null,
        basketView = null,
        localStorage = window.localStorage;

    /*фетчим данные для коллекции продуктов, если данные уже сохранены*/
    products.fetch({
        success: function () {
            if (!localStorage.getItem('basketStateBeingHandled') && !products.length ) {
                /*если данных нет в localStorage - заполняем коллекцию из дефолтного массива данных и сохраняем её в localStorage*/
                products.add(defaultProducts);
                products.syncWithStorage();
                localStorage.setItem('basketStateBeingHandled', true);
            }

            /*поочерёдно рендерим view для самой корзины и для её продуктов,
            * затем убираем класс загрузки с обёртки корзины*/
            basketView = new BasketView({
                'collection': products,
                'el': '.basket-wrap'
            }).render();
            productsView = new ProductView({
                'collection': products,
                'el': '.basket__src'
            }).render();
            $('.loading').removeClass('loading');
        },
        error: function () {}
    });

});

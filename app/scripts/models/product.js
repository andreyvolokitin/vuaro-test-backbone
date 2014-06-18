/*global define*/

/*модуль модели продукта*/
define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var ProductModel = Backbone.Model.extend({
        /*по дефолту количество продукта - 1*/
        defaults: {
            'quantity': 1
        }
    });

    return ProductModel;
});

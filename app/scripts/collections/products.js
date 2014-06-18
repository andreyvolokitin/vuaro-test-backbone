/*global define*/

/*модуль коллекции продуктов*/
define([
    'underscore',
    'backbone',
    'models/product',
    'backbone.localStorage'
], function (_, Backbone, ProductModel) {
    'use strict';

    var ProductsCollection = Backbone.Collection.extend({
        model: ProductModel,

        /*добавляем возможность хранения метаданных в коллекции*/
        initialize: function() {
            this._meta = {};
        },
        meta: function(prop, value) {
            if (value === undefined) {
                return this._meta[prop];
            } else {
                this._meta[prop] = value;
            }
        },

        /*несуществующий url для сохранения данных на сервере*/
        url: '/some_url_to_save_on_the_server',

        /*храним состояние коллекции в localStorage с помощью плагина Backbone.localStorage*/
        localStorage: new Backbone.LocalStorage('basket'),

        /*поочерёдно сохранить каждую модель коллекции в хранилище*/
        syncWithStorage: function() {
            this.invoke('save');
        },

        /*поочерёдно удалить каждую модель из коллекции и из хранилища, начиная с конца коллекции
        * в каждой итерации цикла. Опционально в аргументе можно передать настройки запроса*/
        destroyModels: function(opts) {
            var model,
                responseOptions = opts || {};
            /*пока модель является первой в коллекции - уничтожать её*/
            while (!!(model = this.first())) {
                model.destroy(responseOptions);
            }
        }
    });

    return ProductsCollection;
});

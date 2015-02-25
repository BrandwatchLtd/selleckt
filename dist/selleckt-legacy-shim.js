
/*
 * This module monkey patches Selleckt for browsers that do not
 * support the MutationObserver.
 * A shim should also be included: https://github.com/megawac/MutationObserver.js
*/

(function (root, factory) {
    /*global define:false*/
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['selleckt', 'underscore'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('selleckt'), require('underscore'));
    } else {
        // Browser globals
        root.selleckt = factory(root.selleckt, root._);
    }
}(this, function (selleckt, _) {
    'use strict';
    function objectIntersect(arr1, arr2){
        return _.filter(arr1, function(item){
            return !(_.any(arr2, function(otherItem){
                return _.isEqual(item, otherItem);
            }));
        });
    }

    if(!window.MutationObserver || !window.MutationObserver._period){
        throw new Error('Legacy Selleckt compatability requires the MutationObserver shim');
    }

    selleckt.SingleSelleckt.prototype.DELAY_TIMEOUT = window.MutationObserver._period;

    selleckt.SingleSelleckt.prototype._mutationHandler = function(mutations){
        var createSellecktItem = _.bind(this._createSellecktItem, this),
            $items = this.$sellecktEl.find('.' + this.itemslistClass),
            itemsFromNodes = _.bind(this._getItemsFromNodes, this),
            findItemInList = _.bind(this.findItemInList, this),
            newItems = [],
            removedItems = [];

        _.each(mutations, function(mutation) {
            newItems = newItems.concat(itemsFromNodes(mutation.addedNodes));
            removedItems = removedItems.concat(itemsFromNodes(mutation.removedNodes));
        });

        //the Mutation Observer shim sometimes gets confused when removing nodes
        //let's double check that the nodes are indeed removed (otherwise they
        //appear in the newItems array too)
        var trulyRemoved = objectIntersect(removedItems, newItems);
        var trulyNew = objectIntersect(newItems, removedItems);

        removedItems = trulyRemoved;
        newItems = trulyNew;

        $items.append(_.map(newItems, createSellecktItem));

        _.each(removedItems, function(item){
            findItemInList(item).remove();
        });
    };

    return selleckt;
}));

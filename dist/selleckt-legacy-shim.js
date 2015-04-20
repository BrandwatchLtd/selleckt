
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

    function getItemsDiff(mutations){
    /*jshint validthis:true*/
        var newItems = [],
            removedItems = [],
            itemsFromNodes = _.bind(this._getItemsFromNodes, this);

        _.each(mutations, function(mutation) {
            newItems = newItems.concat(itemsFromNodes(mutation.addedNodes));
            removedItems = removedItems.concat(itemsFromNodes(mutation.removedNodes));
        });

        //the Mutation Observer shim sometimes gets confused when removing nodes
        //let's double check that the nodes are indeed removed (otherwise they
        //appear in the newItems array too)
        var trulyRemoved = objectIntersect(removedItems, newItems);
        var trulyNew = objectIntersect(newItems, removedItems);

        return {
            removedItems: trulyRemoved,
            newItems: trulyNew
        };
    }

    if(!window.MutationObserver || !window.MutationObserver._period){
        throw new Error('Legacy Selleckt compatability requires the MutationObserver shim');
    }

    selleckt.SingleSelleckt.prototype.DELAY_TIMEOUT = window.MutationObserver._period;

    selleckt.SingleSelleckt.prototype._mutationHandler = function(mutations){
        var itemsDiff = getItemsDiff.call(this, mutations),
            newItems = itemsDiff.newItems,
            removedItems = itemsDiff.removedItems,
            selectedItems = [];

        this.items = this.items.concat(newItems);

        if(removedItems.length){
            this.items = _.reject(this.items, function(item){
                return _.any(removedItems, function(removedItem){
                    return removedItem.value === item.value;
                });
            });
        }

        _.forEach(this.items, function(item){
            if(item.isSelected){
                this.selectItem(item, {silent: true});
                selectedItems.push(item);
            }
        }, this);

        if(!selectedItems.length){
            this.selectedItem = undefined;

            if(this.$sellecktEl){
                this.$sellecktEl.find('.'+this.selectedTextClass).text(this.placeholderText);
            }
        }

        this.trigger('itemsUpdated', {
            items: this.items,
            newItems: newItems,
            removedItems: removedItems,
            selectedItems: selectedItems
        });
    };

    selleckt.MultiSelleckt.prototype._mutationHandler = function(mutations){
        var itemsDiff = getItemsDiff.call(this, mutations),
            newItems = itemsDiff.mutations,
            removedItems = itemsDiff.removedItems,
            selectedItems = [];

        this.items = this.items.concat(newItems);

        if(removedItems.length){
            _.forEach(removedItems, function(item){
                this.unselectItem(item, {silent: true});
            }, this);

            this.items = _.reject(this.items, function(item){
                return _.any(removedItems, function(removedItem){
                    return removedItem.value === item.value;
                });
            });
        }

        _.forEach(this.items, function(item){
            if(item.isSelected){
                this.selectItem(item, {silent: true});
                selectedItems.push(item);
            }
        }, this);

        this.trigger('itemsUpdated', {
            items: this.items,
            newItems: newItems,
            removedItems: removedItems,
            selectedItems: selectedItems
        });
    };

    return selleckt;
}));

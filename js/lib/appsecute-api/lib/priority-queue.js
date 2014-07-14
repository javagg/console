//
// Copyright (c) Appsecute 2013 - ALL RIGHTS RESERVED.
//

/**
 * @description An unsorted bag priority queue.
 */
define([
    'appsecute-api/lib/cclass',
    'appsecute-api/lib/event',
    'appsecute-api/lib/utils'],
    function (CClass, Event, Utils) {

        var comparison_result = {
            /**
             * @description The left operand is smaller than the right operand.
             */
            ascending:-1,

            /**
             * @description The two operands are equal.
             */
            same:0,

            /**
             * @description The left operand is greater than the right operand.
             */
            descending:1
        };


        return CClass.create(

            /**
             * @description Creates a new priority queue.
             * @param {Function} comparer A function used to compare objects in the queue
             * to determine their priority. If no comparer is provided the default comparer
             * that considers all objects equal will be used.
             */
                function (comparer) {


                /**
                 * @description An event that will be raised when the size of the queue changes.
                 */
                var _queueSizeChanged = new Event("Queue Size Changed", this);


                /**
                 * @description The comparer function used to compare queued objects.
                 */
                var _comparer = (function () {
                    if (Utils.isFunction(comparer)) {
                        return comparer;
                    } else {
                        return  function () {
                            return comparison_result.same;
                        };
                    }
                }());


                /**
                 * @description All objects in the queue, in priority order.
                 */
                var _queue = [];


                /**
                 * Compares two objects using the supplied comparer function and returns a
                 * ComparisonResult.
                 * @param {Object} a The left operand.
                 * @param {Object} b The right operand.
                 * @returns {Number} A comparison result from comparing the two objects.
                 */
                var compareObjects = function (a, b) {
                    return _comparer(a, b);
                };


                /**
                 * @description Bubbles the object at the specified index up the queue
                 * until it encounters an object that is the same or greater than itself.
                 * @param {int} index The index of the object to bubble up.
                 */
                var bubbleUpFrom = function (index) {

                    var parentIndex = null,
                        parentObject = null,
                        object = null;

                    while (0 < index) {

                        parentIndex = index - 1;
                        parentObject = _queue[parentIndex];
                        object = _queue[index];

                        if (compareObjects(parentObject, object) < comparison_result.same) {
                            _queue[index] = parentObject;
                            _queue[parentIndex] = object;
                            index = parentIndex;
                        } else {
                            break;
                        }
                    }
                };


                /**
                 * @description Bubbles the object at the specified index down the queue
                 * until it encounters an object that is the same or less than itself.
                 * @param {int} index The index of the object to bubble down.
                 */
                var bubbleDownFrom = function (index) {

                    var endIndex = _queue.length - 1,
                        childIndex = null,
                        childObject = null,
                        object = null;

                    while (index < endIndex) {

                        childIndex = index + 1;
                        childObject = _queue[childIndex];
                        object = _queue[index];

                        if (compareObjects(childObject, object) > comparison_result.same) {
                            _queue[index] = childObject;
                            _queue[childIndex] = object;
                            index = childIndex;
                        } else {
                            break;
                        }
                    }
                };


                return {

                    /**
                     * @description An event that is raised when the number of items in
                     * the queue changes.
                     */
                    queueSizeChanged:_queueSizeChanged,


                    /**
                     * @description Adds an object to the queue.
                     * @param {Object} object The object to add.
                     */
                    add:function (object) {
                        var objectIndex = _queue.push(object) - 1;
                        bubbleUpFrom(objectIndex);
                        _queueSizeChanged.trigger({queueSize:this.count()});
                    },


                    /**
                     * @description Removes an object from the queue.
                     * @param {Object} object The object to remove.
                     */
                    remove:function (object) {

                        var foundObject = false,
                            objectIndex = 0,
                            i = 0;

                        for (i = 0; i < _queue.length; i++) {
                            if (_queue[i] === object) {
                                foundObject = true;
                                objectIndex = i;
                                break;
                            }
                        }

                        if (foundObject) {
                            this.removeAtIndex(objectIndex);
                            _queueSizeChanged.trigger({queueSize:this.count()});
                        }
                    },


                    /**
                     * @description Retrieves the next object from the queue, removing it
                     * from the queue in the process.
                     * @returns The next object or null if the queue is empty.
                     */
                    next:function () {
                        if (_queue.length <= 0) {
                            return null;
                        } else {
                            var object = this.peek();
                            this.removeAtIndex(0);
                            return object;
                        }
                    },


                    /**
                     * @description Returns the next object from the queue
                     * without removing it from the queue.
                     * @returns The next object or null if the queue is empty.
                     */
                    peek:function () {
                        if (_queue.length <= 0) {
                            return null;
                        } else {
                            return _queue[0];
                        }
                    },


                    /**
                     * @description Returns the object at the specified index from the queue
                     * without removing it from the queue.
                     * @param {int} index The index of the object to return.
                     * @returns The object at the specified index or null if the index is out
                     * of bounds.
                     */
                    peekAtIndex:function (index) {
                        if (_queue.length < index || index < 0) {
                            return null;
                        } else {
                            return _queue[index];
                        }
                    },


                    /**
                     * @description Removes the object at the specified index from the queue.
                     * If the index is out of bounds this is a no op.
                     * @param {int} index The index of the object to remove.
                     */
                    removeAtIndex:function (index) {

                        if (_queue.length >= index && index >= 0) {
                            if (index < _queue.length - 1) {
                                _queue[index] = _queue[_queue.length - 1];
                            }

                            _queue.pop();
                            bubbleDownFrom(index);
                            _queueSizeChanged.trigger({queueSize:this.count()});
                        }
                    },


                    /**
                     * @description Returns the number of objects in the queue.
                     */
                    count:function () {
                        return _queue.length;
                    }
                };
            }
        );
    }
);
/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'underscore',
    'jquery',
    'socket.io',
    'event-emitter',
    'appsecute-api/lib/utils'],
    function (_, $, SocketIo, EventEmitter, Utils) {

        var socket_options = {
            reconnect: true,
            'reconnection delay': 500,
            'max reconnection attempts': 10,
            resource: 'srestws',
            query: "token=" + Utils.getCookie('cf_token')
        };

        var socket_wrapper = function (url) {
            this.socket = SocketIo.connect(url, socket_options);
        };

        socket_wrapper.prototype = Object.create(EventEmitter.prototype);

        socket_wrapper.prototype.joinRoom = function (room_id, room_type, join_data) {

            join_data = join_data || {};
            join_data.room = room_id;
            join_data.room_type = room_type;

            this.socket.emit('subscribe', join_data);
        };

        socket_wrapper.prototype.leaveRoom = function (room_id, room_type) {
            this.socket.emit('unsubscribe', {room: room_id, room_type: room_type});
        };

        return socket_wrapper;
    }
);
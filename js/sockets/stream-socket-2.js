/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'underscore',
    'jquery',
    'sockets/socket-wrapper',
    'event-emitter',
    'appsecute-api/lib/utils'],
    function (_, $, SocketWrapper, EventEmitter) {

        var global_stream_id = 'all_systems',
            application_room_type = 'application',
            stream_socket_url = sconsole.api_endpoint + '/srest/stream';

        var stream_socket = function () {

            var that = this;

            setTimeout(function () {

                that.socket_wrapper = new SocketWrapper(stream_socket_url);

                that.trigger('ready', []);

                that.socket_wrapper.socket.on('*', function (event_data) {
                    that.handleSocketEvent.call(that, event_data);
                });
            }, 100);
        };

        stream_socket.prototype = Object.create(EventEmitter.prototype);

        stream_socket.prototype.handleSocketEvent = function (event_data) {
            this.trigger(event_data.event, [event_data]);
        };

        stream_socket.prototype.joinGlobalStream = function (filter) {
            this.socket_wrapper.joinRoom(global_stream_id, application_room_type, {filter: filter});
        };

        stream_socket.prototype.leaveGlobalStream = function () {
            this.socket_wrapper.leaveRoom(global_stream_id, application_room_type);
        };

        stream_socket.prototype.joinApplicationStream = function (application_id) {
            this.socket_wrapper.joinRoom(application_id, application_room_type, {});
        };

        stream_socket.prototype.leaveApplicationStream = function (application_id) {
            this.socket_wrapper.leaveRoom(application_id, application_room_type);
        };

        return stream_socket;
    }
);
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

        var stats_room_type = 'stats',
            stats_socket_url = sconsole.api_endpoint + '/srest/stats',
            stat_rooms = {
                router: 'router'
            };

        var stats_socket = function () {

            var that = this;

            setTimeout(function () {

                that.socket_wrapper = new SocketWrapper(stats_socket_url);

                that.trigger('ready', []);

                that.socket_wrapper.socket.on('*', function (event_data) {
                    that.handleSocketEvent.call(that, event_data);
                });
            }, 100);
        };

        stats_socket.prototype = Object.create(EventEmitter.prototype);

        stats_socket.prototype.handleSocketEvent = function (event_data) {
            this.trigger(event_data.event, [event_data]);
        };

        stats_socket.prototype.joinRouterStats = function () {
            this.socket_wrapper.joinRoom(stat_rooms.router, stats_room_type, {});
        };

        stats_socket.prototype.leaveRouterStats = function () {
            this.socket_wrapper.leaveRoom(stat_rooms.router, stats_room_type);
        };

        return stats_socket;
    }
);
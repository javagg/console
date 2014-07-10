/**
 * Copyright (c) ActiveState 2014 - ALL RIGHTS RESERVED.
 */

define([
    'jquery',
    'backbone',
    'underscore',
    'polyglot',
    'datatables',
    'datatables-bootstrap',
    'datatables-column-filter-widgets',
    'async',
    'util/activity-indicator',
    'text!views/eventlog/templates/eventlog.html'],
    function ($, Backbone, _, Polyglot, DataTables, DataTablesBootstrap, DataTablesColumnFilterWidgets, Async, Activity, EventTemplate) {

        return Backbone.View.extend({

            events: {
                "click #new_events_notification": 'showNewEvents'
            },

            initialize: function () {
                this.options.activity.close();
                this.render();
                this.getEvents(null);
                this.firstPoll = true;
                this.keepPolling = true;
                this.newEventCount = 0;
            },

            render: function (application) {
                var template = _.template($(EventTemplate).filter('#events-template').html().trim(), {});

                $(template)
                    .appendTo(this.el);

                this.events_table = $('table#cloud-events').dataTable({
                    "iDisplayLength": -1, // show all the rows
                    "bStateSave": false,
                    "bAutoWidth": false,
                    "sDom": 'W<"clear">frti',
                    "oColumnFilterWidgets": { "aiExclude": [ 0, 1, 2, 3, 4, 5 ] },
                    "aoColumnDefs": [
                        { "bSortable": false, "aTargets": [ 0, 1, 2, 3, 4, 5, 6, 7 ] },
                        { "bVisible": false, "aTargets": [ 2, 3, 4, 5, 6, 7 ] }
                    ],
                    "aaSorting": [
                        [2, 'desc']
                    ]
                });
            },

            getEvents: function (since_md5) {
                var that = this;

                sconsole.cf_api.cloud_events.getEvents(since_md5, {}, function (err, cloud_events) {

                    var latest_md5 = since_md5;

                    if (cloud_events.results.length) {
                        latest_md5 = cloud_events.results[0].md5;

                        _.each(cloud_events.results, function (cloud_event) {
                            var event_time = new Date(cloud_event.unix_time * 1000);
                            cloud_event.time = event_time.toISOString();
                            cloud_event.desc = _.escape(cloud_event.desc.replace(/\\n/g, '<br/>'));
                            var event_icon = "<i class='icomoon-" + cloud_event.severity.toLowerCase() + "'></i>";
                            var event_text = "[" + cloud_event.time + "] " + cloud_event.node_id + " - " + cloud_event.process + " - <strong>" + cloud_event.desc + "</strong>";

                            var a = that.events_table.fnAddData([ event_icon, event_text, cloud_event.time, cloud_event.type, cloud_event.desc, cloud_event.severity, cloud_event.process, cloud_event.node_id], true);
                            var new_row = that.events_table.fnSettings().aoData[a[0]].nTr;
                            $(new_row).addClass('cloud_event event-' + cloud_event.severity);

                            if (!that.firstPoll) {
                                $(new_row).attr('style', 'display:none;').addClass('new_row');
                                that.newEventCount++;
                            }
                        });

                        if (that.newEventCount > 0) {
                            $('#new_events_notification').html(window.polyglot.t('eventlog.new_event_notice', {'smart_count': that.newEventCount}));
                            $('#new_events_notification').show('blind');
                        }

                        that.firstPoll = false;
                    }

                    if (that.keepPolling) {
                        setTimeout(function () { that.getEvents(latest_md5)}, 2000);
                    }
                });
            },

            showNewEvents: function () {
                $('#new_events_notification').hide('blind');
                this.events_table.fnDraw();
                $('tr.new_row').show().delay(3500).queue(function () {
                    $(this).removeClass('new_row');
                    $(this).dequeue();
                });
                this.newEventCount = 0;
            },

            close: function () {
                this.keepPolling = false;
                this.remove();
                this.unbind();
            }
        });
    }
);

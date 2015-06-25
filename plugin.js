var CandyShop = (function (self) {
    return self;
}(CandyShop || {}));

CandyShop.Workgroup = (function (self, Candy, $) {

    self.conn = null;
    self.workgroup = "";
    self.offer = null;
    self.requests = [];

    /**
     * Workgroup event factories.
     *
     * @type {{Presence: Function, OfferResponse: Function, OfferAccept: Function, OfferReject: Function}}
     */
    self.Events = {

        /**
         * Creates a new presence message as described in the section
         * 4.2.1 of the xep-0142.
         *
         * @param maxChats a Number the implementation MAY use to route the request
         * @param available true to indicate availability
         * @param show standard XMPP show states but interpreted differently
         * @constructor
         */
        Presence: function (available, show, maxChats) {
            "use strict";
            var attributes = {
                from: Candy.Core.getUser().getJid(),
                to: self.workgroup
            }
            if (!available) {
                attributes.type = 'unavailable';
            }
            /**
             * U:<presence from='alice@example.com/work' to='support@workgroup.example.com'>
             * U:   <agent-status xmlns='http://jabber.org/protocol/workgroup'>
             * U:     <max-chats>count</max-chats>
             * U:   </agent-status>
             * U: </presence>
             */
            var presence = new Strophe.Builder(
                'presence', attributes
            );
            presence.c('agent-status', {
                    xmlns: 'http://jabber.org/protocol/workgroup'
                }
            );
            presence.c('max-chats', {}, maxChats);
            if (show) {
                presence.up().c('show', {}, show);
            }
            return presence;
        },

        /**
         * Creates an Offer Response as described in the section
         * 4.2.5 of the xep-0142.
         * @param id the id received in the "Offer Request"
         * @constructor
         */
        OfferResponse: function () {
            "use strict";
            /**
             * A: <iq to='support@workgroup.example.com'
             * A:     from='alice@example.com/work'
             * A:     id='id1'
             * A:     type='result'/>
             */
            return new Strophe.Builder(
                'iq', {
                    from: Candy.Core.getUser().getJid(),
                    to: self.workgroup,
                    id: self.offer.element[0].parentElement.attributes.id.value, //self.offer.attributes.id.value,
                    type: 'result'
                });
        },

        /**
         * Creates an Offer Accept as described in the section
         * 4.2.6 of the xep-0142.
         *
         * @param id the id received in the "Offer Request"
         * @constructor
         */
        OfferAccept: function () {
            "use strict";
            /**
             * A: <iq to='support@workgroup.example.com' from='alice@example.com/work' id='id1' type='set'>
             * A:   <offer-accept jid='user@example.net/home' xmlns='http://jabber.org/protocol/workgroup' />
             * A: </iq>
             */
            return new Strophe.Builder(
                'iq', {
                    from: Candy.Core.getUser().getJid(),
                    to: self.workgroup,
                    id: self.offer.element[0].attributes.id.value,
                    type: 'set'
                }
            ).c('offer-accept', {
                    jid: self.offer.element[0].attributes.jid.value,
                    xmlns: 'http://jabber.org/protocol/workgroup'
                }
            );
        },

        /**
         * Creates an Offer Reject as described in the section
         * 4.2.6 of the xep-0142.
         *
         * @param id the id received in the "Offer Request"
         * @constructor
         */
        OfferReject: function (id) {
            "use strict";

        },

        /**
         * Creates a RequestAgentStatus as described in the section
         * 4.2.4 of the xep-0142.
         * 
         */
        RequestAgentStatus: function() {
            "use strict";
            /**
             * A: <iq to='support@workgroup.example.com' from='alice@example.com/work'
             * A:     id='id1' type='get'>
             * A:   <agent-status-request xmlns='http://jabber.org/protocol/workgroup'/>
             * A: </iq>
             */
             return new Strophe.Builder(
                'iq', {
                    from: Candy.Core.getUser().getJid(),
                    to: self.workgroup,
                    type: 'get'
                }
            ).c('agent-status-request', {
                    xmlns: 'http://jabber.org/protocol/workgroup'
                }
            );

        }

    };

    self.init = function (options) {
        if (typeof options == 'undefined') {
            throw "No workgroup defined"
        }

        self.conn = Candy.Core.getConnection();
        self.workgroup = options.workgroup;

        $(Candy).on('candy:core.chat.connection', function (obj, data) {
            "use strict";
            if (Strophe.Status.CONNECTED == data.status)
                self.setAvailability(true, 'chat', 1);

            // Add a handler that gets invoked every time a message with
            // the namespace http://jabber.org/protocol/workgroup is received.
            self.conn.addHandler(
                self.requestHandler,
                "http://jabber.org/protocol/workgroup",
                false,
                false,
                false,
                false
            );


            return true;
        });

        $(Candy).on('candy:view.room.after-add', function (event, data) {
            var element = data.element, roomJid = data.roomJid, type = data.type;

            if (element != null && self.offer != null) {
                element.find(".message-pane-wrapper").prepend(Mustache.to_html(self.Template.roombar, self.offer));

                // Add the invite button
                var button = element.find(".message-pane-wrapper").prepend(Mustache.to_html(self.Template.inviteButton));
                button.click(function() {
                    // Display the modal
                    

                });
            }

            return undefined;
        });

    };

    /**
     * Set the availability of the agent.
     * available: Boolean
     * show:      String chat|away|xa|dnd
     * maxChats:  Integer
     */
    self.setAvailability = function (available, show, maxChats) {
        if (maxChats == null) {
            maxChats = 1;
        }
        self.conn.send(self.Events.Presence(available, show, maxChats));
    };

    self.showModal = function () {

        modal = $(Mustache.to_html(self.Template.modalForm, self.offer));
        acceptButton = $(Mustache.to_html(self.Template.acceptButton, self.offer));
        rejectButton = $(Mustache.to_html(self.Template.rejectButton, self.offer));
        /*handleButton = Mustache.to_html(self.Template.handleButton, self.offer);*/

        $(acceptButton).click(function() {
            self.acceptImmediately();
            Candy.View.Pane.Chat.Modal.hide();
        });

        $(rejectButton).click(function() {
           self.rejectImmediately()
            Candy.View.Pane.Chat.Modal.hide();
        });

        /*$(handleButton).click(function() {
            self.handle()
        });*/

        $(modal).append(acceptButton).append(rejectButton);/*.append(handleButton);*/

        Candy.View.Pane.Chat.Modal.show($(modal), false, true);
    };

    self.accept = function () {
        "use strict";
        self.conn.send(self.Events.OfferAccept());
    };
    self.reject = function () {
    };
    self.handle = function () {
    };
    self.rejectImmediately = function () {
        "use strict";
    };
    self.acceptImmediately = function () {
        "use strict";
        self.conn.send(self.Events.OfferResponse());
        self.conn.flush();
        self.conn.send(self.Events.OfferAccept());
        self.conn.flush();
    };
    self.requestHandler = function (message) {
        "use strict";
        message = $(message);
        var element = message.children().first();
        switch (element[0].nodeName) {
            case "offer":
                if (element.parent()[0].nodeName == "message")
                    break; // Ignore the invites.

                var jid, metadata = [], timeout;
                jid = element.attr("jid");
                element.find("metadata value").each(function (key, value) {
                    value = $(value);
                    metadata.push({
                        name:value.attr("name"),
                        value:value.text()
                    })
                });
                //timeout = element.find("timeout")[0].text();
                self.offer = {
                    jid: jid,
                    timeout: timeout,
                    metadata: metadata,
                    element: element
                };

                self.showModal();

                break;
            case "notify-agents":
                self.notifyAgents = $(element);
                break;
            case "notify-queue":
                self.notifyQueue = $(element);
                break;
            case "notify-queue-details":
                self.notifyQueueDetails = $(element);
                break;
            case "offer-revoke":
                Candy.View.Pane.Chat.Modal.hide();
                self.offer = null;
                break;

        }
        return true;
    };

    self.Template = {
        acceptButton: '<div id="accept">Accept</div>',
        rejectButton: '<div id="reject">Reject</div>',
        handleButton: '<div id="handle">Handle</div>',
        modalForm: '' +
        '<div>' +
        '   <h4>New incoming request</h4>' +
        '   <div>' +
        '       {{#metadata}}' +
        '       <span class="name">{{ name }}:</span>' +
        '       <span class="value">{{ value }}</span>' +
        '       {{/metadata}}' +
        '   </div>' +
        '</div>',
        roombar: '<div class="roombar"><dl>{{#metadata}}<dt>{{name}}</dt><dd>{{value}}</dd>{{/metadata}}</div>',
        inviteButton: '<button class="invite-users btn btn-default btn-sm">Invite Users</button>',
        inviteModal: '<h4>Invite Users</h4><form id="invite-users-muc" data-roomjid={{roomjid}}><div class="form-group">' +
                  '<input type="text" name="bhUsers" class="tm-input form-control" ' +
                  'id="users-input"/></div><button class="btn btn-default" type="submit">Send Invitations</button></form>'
    };

    return self;

});

if (typeof window.__karma__ == 'undefined') {
    // Only define the function so that we can test.
    CandyShop.Workgroup = CandyShop.Workgroup(CandyShop.Workgroup || {}, Candy, jQuery);
}




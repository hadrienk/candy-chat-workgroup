var CandyShop = (function (self) {
    return self;
}(CandyShop || {}));

CandyShop.Workgroup = (function (self, Candy, $) {

    self.conn = null;
    self.workgroup = "";
    self.requests = [];

    /**
     * Retrieve the request using the id
     * @param id the id to look for
     * @returns the request DOMXMLElement if found, null otherwise
     */
    self.getRequestById = function(id) {
        for (var i = 0; i < self.requests.length; ++i) {
            if (self.requests[i].attr("id") == id)
                return self.requests[i];
        }
        return null;
    };

    /**
     * Retrieve the request using the jid
     *
     * @param jid the jid to look for
     * @returns the request DOMXMLElement if found, null otherwise
     */
    self.getRequestByJid = function(jid) {
        for (var i = 0; i < self.requests.length; ++i) {
            if (self.requests[i].attr("jid") == jid)
                return self.requests[i];
        }
        return null;
    };

    /**
     * Extract the metadata from the request
     * @param request the DOMXMLElement of the request
     * @returns {name: string, value: string}[] the metadata
     * @throws Error if the request was null
     */
    self.getMetaDataFromRequest = function(request) {
        if (!request)
            throw new Error("The request was null");

        var metadata = [{name:"", value:""}];
        $(request).find("metadata value").each(function (key, value) {
            value = $(value);
            metadata.push({
                name:value.attr("name"),
                value:value.text()
            })
        });
        return metadata;
    };

    /**
     * Extract the jid from a request
     *
     * @param request the DOMXMLElement of the request
     * @returns {String} the jid
     */
    self.getJidFromRequest = function(request) {
        return $(request).attr("jid");
    };

    /**
     * Extract the id from a request
     * @param request
     * @returns {String} the id
     */
    self.getIdFromRequest = function(request) {
        return $(request).attr("jid");
    };

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
            };
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
         * @param from the jid of the agent
         * @param workgroup the jid of the workgroup
         * @param iqId the iq id
         * @constructor
         */
        OfferResponse: function (from, workgroup, iqId) {
            "use strict";
            /**
             * A: <iq to='support@workgroup.example.com'
             * A:     from='alice@example.com/work'
             * A:     id='id1'
             * A:     type='result'/>
             */
            return new Strophe.Builder(
                'iq', {
                    from: from,
                    to: workgroup,
                    type: 'result',
                    id: iqId
                });
        },

        /**
         * Creates an Offer Accept as described in the section
         * 4.2.6 of the xep-0142.
         *
         * @param from the jid of the agent
         * @param workgroup the jid of the work group
         * @param requestJid the jid of the user request
         * @constructor
         */
        OfferAccept: function (from, workgroup, requestJid) {
            "use strict";
            /**
             * A: <iq to='support@workgroup.example.com' from='alice@example.com/work' id='id1' type='set'>
             * A:   <offer-accept jid='user@example.net/home' xmlns='http://jabber.org/protocol/workgroup' />
             * A: </iq>
             */
            return new Strophe.Builder(
                'iq', {
                    from: from,
                    to: workgroup,
                    type: 'set'
                }
            ).c('offer-accept', {
                    jid: requestJid,
                    xmlns: 'http://jabber.org/protocol/workgroup'
                }
            );
        },

        /**
         * Creates an Offer Reject as described in the section
         * 4.2.6 of the xep-0142.
         *
         * @param from the jid of the agent
         * @param workgroup the jid of the work group
         * @param requestJid the jid of the user request
         * @constructor
         */
        OfferReject: function (from, workgroup, requestJid) {
            "use strict";

            return new Strophe.Builder(
                'iq', {
                    from: from,
                    to: workgroup,
                    type: 'set'
                }
            ).c('offer-reject', {
                    jid: requestJid,
                    xmlns: 'http://jabber.org/protocol/workgroup'
                }
            );

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
                self.workgroup
            );


            return true;
        });

        $(Candy).on('candy:view.room.after-add', function (event, data) {

            try {
                var element = $(data.element), roomJid = data.roomJid;

                // TODO: Fix this hack. It relies on the openfire implementation.
                // TODO: The correct way to get the request would be to use the offer
                // TODO: element f the invite as stated in the section 4.2.8 of the
                // TODO: xep-0142
                var request = self.getRequestById(Strophe.getNodeFromJid(data.roomJid));

                if (element != null && request != null) {
                    var metadata = self.getMetaDataFromRequest(request);
                    element.find(".message-pane-wrapper").prepend(Mustache.to_html(self.Template.roombar, {metadata:metadata}));

                    // Add the invite button
                    var button = element.find(".message-pane-wrapper").prepend(Mustache.to_html(self.Template.inviteButton));
                    button.click(function() {
                        // Show a loading modal
                        Candy.View.Pane.Chat.Modal.show("", false, true);
                        try {
                            // Get the list of users
                            self.conn.sendIQ(
                                self.Events.RequestAgentStatus(),
                                function(e) {
                                    agentList = Mustache.to_html(self.Template.agentList, e);
                                    Candy.View.Pane.Chat.Modal.show(e, true, false);
                                },
                                function(e) {
                                    Candy.View.Pane.Chat.Modal.showError(e);
                                }
                            );
                            // Display the modal
                            var modal = $(Mustache.to_html(self.Template.inviteModal, {roomJid: roomJid}));
                            Candy.View.Pane.Chat.Modal.show(modal, false, true);
                        } catch (e) {
                            console.log(e);
                            Candy.View.Pane.Chat.Modal.hide();
                        }


                    });
                }
            } catch (error) {
                console.log(error);
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

    /**
     * Show the request modal
     *
     * @param requestJid the jid of the request.
     */
    self.showModal = function (requestJid) {

        var metadata = self.getMetaDataFromRequest(
            self.getRequestByJid(requestJid)
        );

        modal = $(Mustache.to_html(self.Template.modalForm, {metadata: metadata}));
        acceptButton = $(Mustache.to_html(self.Template.acceptButton));
        rejectButton = $(Mustache.to_html(self.Template.rejectButton));
        /*handleButton = Mustache.to_html(self.Template.handleButton, self.offer);*/

        $(acceptButton).click(function() {
            self.accept(
                Candy.Core.getUser().getJid(),
                self.workgroup,
                requestJid
            );
        });

        $(rejectButton).click(function() {
            self.reject(
                Candy.Core.getUser().getJid(),
                self.workgroup,
                requestJid
            );
        });

        /*$(handleButton).click(function() {
            self.handle()
        });*/

        $(modal).append(acceptButton).append(rejectButton);/*.append(handleButton);*/

        Candy.View.Pane.Chat.Modal.show($(modal), false, true);
    };

    self.accept = function (agentJid, workgroup, requestId) {
        "use strict";
        var msg = self.Events.OfferAccept(
            agentJid,
            workgroup,
            requestId
        );

        self.conn.sendIQ(
            msg,
            Candy.View.Pane.Chat.Modal.hide,
            Candy.View.Pane.Chat.Modal.showError
        );

    };
    self.reject = function (agentJid, workgroup, requestId) {

        "use strict";
        var msg = self.Events.OfferReject(
            agentJid,
            workgroup,
            requestId
        );

        self.conn.sendIQ(
            msg,
            Candy.View.Pane.Chat.Modal.hide,
            Candy.View.Pane.Chat.Modal.showError
        );


    };
    self.handle = function () {
    };

    self.requestHandler = function (message) {
        "use strict";

        // Wrapped into a try to avoid handler
        // de-registration
        try {
            message = $(message);

            // Extract the iq information
            var iqId, rootName = message.prop("tagName");
            if (rootName == "iq") {
                iqId = message.attr("id");
            }

            var element = message.children().first();
            switch (element.prop("tagName")) {
                case "offer":
                    if (rootName == "message")
                        break; // Ignore the invites.

                    var jid = element.attr("jid");
                    self.requests.push(element);

                    // Send the iq answer immediately.
                    self.conn.send(self.Events.OfferResponse(
                        Candy.Core.getUser().getJid(),
                        self.workgroup,
                        iqId
                    ));
                    self.conn.flush();

                    self.showModal(jid);

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
        } catch (error) {
            console.log(error)
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
        '       <dl>' +
        '       {{#metadata}}' +
        '       <dt class="name">{{ name }}:</dt>' +
        '       <dd class="value">{{ value }}</dd>' +
        '       {{/metadata}}' +
        '       </dl>' +
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




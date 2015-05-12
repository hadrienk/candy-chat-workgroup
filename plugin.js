var CandyShop = (function (self) {
    return self;
}(CandyShop || {}));

CandyShop.Workgroup = (function (self, Candy, $) {

    self.conn = null;
    self.workgroup = "";
    self.offer = null;

    self.Handlers = {
        OfferRequest: function (msg) {
            "use strict";
            console.log(msg);
        }

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
        Presence: function (maxChats, available, show) {
            "use strict";
            /**
             * U:<presence from='alice@example.com/work' to='support@workgroup.example.com'>
             * U:   <agent-status xmlns='http://jabber.org/protocol/workgroup'>
             * U:     <max-chats>count</max-chats>
             * U:   </agent-status>
             * U: </presence>
             */
            return new Strophe.Builder(
                'presence', {
                    from: Candy.Core.getUser().getJid(),
                    to: self.workgroup
                }
            ).c('agent-status', {
                    xmlns: 'http://jabber.org/protocol/workgroup'
                }
            ).c('max-chats', {}, '1');
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
                    id: self.offer.parentElement.attributes.id.value, //self.offer.attributes.id.value,
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
                    id: self.offer.attributes.id.value,
                    type:'set'
                }
            ).c('offer-accept', {
                    jid: self.offer.attributes.jid.value,
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

        }

    };

    self.init = function (options) {
        if (typeof options == 'undefined') {
            throw "No workgroup defined"
        }

        self.conn = Candy.Core.getConnection();
        self.workgroup = options.workgroup;

        /**
         * <iq from='support@workgroup.example.com' to='alice@example.com/work' id='id1' type='set'>
         *   <offer xmlns='http://jabber.org/protocol/workgroup' jid='user@example.net/home'>
         *     <timeout>seconds</timeout>
         *   </offer>
         * </iq>
         */
        self.conn.addHandler(
            self.gotRequest,
            "http://jabber.org/protocol/workgroup",
            "iq",
            "set",
            false,
            self.workgroup
        );

        $(Candy).on('candy:core.chat.connection', function (obj, data) {
            "use strict";
            if (Strophe.Status.CONNECTED == data.status)
                self.conn.send(self.Events.Presence());
            return true;
        });


    };


    self.showModal = function () {
        Candy.View.Pane.Chat.Modal.show(self.Template.modalForm, true, false);
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

        Candy.Core.Event.Message()
    };
    self.gotRequest = function (message) {
        "use strict";
        var element = message.firstChild;
        if (element.nodeName == "offer") {
            self.offer = element;
        }
        console.log("Got offer.");
        return true;
    };

    self.Template = {
        acceptButton: '<div id="accept">Accept</div>',
        rejectButton: '<div id="reject">Reject</div>',
        handleButton: '<div id="handle">Handle</div>',
        modalForm: '<h4>New incoming request</h4>' +
        '<div class="form-group group-form-name-group">' +
        '<span class="name">{{ label }}:</span>' +
        '<span class="value">{{ value }}</span>' +
        '</div>'
    };

    return self;

});

if (typeof window.__karma__ == 'undefined') {
    // Only define the function so that we can test.
    CandyShop.Workgroup = CandyShop.Workgroup(CandyShop.Workgroup || {}, Candy, jQuery);
}




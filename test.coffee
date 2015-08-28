describe "CandyShop", ->
    describe "Workgroup", ->
        it 'should be defined', ->
            expect(CandyShop.Workgroup).to.exist

    describe "#Workgroup()", ->
        Workgroup = null
        Candy = null
        #jQuerySpy = sinon.spy(jQuery.prototype)

        Strophe =
            Connection:
                addHandler: sinon.spy()

        beforeEach ->
            Candy = {
                Core:
                    getConnection: sinon.stub().returns(Strophe.Connection)
            }
            jQuery = {};

            Workgroup = CandyShop.Workgroup(
                {}, Candy, jQuery
            )

        describe '#init()', ->
            it 'should be defined', ->
                expect(Workgroup).itself.to.respondTo('init')

            it 'should fail without configuration', ->
                expect(-> Workgroup.init()).to.throw("No workgroup defined");

            it 'should install the handler', ->
                expect(Strophe.Connection.addHandler).to.have.been.calledWithExactly(Workgroup.handler)

            it 'should setup the interface'

            it 'should send its presence' # Or?..

        describe '#handle()', ->
            it 'should be defined', ->
                expect(Workgroup).itself.to.respondTo('handle')
            it 'should send a "Offer Response"'

        describe '#reject()', ->
            it 'should be defined', ->
                expect(Workgroup).itself.to.respondTo('reject')
            it 'should send a "Offer Reject Request"'

        describe '#accept()', ->
            it 'should be defined', ->
                expect(Workgroup).itself.to.respondTo('accept')
            it 'should send a "Offer Accept Request"'

        describe '#gotRequest()', ->
            it 'should be defined', ->
                expect(Workgroup).itself.to.respondTo('gotRequest')
            it 'should display a popup'
            it 'should save the request'
            it 'should ignore any other requests'
            it 'should time out'

        describe '#showModal()', ->
            it 'should be defined', ->
                expect(Workgroup).itself.to.respondTo('showModal')

            it 'should display the modal'

            it 'should display the parameters'

        describe '#getMetaDataFromRequest()', ->
            it 'should be defined', ->
                expect(Workgroup).itself.to.respondTo('getMetaDataFromRequest')
            it 'should throw error if no request is defined', ->
                expect(-> Workgroup.getMetaDataFromRequest(1)).to.throw(Error)
            it 'should call the metadata', ->
                #console.log(jQuery('<test />'))
                request = jQuery("")
            #jQuery.onCall(request).returnThis().onCall("metadata value")

            it 'should filter metadata'

        describe 'Events', ->
            it 'should be defined', ->
                expect(Workgroup.Events).to.exist

            beforeEach ->
                stubJid = {
                    getJid: sinon.stub().returns("alice@example.com/work")
                }
                Candy.Core.getUser = sinon.stub().returns(stubJid)
                Workgroup.workgroup = "support@workgroup.example.com"


            describe 'Presence', ->

                it 'should create unavailable stanza', ->
                    returnedStanza = Workgroup.Events.Presence(false, 'chat', 0).toString()
                    expect(returnedStanza).to.equal("""\
                        <presence from='alice@example.com/work' to='support@workgroup.example.com' type='unavailable' xmlns='jabber:client'>\
                            <show>chat</show>\
                            <agent-status xmlns='http://jabber.org/protocol/workgroup'/>\
                        </presence>\
                    """)

                it 'should create available stanza', ->
                    returnedStanza = Workgroup.Events.Presence(true, 'chat', 0).toString()
                    expect(returnedStanza).to.equal("""\
                        <presence from='alice@example.com/work' to='support@workgroup.example.com' xmlns='jabber:client'>\
                            <show>chat</show>\
                            <agent-status xmlns='http://jabber.org/protocol/workgroup'/>\
                        </presence>\
                    """)

                it 'should create available stanza', ->
                    returnedStanza = Workgroup.Events.Presence(true, null, 0).toString()
                    expect(returnedStanza).to.equal("""\
                        <presence from='alice@example.com/work' to='support@workgroup.example.com' xmlns='jabber:client'>\
                            <agent-status xmlns='http://jabber.org/protocol/workgroup'/>\
                        </presence>\
                    """)

                it 'should create available stanza with max chat', ->
                    returnedStanza = Workgroup.Events.Presence(true, 'chat', 1).toString()
                    expect(returnedStanza).to.equal("""\
                        <presence from='alice@example.com/work' to='support@workgroup.example.com' xmlns='jabber:client'>\
                            <show>chat</show>\
                            <agent-status xmlns='http://jabber.org/protocol/workgroup'>\
                                  <max-chats>1</max-chats>\
                            </agent-status>\
                        </presence>\
                    """)
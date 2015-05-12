describe "CandyShop", ->
    describe "Workgroup", ->
        it 'should be defined', ->
            expect(CandyShop.Workgroup).to.exist

    describe "#Workgroup()", ->
        Workgroup = null

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
                CandyShop.Workgroup || {}, Candy, jQuery
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
            it 'should send a success response'

        describe '#acceptImmediatly()', ->
            it 'should be defined', ->
                expect(Workgroup).itself.to.respondTo('acceptImmediatly')
            it 'should send a "Offer Response"'
            it 'should send a "Offer Accept Request"'

        describe '#rejectImmediatly()', ->
            it 'should be defined', ->
                expect(Workgroup).itself.to.respondTo('rejectImmediatly')
            it 'should send a "Offer Response"'
            it 'should send a "Offer Reject Request"'

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

        describe 'Handler', ->
            it 'should be defined', ->
                console.log Workgroup.Handler
                expect(Workgroup.Handler).to.exist
            it 'should handle "Offer Revoke Request"'
            it 'should handle "Offer Request"'
            it 'should handle "Agent Invite"'
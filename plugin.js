var CandyShop = (function (self) {
    return self;
}(CandyShop || {}));

CandyShop.Workgroup = (function (self, Candy, $) {

    var request = null;
    var workgroup = null;

    self.init = function (options) {
        if (typeof options == 'undefined') {
            throw "No workgroup defined"
        }
    };


    self.showModal = function () {
        Candy.View.Pane.Chat.Modal.show(self.Template.modalForm, true, false);
        self.addFormHandler();
    };

    self.accept = function () {
    };
    self.reject = function () {
    };
    self.handle = function () {
    };
    self.rejectImmediatly = function () {
    };
    self.acceptImmediatly = function () {
    };
    self.gotRequest = function () {
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




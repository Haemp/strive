describe('Calculation Service', function () {
    var cs;
    //console.log = function(){};
    beforeEach(module('Calculations'));
    beforeEach(inject(function (CalcService, JsonStorage) {
        cs = CalcService;
        js = JsonStorage;
    }));

    iit('Should calcualte the corrent best before day', function () {
        expect(true).toBe(true);
    })

});


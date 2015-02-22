describe('Calculations', function(){

    var ch, js, w;

    console.log = function(){};
    beforeEach(module('calc.CalcHelper'));
    beforeEach(inject(function (CalcHelper) {
        ch = CalcHelper;
    }));
    describe('Calculation dirty checking', function () {

        it('Should be dirty one 28/3 20:00 -> 29/3 20:00', function () {

            var lastCalcDate = new Date.parse('2015-03-28 20:00:00');
            var todayDate = new Date.parse('2015-03-29 20:00:00');

            var r = ch.checkIfDirty(lastCalcDate, todayDate);

            expect(r).toBe(true);
        })

        it('Should by dirty 28/3 02:00 -> 28/3 20:00', function () {

            var lastCalcDate = new Date.parse('2015-03-28 02:00:00');
            var todayDate = new Date.parse('2015-03-28 20:00:00');

            var r = ch.checkIfDirty(lastCalcDate, todayDate);

            expect(r).toBe(true);
        })

        it('Should by dirty 28/3 08:00 -> 29/3 04:00', function () {

            var lastCalcDate = new Date.parse('2015-03-28 08:00:00');
            var todayDate = new Date.parse('2015-03-29 04:00:00');

            var r = ch.checkIfDirty(lastCalcDate, todayDate);

            expect(r).toBe(true);
        })

        it('Should by dirty 28/3 08:00 -> 31/3 02:00', function () {

            var lastCalcDate = new Date.parse('2015-03-28 08:00:00');
            var todayDate = new Date.parse('2015-03-31 02:00:00');

            var r = ch.checkIfDirty(lastCalcDate, todayDate);

            expect(r).toBe(true);
        })

        it('Should be clean 28/3 03:01 -> 28/3 20:00', function () {

            var lastCalcDate = new Date.parse('2015-03-28 03:01:00');
            var todayDate = new Date.parse('2015-03-28 20:00:00');

            var r = ch.checkIfDirty(lastCalcDate, todayDate);

            expect(r).toBe(false);
        })

        it('Should be clean 28/3 23:00 -> 29/3 02:00', function () {

            var lastCalcDate = new Date.parse('2015-03-28 23:00:00');
            var todayDate = new Date.parse('2015-03-29 02:00:00');

            var r = ch.checkIfDirty(lastCalcDate, todayDate);

            expect(r).toBe(false);
        })

    });

    describe('Streak calculation', function(){

        Date.prototype.format = function(){
            return this.toString('yyyy-MM-dd HH:mm:ss');
        }

        it('should should count the current streak', function(){

            habit = { ticks: [
                { createdAt: new Date().format() },
                { createdAt: new Date().add(-1).day().format() },
                { createdAt: new Date().add(-2).day().format() }
            ]};

            var streak = ch.newCalcStreak( habit.ticks );
            expect(streak).toBe(3);
        });

        it('should should count the current complex streak (after 00 streaks)', function(){

            habit = { ticks: [
                { createdAt: new Date().format() },
                { createdAt: new Date().set({hour: 2}).format() },
                { createdAt: new Date().add(-2).day().set({hour: 4}).format() },
                { createdAt: new Date().add(-3).day().format() },
                { createdAt: new Date().add(-3).day().set({hour: 2}).format() },
                { createdAt: new Date().add(-4).day().format() },
            ]};
            console.log(habit.ticks);

            var streak = ch.newCalcStreak( habit.ticks );
            expect(streak).toBe(6);
        });


        it('should count streak as 0 if the first tick is not within refDate of today', function(){
            habit = { ticks: [
                { createdAt: new Date().add(-3).day().getTime() },
            ]};

            var streak = ch.newCalcStreak( habit.ticks );
            expect(streak).toBe(0);
        });

        it('should should record 0 streak for empty ticks', function(){
            habit = { ticks: [
            ]};

            var streak = ch.newCalcStreak( habit.ticks );
            expect(streak).toBe(0);
        });

        it('should count the record streak for middle highest streak', function(){
            habit = { ticks: [
                { createdAt: '2014-03-29 23:00:00' },
                { createdAt: '2014-03-28 23:00:00' },
                { createdAt: '2014-03-24 23:00:00' },
                { createdAt: '2014-03-23 23:00:00' },
                { createdAt: '2014-03-22 23:00:00' },
                { createdAt: '2014-03-15 23:00:00' }
            ]};

            var recordStreak = ch.newCalcStreakRecord( habit.ticks );
            expect(recordStreak).toBe(3);
        });

        it('should count the record streak for complex streaks', function(){
            habit = { ticks: [
                { createdAt: '2014-03-29 23:00:00' },
                { createdAt: '2014-03-28 23:00:00' },

                { createdAt: '2014-03-24 23:00:00' },
                { createdAt: '2014-03-23 23:00:00' },
                { createdAt: '2014-03-22 23:00:00' },

                { createdAt: '2014-03-14 23:00:00' },
                { createdAt: '2014-03-13 23:00:00' },
                { createdAt: '2014-03-13 02:00:00' },
                { createdAt: '2014-03-11 23:00:00' }
            ]};

            var recordStreak = ch.newCalcStreakRecord( habit.ticks );
            expect(recordStreak).toBe(4);
        });

        it('should count the record streak for start highest streak', function(){
            habit = { ticks: [
                { createdAt: '2014-03-29 23:00:00' },
                { createdAt: '2014-03-28 23:00:00' },
                { createdAt: '2014-03-24 23:00:00' },
                { createdAt: '2014-03-23 23:00:00' },
                { createdAt: '2014-03-22 23:00:00' },
                { createdAt: '2014-03-15 23:00:00' }
            ]};

            var recordStreak = ch.newCalcStreakRecord( habit.ticks );
            expect(recordStreak).toBe(3);
        });

        it('should count the record streak for end highest streak', function(){
            habit = { ticks: [
                { createdAt: '2014-03-29 23:00:00' },
                { createdAt: '2014-03-28 23:00:00' },
                { createdAt: '2014-03-17 23:00:00' },
                { createdAt: '2014-03-16 23:00:00' },
                { createdAt: '2014-03-16 02:00:00' },
                { createdAt: '2014-03-15 23:00:00' }
            ]};

            var recordStreak = ch.newCalcStreakRecord( habit.ticks );
            expect(recordStreak).toBe(4);
        });

        it('should count the record streak for 1 day gap', function(){
            habit = { ticks: [
                { createdAt: '2014-03-29 23:00:00' },
                { createdAt: '2014-03-28 23:00:00' },
                { createdAt: '2014-03-26 23:00:00' },
                { createdAt: '2014-03-25 23:00:00' },
                { createdAt: '2014-03-25 02:00:00' },
                { createdAt: '2014-03-24 23:00:00' }
            ]};

            var recordStreak = ch.newCalcStreakRecord( habit.ticks );
            expect(recordStreak).toBe(4);
        });

        it('should count the record streak with 1 tick only', function(){
            habit = { ticks: [
                { createdAt: '2014-03-26 23:00:00' }
            ]};


            var recordStreak = ch.newCalcStreakRecord( habit.ticks );
            expect(recordStreak).toBe(1);
        });

        it('should count a single tick as a 1 streak record', function(){
            habit = { ticks: [
                { createdAt: '2014-03-29 23:00:00' }
            ]};

            var recordStreak = ch.newCalcStreakRecord( habit.ticks );
            expect(recordStreak).toBe(1);
        })

        describe('Tick duplication', function(){

            it('should not be treated as separate days if ticked after and before 03.00', function(){
                var habit = {ticks: [
                    {createdAt: new Date().format()}
                ]};

                var r = ch.tickedToday(habit);

                expect(r).toBe(true);
            })

            it('should not be treated as separate days if ticked after and before 03.00', function(){

                // This all depends on when today is you numbnut
                var habit = {ticks: [
                    {createdAt: new Date().set({hour:2}).format()}
                ]};
                var r = ch.tickedToday(habit);

                expect(r).toBe(false);
            })


            it('should detect two ticks as separate strive days', function(){
                var ticks = [
                    { createdAt:'2014-10-12 22:02:43'},
                    { createdAt:'2014-10-12 00:23:20'}
                ];

                var areThey = ch.isTicksOnSameDay(ticks[0], ticks[1]);
                expect(areThey).toBe(false);
            })

            it('should detect two ticks as the same strive days', function(){
                var ticks = [
                    { createdAt:'2014-10-12 22:02:43'},
                    { createdAt:'2014-10-12 03:23:20'}
                ];

                var areThey = ch.isTicksOnSameDay(ticks[0], ticks[1]);
                expect(areThey).toBe(true);
            })

            it('should detect two ticks as long separate strive days', function(){
                var ticks = [
                    { createdAt:'2014-10-12 22:02:43'},
                    { createdAt:'2014-10-09 02:23:20'}
                ];

                var areThey = ch.isTicksOnSameDay(ticks[0], ticks[1]);
                expect(areThey).toBe(false);
            })

        })
    })


})

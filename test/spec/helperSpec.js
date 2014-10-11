describe('StriveHelper', function(){
  var StriveHelper;
  //console.log = function(){};
  beforeEach(module('Strive'));
  beforeEach(inject(function( _StriveHelper_ ){
    StriveHelper = _StriveHelper_;
  }));
  Date.prototype.format = function(){
    return this.toString('yyyy-MM-dd HH:mm:ss');  
  }
  
  it('should should count the current streak', function(){

    habit = { ticks: [
      { createdAt: new Date().format() },
      { createdAt: new Date().add(-1).day().format() },
      { createdAt: new Date().add(-2).day().format() }
    ]};

    var streak = StriveHelper.newCalcStreak( habit.ticks );
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

    var streak = StriveHelper.newCalcStreak( habit.ticks );
    expect(streak).toBe(6);
  });


  it('should count streak as 0 if the first tick is not within refDate of today', function(){
    habit = { ticks: [
      { createdAt: new Date().add(-3).day().getTime() },
    ]};

    var streak = StriveHelper.newCalcStreak( habit.ticks );
    expect(streak).toBe(0);
  });

  it('should should record 0 streak for empty ticks', function(){
    habit = { ticks: [
    ]};

    var streak = StriveHelper.newCalcStreak( habit.ticks );
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

    var recordStreak = StriveHelper.newCalcStreakRecord( habit.ticks );
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

    var recordStreak = StriveHelper.newCalcStreakRecord( habit.ticks );
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

    var recordStreak = StriveHelper.newCalcStreakRecord( habit.ticks );
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

    var recordStreak = StriveHelper.newCalcStreakRecord( habit.ticks );
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

    var recordStreak = StriveHelper.newCalcStreakRecord( habit.ticks );
    expect(recordStreak).toBe(4);
  });

  it('should count the record streak with 1 tick only', function(){
    habit = { ticks: [
      { createdAt: '2014-03-26 23:00:00' }
    ]};


    var recordStreak = StriveHelper.newCalcStreakRecord( habit.ticks );
    expect(recordStreak).toBe(1);
  });

  it('should count a single tick as a 1 streak record', function(){
    habit = { ticks: [
      { createdAt: '2014-03-29 23:00:00' }
    ]};

    var recordStreak = StriveHelper.newCalcStreakRecord( habit.ticks );
    expect(recordStreak).toBe(1);
  })

  describe('Tick duplication', function(){

    it('should not be treated as separate days if ticked after and before 03.00', function(){
      var habit = {ticks: [
        {createdAt: new Date().format()}
      ]};

      var r = StriveHelper.tickedToday(habit);

      expect(r).toBe(true);
    })

    it('should not be treated as separate days if ticked after and before 03.00', function(){

      // This all depends on when today is you numbnut
      var habit = {ticks: [
        {createdAt: new Date().set({hour:2}).format()}
      ]};
      var r = StriveHelper.tickedToday(habit);

      expect(r).toBe(false);
    })
  })


  // it('should count the record streak for end steak', function(){
  //   habit = { ticks: [
  //     { createdAt: new Date().getTime() },
  //     { createdAt: new Date().add(-1).day().getTime() },
  //     { createdAt: new Date().add(-2).day().getTime() },

  //     { createdAt: new Date().add(-10).day().getTime() },
  //     { createdAt: new Date().add(-11).day().getTime() },
  //     { createdAt: new Date().add(-12).day().getTime() },

  //     { createdAt: new Date().add(-18).day().getTime() },
  //     { createdAt: new Date().add(-19).day().getTime() },
  //     { createdAt: new Date().add(-20).day().getTime() },
  //     { createdAt: new Date().add(-21).day().getTime() },
  //     { createdAt: new Date().add(-22).day().getTime() }

  //   ]};

  //   var recordStreak = StriveHelper.calculateStreakRecord( habit );
  //   expect(recordStreak).toBe(5);
  // });

  // it('should count streak record with a close 1 day gap', function(){
  //   habit = { ticks: [
  //     { createdAt: new Date().getTime() },

  //     { createdAt: new Date().add(-2).day().getTime() },
  //     { createdAt: new Date().add(-3).day().getTime() }
  //   ]};

  //   var recordStreak = StriveHelper.calculateStreakRecord( habit );
  //   expect(recordStreak).toBe(2);
  // });

  // it('should count streak record with only one tick', function(){
  //   habit = { ticks: [
  //     { createdAt: new Date().getTime() }
  //   ]};

  //   var recordStreak = StriveHelper.calculateStreakRecord( habit );
  //   expect(recordStreak).toBe(1);
  // });



  // it('should count streak record with an old single streak', function(){
  //   habit = { ticks: [
  //     { createdAt: new Date().add(-3).day().getTime() }
  //   ]};

  //   var recordStreak = StriveHelper.calculateStreakRecord( habit );
  //   expect(recordStreak).toBe(1);
  // });

  // it('should count streak record without any ticks', function(){
  //   habit = { ticks: [

  //   ]};

  //   var recordStreak = StriveHelper.calculateStreakRecord( habit );
  //   expect(recordStreak).toBe(0);
  // });
  
});

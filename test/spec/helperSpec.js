describe('StriveHelper', function(){
  var StriveHelper;
  beforeEach(module('Strive'));
  beforeEach(inject(function( _StriveHelper_ ){
    StriveHelper = _StriveHelper_;
  }));

  it('should should count the current streak', function(){
    habit = { ticks: [
      { createdAt: new Date().getTime() },
      { createdAt: new Date().add(-1).day().getTime() },
    ]};

    var streak = StriveHelper.calculateStreak( habit.ticks );
    expect(streak).toBe(2);
  });

  it('should count the record streak for first steak', function(){
    habit = { ticks: [
      { createdAt: new Date().getTime() },
      { createdAt: new Date().add(-1).day().getTime() },
      { createdAt: new Date().add(-2).day().getTime() },

      { createdAt: new Date().add(-10).day().getTime() },
      { createdAt: new Date().add(-11).day().getTime() }
    ]};

    var recordStreak = StriveHelper.calculateStreakRecord( habit );
    expect(recordStreak).toBe(3);
  });

  it('should count the record streak for middle steak', function(){
    habit = { ticks: [
      { createdAt: new Date().getTime() },
      { createdAt: new Date().add(-1).day().getTime() },
      { createdAt: new Date().add(-2).day().getTime() },

      { createdAt: new Date().add(-10).day().getTime() },
      { createdAt: new Date().add(-11).day().getTime() },
      { createdAt: new Date().add(-12).day().getTime() },
      { createdAt: new Date().add(-13).day().getTime() },
      { createdAt: new Date().add(-14).day().getTime() },

      { createdAt: new Date().add(-20).day().getTime() },
      { createdAt: new Date().add(-21).day().getTime() },
      { createdAt: new Date().add(-22).day().getTime() },

    ]};

    var recordStreak = StriveHelper.calculateStreakRecord( habit );
    expect(recordStreak).toBe(5);
  });

  it('should count the record streak for end steak', function(){
    habit = { ticks: [
      { createdAt: new Date().getTime() },
      { createdAt: new Date().add(-1).day().getTime() },
      { createdAt: new Date().add(-2).day().getTime() },

      { createdAt: new Date().add(-10).day().getTime() },
      { createdAt: new Date().add(-11).day().getTime() },
      { createdAt: new Date().add(-12).day().getTime() },

      { createdAt: new Date().add(-18).day().getTime() },
      { createdAt: new Date().add(-19).day().getTime() },
      { createdAt: new Date().add(-20).day().getTime() },
      { createdAt: new Date().add(-21).day().getTime() },
      { createdAt: new Date().add(-22).day().getTime() }

    ]};

    var recordStreak = StriveHelper.calculateStreakRecord( habit );
    expect(recordStreak).toBe(5);
  });

  it('should count streak record with a close 1 day gap', function(){
    habit = { ticks: [
      { createdAt: new Date().getTime() },

      { createdAt: new Date().add(-2).day().getTime() },
      { createdAt: new Date().add(-3).day().getTime() }
    ]};

    var recordStreak = StriveHelper.calculateStreakRecord( habit );
    expect(recordStreak).toBe(2);
  });

  it('should count streak record with only one tick', function(){
    habit = { ticks: [
      { createdAt: new Date().getTime() }
    ]};

    var recordStreak = StriveHelper.calculateStreakRecord( habit );
    expect(recordStreak).toBe(1);
  });


  it('should count streak record with an old single streak', function(){
    habit = { ticks: [
      { createdAt: new Date().add(-3).day().getTime() }
    ]};

    var recordStreak = StriveHelper.calculateStreakRecord( habit );
    expect(recordStreak).toBe(1);
  });

  it('should count streak record without any ticks', function(){
    habit = { ticks: [

    ]};

    var recordStreak = StriveHelper.calculateStreakRecord( habit );
    expect(recordStreak).toBe(0);
  });
});

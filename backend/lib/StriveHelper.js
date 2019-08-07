/**
 * Ticked on the same day refers to either the same day
 * or previous days but before 03.00
 */
module.exports.isTicksOnSameDay = function(tick1, tick2) {
	var d1 = new Date(tick1.createdAt);
	var d2 = new Date(tick2.createdAt);

	if (d1.getMonth() != d2.getMonth()) {
		return false;
	} else if (d1.getFullYear() != d2.getFullYear()) {
		return false;
	}
	var d1Date = d1.getDate();
	var d2Date = d2.getDate();
	var d1Hour = d1.getHours();
	var d2Hour = d2.getHours();

	if (Math.abs(d2Date - d1Date) > 1) return false;
	if (d1Date == d2Date) {

		// We know they are on the same date - but are they 
		// within range of one another?
		if (d1Hour < 3) {

			// only one day can be ticked before three
			// for it to count as separate days
			if (d2Hour < 3) {
				return true;
			} else {
				return false;
			}

			// D1 is ticked after 03.00
		} else {

			// THey are both over 03.00 - means they are on the
			// same day
			if (d2Hour >= 3) {
				return true;
			} else {
				return false;
			}
		}
	} else {

		// We know they are on different dates - but they
		// could still be on the same strive day. For that
		// to happen the one of the lower date must be ticked
		// after 03.00 and the one of the higher date must
		// be ticked before 03.00
		if (d1Date > d2Date) {
			if (d2Hour >= 3 && d1Hour < 3) {
				return true
			} else {
				return false;
			}
		} else {
			if (d1Hour >= 3 && d2Hour < 3) {
				return true
			} else {
				return false;
			}
		}
	}
}

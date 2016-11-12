
function _StriveHelper(){

	this.getStreakIcon = function getStreakIcon( streak ){

		if( streak >= 100 ){
			return 'gold';
		}else if( streak >= 50 ){
			return 'orange';
		}else if( streak >= 20 ){
			return 'purple';
		}else if( streak >= 7 ){
			return 'blue';
		}else if( streak >= 3){
			return 'green';
		}else if( streak >= 0){
			return 'gray';
		}
	}
}

if( typeof angular != 'undefined' ){
	Strive.service('StriveHelper', _StriveHelper);
}

vocabulary = {
	curr: {
		ord: function(num, texts) {
			switch(num%100)
			{
				case 11:
				case 12:
				case 13: return 'th';
				default:
					switch(num%10)
					{
						case 1: return 'st';
						case 2: return 'nd';
						case 3: return 'rd';
						default: return 'th';
					}
			}
		},
		num: function(num, texts) { if (num == 1) return texts[0]; else return texts[1]; },
		look: 'Look!',
		seconds: '%n %t!|second/seconds',
		passed: 'Done!',
		passCards: 'Pass %n %t.|card/cards',
		cardNum: '%n%t card',
		restartTimer: 'Restart this timer',
		skipTimer: 'Skip this timer'
	},
	ru: {
		ord: function(num, texts) { return texts[0]; },
		num: function(num, texts) {
			switch (num%100)
			{
				case 11:
				case 12:
				case 13:
				case 14: return texts[2];
				default:
					switch(num%10)
					{
						case 1: return texts[0];
						case 2:
						case 3:
						case 4: return texts[1];
						default: return texts[2];
					}

			}
		}
	},
	cn: {
		ord: function(num, texts) { return texts[0]; },
		num: function(num, texts) { return texts[0]; }
	},
	pt: {
		ord: function(num, texts) { return texts[0]; },
		num: function(num, texts) { return texts[0]; }
	}
};
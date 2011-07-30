localFunctions = {
	nl: {
		ord: function(num, texts) { return num+'e '+texts[0] },
		num: function(num, texts) { if (num == 1) return num+' '+texts[0]; else return num+' '+texts[1]; },
	},
	en: {
		ord: function(num, texts) {
			switch(num%100)
			{
				case 11:
				case 12:
				case 13: return num+'th';
				default:
					switch(num%10)
					{
						case 1: return num+'st';
						case 2: return num+'nd';
						case 3: return num+'rd';
						default: return num+'th';
					}
			}
		},
		num: function(num, texts) { if (num == 1) return num+' '+texts[0]; else return num+' '+texts[1]; },
	},
	ru: {
		ord: function(num, texts) { return num+texts[0]; },
		num: function(num, texts) {
			switch (num%100)
			{
				case 11:
				case 12:
				case 13:
				case 14: return num+' '+texts[2];
				default:
					switch(num%10)
					{
						case 1: return num+' '+texts[0];
						case 2:
						case 3:
						case 4: return num+' '+texts[1];
						default: return num+' '+texts[2];
					}

			}
		}
	},
	is: {
		ord: function(num, texts) { return num+'. '+texts[0]; },
		num: function(num, texts) {
			if (num%10 == 1 && num != 11) return num+' '+texts[0];
			return num+' '+texts[1];
		}
	},
	lt: {
		ord: function(num, texts) { return num+texts[0]; },
		num: function(num, texts) {
			if (num%10 == 1 && num != 11) return num+' '+texts[0];
			if (num%10 == 0 || (num%100 > 10 && num%100 < 20)) return num+' '+texts[2];
			return num+' '+texts[1];
		}
	}
};

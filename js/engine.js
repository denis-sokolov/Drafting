//      This program is free software; you can redistribute it and/or modify
//      it under the terms of the GNU General Public License as published by
//      the Free Software Foundation; either version 3 of the License, or
//      (at your option) any later version.
//
//      This program is distributed in the hope that it will be useful,
//      but WITHOUT ANY WARRANTY; without even the implied warranty of
//      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//      GNU General Public License for more details.
//
//      You should have received a copy of the GNU General Public License
//      along with this program; if not, see: <http://www.gnu.org/licenses/>
constants = {
	tick: 250,
};

$(document).ready(function(){
	debug.setup();
	settings.setup();
	settings.load();
	controls.setup();
	navigation.first();
	$('.loading').hide();
});


debug = {
	state: false,
	on: function() { this.state = true; },
	off: function() { this.state = false; },
	setup: function(){
		if (this.state)
		{
			$('body').addClass('debug').append('<div class="debugMessage">Debug mode is on.'
				+' <a>Turn off.</a></div>');
			$('.debugMessage a').click(function(){
				$(this).parent().hide('slow');
				debug = false;
			});
		}
	}
}

vocabulary = (function(){
	var voc = {}
	// Let's find "(N card/cards)" pattern.
	var reg = /\(N([^\)]*)\)/;
	$('#vocabulary').children().each(function(){
		var me = $(this);
		var t = me.text();
		var name = me.attr('title');
		if (t.indexOf('(N') < 0)
		{ // Do not engage regexp, indexOf is faster
			if (name == 'langCode' && t == '[lang-code]')
			{
				t = 'en';
				debug.on();
			}
			voc[name] = t;
		}
		else
		{
			voc[name] = [
				t.replace(reg, '(N)'), // Remove regex for an easy win
				reg.exec(t)[1].split('/') // Store all the possibilities
			];
		}
	});

	return {
		'get': function(par){ return voc[par]; },
		'numerify': function(par, number) {
			return voc[par][0].replace('(N)',
				localFunctions[voc['langCode']].num(number, voc[par][1]));
		},
		'ordify': function(par, number) {
			return voc[par][0].replace('(N)',
				localFunctions[voc['langCode']].ord(number, voc[par][1]));
		}
	}
}());

controls = {
	keyboard: function() {
		$('html').keypress(function (e) {
			if (e.which == 32) // space
			{
				switch (e.target.tagName.toLowerCase())
				{
					case 'input': break;
					case 'a': $(e.target).click(); break;
					default:
						if ($('#end.current, .current.freeze').length < 1)
							navigation.next();
					break;
				}
			}
		});
	},

	mouse: function() {
		$('button').unbind('mouseup').mouseup(function(){
			if ($('.current.freeze').length < 1)
				navigation.next();
		});
	},

	internalLinks: function() {
		$('a[href^="#"]').click(function(e){
			e.preventDefault();
			navigation.show($($(this).attr('href')));
		});
	},

	setup: function() {
		this.keyboard();
		this.mouse();
		this.internalLinks();
	},
}

navigation = {
	first: function() { this.show(); },
	prev: function() { this.show($('#steps li.current').prev()); },
	curr: function() { this.show($('#steps li.current')); },
	next: function() { this.show($('#steps li.current').next()); },

	show: function(me) {
		timers.stop();
		me = this.getMe(me);

		if (me.attr('id') == 'begin')
			preparation.run();

		$('.current').removeClass('current');
		me.addClass('current')
			.find('button').focus();

		// If this is timered
		if (me.find('var').length)
		{
			me
				// Disallow continuing before the timer runs out
				.addClass('freeze')
				.find('button').css('opacity', 0).end()
				.find('.timerControls .skip').show() // Show the hidden skip
				;

			var delay = 0;
			if (me.find('.pre').length)
			{
				delay = me.find('.pre').attr('title')*1000;
				me.find('.pre').animate({opacity: 0}, delay + 1000);
			}

			// Set timer to make a delay
			timers.set(function(me){
				var timeDisplay = me.find('var');
				step.timerHelper.element = timeDisplay;
				timeDisplay.data('finished', me.find('samp').text());
				var timeout = timeDisplay.attr('title') * 1000;

				me.find('p').each(function(){
					var me = $(this)
					if (me.hasClass('pulse'))
					{
						timers.set(function(el){
							el.css('visibility', 'visible').animate({opacity: 0}, 3000);
							}, timeout - me.attr('title')*1000, me);

						// 1 second in advance, because sounds lag
						if (settings.get('s-sounds'))
							timers.set(function(){
								sounds.play('almostTime');
							}, timeout - me.attr('title')*1000 - sounds.lag);
					}
				});

				if (settings.get('s-sounds'))
					timers.set(function(){sounds.play('time');}, timeout - sounds.lag);

				step.timerHelper(timeout);

				me.find('var').add('.timerControls', me).add('.info', me).css('visibility', 'visible');

			}, delay, me);
		}
	},

	// Internal
	getMe: function(me) {
		if (typeof me == 'undefined' || typeof me.length == 'undefined' || me.length < 1)
			me = $('#steps li').eq(0);
		return me;
	}
};

sounds = {
	play: function(name) {
		$('<embed src="'+this.getSrc(name)+'" style="position:absolute;top:-500px;left:-500px" class="sound" hidden="true" autostart="true">')
			.appendTo('body');
	},
	stop: function(name) {
		if (typeof name == 'undefined')
			$('embed.sound').remove();
		else
			$('embed[src="'+this.getSrc(name)+'"].sound').remove();
	},
	getSrc: function(name) {
		return 'sounds/'+name+'.ogg';
	},

	// The time between call of sounds.play and the actual sound playing.
	lag: 500,

	test: function(callback) {
		$('<img src="sounds/sounds.png" style="display:none">')
			.load(function(){
				$(this).remove();
				callback(true);
			})
			.error(function(){
				$(this).remove();
				callback(false);
			})
			.appendTo('body');
	}
}

step = {
	timerHelper: function(remaining) {
		if (remaining <= 0)
		{
			step.timerHelper.element.text(step.timerHelper.element.data('finished'));
			step.timerHelper.element.parent()
				.removeClass('freeze')
				.find('button').show()
					.animate({opacity: 1}, 1000).focus()
					.end()
				.find('.timerControls .skip').fadeOut();


			return;
		}
		step.timerHelper.element.text((remaining/1000).toFixed(1));
		timers.set(step.timerHelper, constants.tick, (remaining-constants.tick));
	}
};

timers = {
	data: [],
	set: function(f,d,a) { timers.data.push(setTimeout(f,d,a)); },
	stop: function() {
		var b;
		while (b = this.data.pop())
			clearTimeout(b);
	}
};


preparation = {
	run: function() {
		settings.save();
		settings.close();
		this.templates();
		this.timers();
		// Setting the texts in the engine
		for (var i=1;i<4;++i)
			$('.var-set'+i).text('‘'+settings.get('s-set'+i)+'’');
	},

	templates: function(){
		/* Simple Booster */
		var content = $('<div/>');
		var step = $('#templates .simpleBoosterStep');
		var simpleBooster = [40, 35, 30, 25, 25, 20, 20, 15, 10, 10, 5, 5, 5];
		var cardsInBooster = 14;

		$(simpleBooster).each(function(no){
			var result = $('<li class="timer"/>');
			result.append(step.clone().children());

			var warn = 10;
			if (settings.get('s-5seconds') || (this < 15))
				warn = 5;
			if (this < 10) warn = 0;

			result.find('var').text(Number(this));
			result.find('samp').text(vocabulary.numerify('passCards', cardsInBooster-1-no));
			result.find('.info .card').text(vocabulary.ordify('cardNumber', no+1))

			if (warn > 0)
				result.find('.pulse').attr('title', warn).text(vocabulary.get(warn + 'seconds'));
			else
				result.find('.pulse').remove();

			content.append(result);
		});

		$('li.simpleBooster').each(function(){
			var me = $(this);
			var t = content.clone().children();
			t.find('.info .booster').text(me.attr('title'));
			me.after(t);
			me.remove();
		});
		/* Simple Booster end */
	},

	timers: function(){
		/* Timers */
		$('var').each(function(){
			var me = $(this);
			me.attr('title',me.text() + '.0');
			me.parents('li').addClass('timer');
		});

		$('li var').parent().append('<p class="timerControls">'
			+'<a href="" class="restart">'
			+ vocabulary.get('restartTimer') + '</a> '
			+'<a href="" class="skip">'
			+ vocabulary.get('skipTimer') +'</a>'
			+'</p>');
		$('.timerControls')
			.find('.restart').click(function(e){
				e.preventDefault();
				timers.stop();
				$(this).parents('li')
					.fadeOut(function(){
						var me = $(this);
						me
							.find('var').text(me.find('var').attr('title')).end()
							.fadeIn();
						navigation.curr();
					});
			}).end()
			.find('.skip').click(function(e){
				e.preventDefault();
				timers.stop();
				$(this).parents('ul')
					.fadeOut('fast', function(){
						$(this).fadeIn();
						navigation.next();
					});
			});
		controls.mouse();
	}
};

// Don't forget! Limit of 20 cookies per user.
settings = {
	setup: function(){
		$('#s-sounds')
			.hover(function(){ $(this).trigger('focus') })
			.attr('disabled', false)
			.focus(function(){
				sounds.test(function(sounds){
					console.log('called back with', sounds);
					if (!sounds)
					{
						$('#soundsNotFound').show('fast');
						$('#s-sounds').prop('checked', false).attr('disabled', true);
					}
				});
			})
			.blur(function(){
				$('#soundsNotFound').hide('fast');
			});
		$('#s-set1, #s-set2, #s-set3').autocomplete(sets, {
			minChars: 0,
			max: 20,
			autoFill: true,
			mustMatch: true,
			matchContains: false,
			scrollHeight: 220,
		});
	},
	get: function(k){
		if (this.live)
			return this.getElementsValue($('#'+k));
		else
			return this.cache[k];
	},
	set: function(k, v){
		if (!this.live)
			console.warn('settings.set was called, but settings are not live!');
		return this.setElementsValue($('#'+k), v);
	},
	close: function(){
		this.live = false;
		$('#settings')
			.find('input', 'select').each(function(){
				var me = $(this);
				settings.cache[me.attr('id')]
					= settings.getElementsValue(me);
			});
	},
	save: function(){
		$('#settings')
			.find('input, select').each(function(){
				var me = $(this);
				if (typeof localStorage != 'undefined')
					localStorage[me.attr('id')] = settings.getElementsValue(me);
			});
	},
	load: function(){
		$('#settings')
			.find('input, select').each(function(){
				var me = $(this);
				if (typeof localStorage != 'undefined')
				{
					var v = localStorage[me.attr('id')];
					if (v !== null)
						settings.setElementsValue(me, v);
				}
			});
	},

	// protected below
	live: true,
	cache: {},

	getElementsValue: function(me){
		switch (me.prop('type'))
		{
			case 'checkbox':
				return !me.prop('disabled') && me.prop('checked');
			case 'text':
			case 'hidden':
				return me.val();
			default:
				return null;
		}
	},
	setElementsValue: function(me, v){
		switch (me.prop('type'))
		{
			case 'checkbox':
				me.prop('checked',v == 'true');
				return v;
			case 'text':
			case 'hidden':
				me.val(v);
				return v;
			default:
				return null;
		}
	}
}


/*
 * Though taken from the Quirks Mode, I think it is too trivial to be
 * 	copyrighted.
 * http://www.quirksmode.org/js/cookies.html
 * */
cookies = {
	set: function(name, value, days) {
		if (days == 'max')
			days = 365;
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	},

	get: function (name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0)
			{
				var r = c.substring(nameEQ.length,c.length);
				if (r === 'false')
					return false;
				if (r === 'true')
					return true;
				return r;
			}
		}
		return null;
	},

	unset: function(name) {
		this.set(name,"",-1);
	}
}

String.prototype.numerify = function(num)
{
	return o(this, num, 'num');
}

String.prototype.ordify = function(num)
{
	return o(this, num, 'ord');
}

function o(str, num, callback)
{
	var tkns = str.split('|');
	var data = [];
	if (typeof tkns[1] != 'undefined')
		 data = tkns[1].split('/');
	return tkns[0]
				.replace('%n', num)
				.replace('%t', vocabulary.curr[callback](num, data));
}

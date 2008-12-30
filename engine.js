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
	controls.setup();
	settings.load();
	navigation.first();
	$('.loading').hide();
});

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
			show($($(this).attr('href')));
		});
	},

	setup: function() {
		this.keyboard();
		this.mouse();
		this.internalLinks();
	},
}

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
							},
							timeout - me.attr('title')*1000, me);
						}
				});

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
		this.templates();
		this.timers();
		// Setting the texts in the engine
		if (settings.get('s-14cardPack'))
			$('.v-cardsInBooster').text('14');
		for (var i=1;i<4;++i)
			$('.v-set'+i).text('‘'+settings.get('s-set'+i)+'’');
	},

	templates: function(){
		/* Template steps */
		$('li.simpleBooster').each(function(){
			var me = $(this);
			var content = '';
			var boosterTitle = me.attr('title');
			var simpleBooster = [35, 35, 35, 25, 25, 25, 20, 20, 20, 10, 10, 5, 5, 5];

			if ($('#s-14cardPack').attr('checked'))
				simpleBooster.shift();

			//$([5]).each(function(no){
			$(simpleBooster).each(function(no){
				var warn = 10;
				if (this < 15) warn = 5;
				if (this < 10) warn = 0;
				content += '<li class="timer">'
					+'<p class="pre" title="1">Look!</p><var>'+this+'</var>';
				if (warn > 0)
					content += '<p class="pulse" title="'+warn+'">'+warn+' seconds!</p>';
				content += '<samp>Pass '+(14-no)+' card'+(no<13?'s':'')+'.</samp><button>Done.</button>'
				+'<p class="info">Card '+(no+1)+'<br>'+boosterTitle+'</p>'
				+'</li>';
			});
			me.after(content);
			me.remove();
			return;
		});
	},

	timers: function(){
		/* Timers */
		$('var').each(function(){
			var me = $(this);
			me.attr('title',me.text() + '.0');
			me.parents('li').addClass('timer');
		});

		$('li var').parent().append('<p class="timerControls">'
			+'<a href="" class="restart">Restart this timer</a> '
			+'<a href="" class="skip">Skip this timer</a>'
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

// Limit of 20 cookies
settings = {
	get: function(k){
		var me = $('#'+k);
		switch (me.attr('type'))
		{
			case 'checkbox':
				return me.attr('checked');
			case 'text':
				return me.val();
		}

	},
	set: function(k, v){
		var me = $('#'+k);
		switch (me.attr('type'))
		{
			case 'checkbox':
				me.attr('checked',v);
				return v;
			case 'text':
				me.val(v);
				return v;
		}
	},

	save: function(){
		$('#settings')
			.find('input, select').each(function(){
				var id = $(this).attr('id');
				cookies.set(id, settings.get(id), 'max');
			});
	},
	load: function(){
		$('#settings')
			.find('input, select').each(function(){
				var id = $(this).attr('id');
				var v = cookies.get(id);
				if (v !== null)
					settings.set(id, v);
			});
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
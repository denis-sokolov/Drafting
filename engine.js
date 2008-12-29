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
window.constants = {
	tick: 250,
};

$(document).ready(function(){
	if (typeof window.debug == 'undefined')
		window.debug = false;
	if (window.debug)
	{
		$('body').addClass('debug').append('<div class="debugMessage">Debug mode is on.'
			+' <a>Turn off.</a></div>');
		$('.debugMessage a').click(function(){
			$(this).parent().hide('slow');
			window.debug = false;
		});
	}

	/* Movement events */
		$('html').keypress(function (e) {
			if (e.which == 32) // space
			{
				switch (e.target.tagName.toLowerCase())
				{
					case 'input': break;
					case 'a': $(e.target).click(); break;
					default:
						if ($('#end.current').length < 1)
							next();
					break;
				}
			}
		});
		$('button').mouseup(next);

		$('a[href^="#"]').click(function(e){
			e.preventDefault();
			show($($(this).attr('href')));
		});

	$('.loading').hide();
	window.settings.load();
	next();
});

function prev()
{
	var me, curr;

	curr = $('#steps li.current');
	if (curr.length)
	{
		curr.removeClass('current');
		me = curr.prev();
	}
	else
		me = $('#steps li').eq(0);
	show(me);
}

function curr()
{
	var me = $('#steps li.current');
	if (!me.length)
		me = $('#steps li').eq(0);
	show(me);
}

function next()
{
	var me, curr;

	curr = $('#steps li.current');
	if (curr.length)
	{
		curr.removeClass('current');
		me = curr.next();
	}
	else
		me = $('#steps li').eq(0);
	show(me);
}

function show(me)
{
	$('li').removeClass('current');
	stopTimers();

	if (me.attr('id') == 'begin')
		prepareDraft();

	me.addClass('current');
	if (me.find('button').length)
		me.find('button').focus();
	if (me.find('var').length)
	{
		me.find('button').css('opacity', 0).attr('disabled', 'disabled');

		var delay = 0;
		if (me.find('.pre').length)
		{
			delay = me.find('.pre').attr('title')*1000;
			me.find('.pre').animate({opacity: 0}, delay + 1000);
		}

		// Set timer to make a delay
		setTimer(function(me){
			var timeDisplay = me.find('var');
			timerHelper.element = timeDisplay;
			timeDisplay.data('finished', me.find('samp').text());
			var timeout = timeDisplay.attr('title') * 1000;

			me.find('p').each(function(){
				var me = $(this)
				if (me.hasClass('pulse'))
				{
					setTimer(function(el){
						el.css('visibility', 'visible').animate({opacity: 0}, 3000);
						},
						timeout - me.attr('title')*1000, me);
					}
			});

			timerHelper(timeout);

			me.find('var').add('.timerControls', me).add('.info', me).css('visibility', 'visible');

		}, delay, me);
	}
}

function timerHelper(remaining)
{
	if (remaining <= 0)
	{
		timerHelper.element.text(timerHelper.element.data('finished'));
		timerHelper.element.parent()
			.find('button').show()
				.attr('disabled','')
				.animate({opacity: 1}, 1000).focus()
				.end()
			.find('.timerControls .skip').fadeOut();


		return;
	}
	timerHelper.element.text((remaining/1000).toFixed(1));
	setTimer(timerHelper, window.constants.tick, (remaining-window.constants.tick));
}


function setTimer(f,d,a)
{
	//console.debug('Setting timer for ', f, ' in ', d, ' with args ', a);
	var id = setTimeout(f,d,a);
	if (typeof setTimer.place == 'undefined')
		setTimer.place = [];
	setTimer.place.push(id);
}

function stopTimers()
{
	var b;
	if (typeof setTimer.place == 'undefined')
		return;
	while (b = setTimer.place.pop())
		clearTimeout(b);
}



function templates()
{
	/* Template steps */
	$('li.simpleBooster').each(function(){
		var me = $(this);
		var content = '';
		var boosterTitle = me.attr('title');
		var simpleBooster = [35, 35, 35, 25, 25, 25, 20, 20, 20, 10, 10, 5, 5, 5];

		if ($('#setting-14cardPack').attr('checked'))
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
}

function prepareDraft()
{
	window.settings.save();
	templates();
	timers();
	// Setting the texts in the engine
	if (window.settings.get('setting-14cardPack'))
		$('.cardsInBooster').text('14');
}

function timers()
{
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
			stopTimers();
			$(this).parents('li')
				.fadeOut(function(){
					var me = $(this);
					me
						.find('var').text(me.find('var').attr('title')).end()
						.fadeIn();curr();
				});
		}).end()
		.find('.skip').click(function(e){
			e.preventDefault();
			stopTimers();
			$(this).parents('ul')
				.fadeOut('fast', function(){
					$(this).fadeIn();
					next();
				});
		});
	$('button').unbind('mouseup').mouseup(next);
}

// Limit of 20 cookies
window.settings = {
	get: function(k){
		var me = $('#'+k);
		if (me.attr('type') == 'checkbox')
		{
			return me.attr('checked');
		}
	},
	set: function(k, v){
		var me = $('#'+k);
		if (me.attr('type') == 'checkbox')
		{
			me.attr('checked',v);
			return v;
		}
	},

	save: function(){
		$('#settings')
			.find('input, select').each(function(){
				var id = $(this).attr('id');
				window.cookies.set(id, window.settings.get(id), 'max');
			});
	},
	load: function(){
		$('#settings')
			.find('input, select').each(function(){
				var id = $(this).attr('id');
				window.settings.set(id, window.cookies.get(id));
			});
	}
}


/*
 * Though taken from the Quirks Mode, I think it is too trivial to be
 * 	copyrighted.
 * http://www.quirksmode.org/js/cookies.html
 * */
window.cookies = {
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
				if (r == 'false')
					return false;
				if (r == 'true');
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
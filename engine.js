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

	/* Template steps */
		$('li.simpleBooster').each(function(){
			var me = $(this);
			var content = '';
			//$([5]).each(function(no){
			$([35, 35, 35, 25, 25, 25, 20, 20, 20, 10, 10, 5, 5, 5]).each(function(no){
				var warn = 10;
				if (this < 15) warn = 5;
				if (this < 10) warn = 0;
				content += '<li class="timer"><p class="pre" title="1">Look!</p><var>'+this+'</var>';
				if (warn > 0)
					content += '<p class="pulse" title="'+warn+'">'+warn+' seconds!</p>';
				content += '<samp>Pass '+(14-no)+' card'+(no<13?'s':'')+'.</samp><button>Done.</button></li>';
			});
			me.after(content);
			me.remove();
			return;
		});

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


	/* Movement events */
		$('html').keypress(function (e) {
			if (e.which == 32)
				next();
		});
		$('button').mouseup(next);

		$('a[href^="#"]').click(function(e){
			e.preventDefault();
			show($($(this).attr('href')));
		});

	$('.loading').hide();
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

			me.find('var').add('.timerControls', me).css('visibility', 'visible');

		}, delay, me);
	}
}

function timerHelper(remaining)
{
	if (remaining <= 0)
	{
		timerHelper.element.text(timerHelper.element.data('finished'));
		timerHelper.element.parent().find('button').show().attr('disabled','').animate({opacity: 1}, 1000).focus();
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

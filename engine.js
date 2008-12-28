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

	$('li.simpleBooster').each(function(){
		var me = $(this);
		var content = '';
		$([35, 35, 35, 25, 25, 25, 20, 20, 20, 10, 10, 5, 5, 5]).each(function(no){
			var warn = 10;
			if (this < 15) warn = 5;
			if (this < 10) warn = 0;
			content += '<li><p class="pre" title="1">Look!</p><var>'+this+'</var>';
			if (warn > 0)
				content += '<p class="pulse" title="'+warn+'">'+warn+' seconds!</p>';
			content += '<samp>Pass '+(14-no)+' card'+(no<13?'s':'')+'.</samp><button>Done.</button></li>';
		});
		me.after(content);
		me.remove();
		return;
	});


	$('button').click(next);
	$('.loading').hide();

	next();


	$('a[href^="#"]').click(function(e){
		e.preventDefault();
		show($($(this).attr('href')));
	});
});

function next()
{
	var me, prev;

	prev = $('#steps li.current');
	if (prev.length)
	{
		prev.removeClass('current');
		me = prev.next();
	}
	else
		me = $('#steps li').eq(0);
	show(me);
}

function show(me)
{
	$('li').removeClass('current');
	me.addClass('current');
	if (me.find('button').length)
		me.find('button').focus();
	if (me.find('var').length)
	{
		me.find('button').css('opacity', 0).hide();

		if (window.debug)
		{
			me.find('button')
				.text(
						'['
							+ me.find('samp').text()
						+ '] '
						+ me.find('button').text()
					)
				.animate({opacity:1},2000)
				.click(function(){
					clearTimeout(theTimer.intervalRunner);
					stopTimers();
				});
		}


		var delay = 0;
		if (me.find('.pre').length)
		{
			delay = me.find('.pre').attr('title')*1000;
			me.find('.pre').animate({opacity: 0}, delay + 1000);
		}
		if (typeof next.timer != 'undefined')
			clearTimeout(next.timer);
		next.timer = setTimeout(function(){
			theTimer(me.find('var'), me.parent().find('p'));
			me.find('var').css('visibility', 'visible');
		}, delay);
	}
}

theTimer.interval = 250;
function theTimer(element, sides)
{
	theTimer.element = element;
	theTimer.element.data('finished', $(element).parent().find('samp').text());
	var time = new Date().getTime();
	var interval = $(element).text();

	theTimerHelper1(interval*1000);

	sides.each(function(){
		me = $(this)
		if (me.hasClass('pulse'))
		{
			var i = (interval-me.attr('title'))*1000;
			keepTimer(setTimeout(function(el){
				el.css('visibility', 'visible').animate({opacity: 0}, 3000);
				} ,i, me));
		}
	});
}

	function theTimerHelper1(remaining)
	{
		if (remaining <= 0)
		{
			theTimer.element.text(theTimer.element.data('finished'));
			theTimer.element.parent().find('button').show().animate({opacity: 1}, 1000).focus();
			return;
		}
		theTimer.element.text((remaining/1000).toFixed(1));
		theTimer.intervalRunner = setTimeout(theTimerHelper1, theTimer.interval, (remaining-theTimer.interval));
	}
	function theTimerHelper2()
	{
		clearTimeout(theTimer.intervalRunner);
	}


function keepTimer(id)
{
	if (typeof keepTimer.place == 'undefined')
		keepTimer.place = [];
	keepTimer.place.push(id);
}

function stopTimers()
{
	var b;
	if (typeof keepTimer.place == 'undefined')
		return;
	while (b = keepTimer.place.pop())
		clearTimeout(b);
}

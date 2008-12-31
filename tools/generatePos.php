<?php
$debug = false;

$output = '# Magic drafting application language file
#

';

$strs = array_merge(
	stringFinder::find('../drafting.html'),
	stringFinder::find('../lang/default.js'));

foreach ($strs as $k => $v)
{
	$output .= '#: ' . $k . PHP_EOL;
	$output .= 'msgid "' . $v . '"' . PHP_EOL;
	$output .= 'msgstr ""' . PHP_EOL;
	$output .= PHP_EOL;
}

if ($debug)
	header('Content-Type: text/plain; charset=utf-8');
else
{
	header('Content-Length: '.strlen($output));
	header('Content-Disposition: attachment; filename="drafting.po"');
	header('Content-Transfer-Encoding: binary');
	header('Content-Type: application/force-download');

	header('Cache-control: private', false);
	header('Pragma: private');
	header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
}


echo $output;

class stringFinder
{
	public static function find($file)
	{
		$ext = pathinfo($file, PATHINFO_EXTENSION);
		switch ($ext)
		{
			case 'html':
				return self::html($file);
			case 'js':
				return self::js($file);
			default:
				trigger_error('No. :(', E_USER_ERROR);
				return false;
		}
	}

	public static function html($file)
	{
		$html = file_get_contents($file);
		return self::html_subset($html);
	}

	protected static function html_subset($html)
	{
		$matches = self::html_subset_regex('c', $html);
		$r = array();
		foreach ($matches as $m)
		{
			$tag = $m[3];
			$title = $m[5];
			$content = $m[6];
			$r['c-' . $tag] = clean($content);
			$r = array_merge($r, self::html_subset($content));
		}

		$matches = self::html_subset_regex('t', $html);
		foreach ($matches as $m)
		{
			$tag = $m[3];
			$title = $m[5];
			$content = $m[6];
			$r['t-' . $tag] = clean($title);
			$r = array_merge($r, self::html_subset($content));
		}
		return $r;
	}
	protected static function html_subset_regex($modifier, $html)
	{
		// OMF SHIT WTF IT WORKS I AM DA MASTER OF REGEXP!
		preg_match_all('@<([^ ]+) #tag name
						\ 		# space!
						[^<>]*? # other attributes
						class="
							[^"]*?	#other classes
							(v'.$modifier.'
								-
								([^" ]+) #tag
							)
							[^"]*
						"	#class attribute ends
						[^>]*? # other attributes
						(
							title="([^"]+)"
							[^>]*
						)? #optional title attribute
						>
						(.+?) #tag contents
					</\1 #closing tag
					@sx', $html, $matches, PREG_SET_ORDER);
		return $matches;
	}

	public static function js($file)
	{
		$js = file_get_contents($file);
		$r = array();
		preg_match_all('@^\s*([a-zA-Z0-9]+)\s*:\s*\'(.+)\'\s*,?\s*$@m', $js, $matches, PREG_SET_ORDER);
		foreach ($matches as $m)
			$r['j-'.$m[1]] = str_replace('\\\'', "'", $m[2]);
		return $r;
	}
}


function clean($s)
{
	$s = trim($s);
	$s = preg_replace('/\s{2,}/',' ', $s);
	return $s;
}
<?php
$debug = false;

if ($debug)
	header('Content-Type: text/plain; charset=utf-8');
else
{
	header('Content-Length: '.strlen($output));
	header('Content-Disposition: attachment; filename="extra.js"');
	header('Content-Transfer-Encoding: binary');
	header('Content-Type: application/force-download');

	header('Cache-control: private', false);
	header('Pragma: private');
	header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
}

$dir = '../lang';
$files = scandir($dir);
$dir .= '/';
$keys = array();
$langData = array();
foreach ($files as $file)
{
	if (pathinfo($file, PATHINFO_EXTENSION) != 'po')
		continue;
	$lang = pathinfo($file, PATHINFO_FILENAME);
	$po = file_get_contents($dir.$file);
	$langData[$lang] = parsePo($po);
	$keys = array_merge($keys, array_keys($langData[$lang]));
}

echo 'vocabulary.extra = { keys: [\''.implode("','",$keys).'\']';
foreach ($langData as $lang => $data)
{
	echo ','. PHP_EOL;
	echo $lang. ': [\''
		.implode("','", array_map('addslashes', $data))
		.'\']';
}
echo '}';


function parsePo($po)
{
	$po = explode(PHP_EOL.'#:',$po);
	array_shift($po);
	$result = array();
	foreach ($po as $item)
	{
		$id = substr($item, 1, strpos($item, PHP_EOL . 'msgid') - 1);
		$str = substr($item, strpos($item, PHP_EOL . 'msgstr') + 9, -2);
		$str = str_replace('"' . PHP_EOL . '"', '', $str);
		$result[$id] = $str;
	}
	return $result;
}


function clean($s)
{
	$s = trim($s);
	$s = preg_replace('/\s{2,}/',' ', $s);
	return $s;
}
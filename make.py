#!/usr/bin/python
import gettext, os, os.path, re, shutil
from PyHtmlify import htmlify


# Compile using msgfmt -o

def prepareOutput():
	shutil.rmtree('output')
	os.mkdir('output')
	shutil.copytree('js', 'output/js')
	shutil.copytree('css', 'output/css')
	shutil.copytree('img', 'output/img')
	shutil.copy('mtg-data.js', 'output/mtg-data.js')
	os.mkdir('output/lang')
	shutil.copy('lang/localFunctions.js', 'output/lang/localFunctions.js')

def setLang(lang):
	os.makedirs('output/%s/LC_MESSAGES/' % lang)
	shutil.copy('lang/%s.mo' % lang, 'output/%s/LC_MESSAGES/t.mo' % lang)
	os.environ['LANGUAGE'] = lang
	gettext.bindtextdomain('t', 'output/')
	gettext.textdomain('t')

def getHtml():
	with open('drafting.html') as source:
		result = source.read()
	return result

def keyword(key):
	return gettext.gettext(key.group(1))





if __name__ == '__main__':
	prepareOutput()

	for lang in os.listdir('lang'):
		if lang.endswith('.mo'):
			lang = lang[:-3]
			setLang(lang)
			html = re.sub(r'\[([^]]+)\]', keyword, getHtml())
			html = html.replace('lang-code', lang)
			with open('output/%s.html' % lang, 'w') as out:
				out.write(html)
			htmlify.Htmlifier().htmlify(
				input='output/%s.html' % lang,
				output='output/%s.min.html' % lang)


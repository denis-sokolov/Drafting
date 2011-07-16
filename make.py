#!/usr/bin/python
import datetime, gettext, os, os.path, re, shutil
from PyHtmlify import htmlify
from PyHtmlify.PyCssMagic.CssMagic import CssMagic


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
	os.environ['LANGUAGE'] = '%s:en' % lang
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
	
	for name in os.listdir('output/css'):
		print name
		with open('output/css/%s' % name) as f:
			css = f.read()
		with open('output/css/%s' % name, 'w') as f:
			f.write(CssMagic(css).magic().get())
		
	for lang in os.listdir('lang'):
		if lang.endswith('.mo'):
			lang = lang[:-3]
			setLang(lang)
			html = re.sub(r'\[([^]]+)\]', keyword, getHtml())
			html = html.replace('{lang-code}', lang)
			html = html.replace('{release-date}', datetime.date.today().strftime('%Y-%m-%d'))
			html = html.replace('{release-year}', datetime.date.today().strftime('%Y'))
			with open('output/%s.html' % lang, 'w') as out:
				out.write(html)
			htmlify.Htmlifier().htmlify(
				input='output/%s.html' % lang,
				output='output/%s.min.html' % lang)


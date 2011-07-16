#!/usr/bin/python

import commands, os, os.path

def convert(directory):
	for item in os.listdir(directory):
		if item.endswith('.po'):
			commands.getoutput('msgfmt -o %s.mo %s' % (item[:-3], item))

if __name__=='__main__':
	convert(os.path.abspath(os.path.dirname(__file__)))

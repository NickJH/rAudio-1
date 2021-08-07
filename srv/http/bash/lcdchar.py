#!/usr/bin/python

from lcdcharconfig import *
import sys
import os

os.system( 'killall lcdchartimer.sh &> /dev/null' )

ipause = '\x00 '
iplay = '\x01 '
istop = '\x02 '
irr = '\x03\x04'
idots = '\x05  \x05  \x05'
rn = '\r\n'

spaces = ' ' * ( ( cols - 6 ) // 2 + 1 )
splash = rows > 2 and rn or ''
splash += spaces + irr + rn + spaces +'rAudio'

argvL = len( sys.argv )
if argvL == 1 or ''.join( sys.argv[1:4] ) == '': # no argument / blank info
    lcd.write_string( splash )
    lcd.close()
    quit()

if argvL == 2: # 1 argument
    argv1 = sys.argv[ 1 ]
    if argv1 == 'off':   # backlight off
        lcd.backlight_enabled = False
    else:                # string
        lcd.auto_linebreaks = True
        lcd.write_string( argv1.replace( '\n', rn ) )
        lcd.close()
    quit()
    
import math

def second2hhmmss( sec ):
    hh = math.floor( sec / 3600 )
    mm = math.floor( ( sec % 3600 ) / 60 )
    ss = sec % 60
    HH = hh > 0 and str( hh ) +':' or ''
    mmt = str( mm )
    MM = hh > 0 and ( mm > 9 and mmt +':' or '0'+ mmt +':' ) or ( mm > 0 and mmt +':' or '' )
    sst = str( ss )
    SS = mm > 0 and ( ss > 9 and sst or '0'+ sst ) or sst
    return HH + MM + SS

field = [ '', 'artist', 'title', 'album', 'state', 'total', 'elapsed', 'timestamp', 'webradio', 'station', 'file' ] # assign variables
for i in range( 1, 11 ):
    val = sys.argv[ i ].rstrip()
    if i < 4 or i > 8:                          # artist title album station file
        val = val[ :cols ].replace( '"', '\"' ) # truncate to cols > escape "
    exec( field[ i ] +' = "'+ val +'"' )
    
if not artist and webradio != 'false':
    artist = station
    album = file

if not artist: artist = idots
if not title: title = rows == 2 and artist or idots
if not album: album = idots
lines = rows == 2 and title or artist + rn + title + rn + album + rn
# remove accents
if charmap == 'A00':
    import unicodedata
    lines = ''.join( c for c in unicodedata.normalize( 'NFD', lines ) if unicodedata.category( c ) != 'Mn' )

if total != 'false':
    total = round( float( total ) )
    totalhhmmss = second2hhmmss( total )
else:
    totalhhmmss = ''
    
if elapsed != 'false':
    elapsed = round( float( elapsed ) )
    elapsedhhmmss = second2hhmmss( elapsed )
else:
    elapsedhhmmss = ''

if state == 'stop':
    progress = totalhhmmss
else:
    if totalhhmmss:
        slash = cols > 16 and ' / ' or '/'
        totalhhmmss = slash + totalhhmmss
        progress = elapsedhhmmss + totalhhmmss
    else:
        progress = ''
istate = state == 'stop' and istop or ( state == 'pause' and ipause or iplay )
lines += ( istate + progress + ' ' * cols )[ :cols - 2 ] + irr

lcd.write_string( lines )

if state == 'stop' or state == 'pause':
    lcd.close()
    if backlight == 'True':
        import subprocess
        subprocess.Popen( [ '/srv/http/bash/lcdchartimer.sh' ] )
    quit()

# play
if elapsed == 'false': quit()

import time

row = rows - 1
starttime = time.time()
elapsed += round( starttime - int( timestamp ) / 1000 )

while True:
    sl = 1 - ( ( time.time() - starttime ) % 1 )
    progress = iplay + second2hhmmss( elapsed ) + totalhhmmss
    lcd.cursor_pos = ( row, 0 )
    lcd.write_string( progress[ :cols ] )
    elapsed += 1
    time.sleep( sl )
    
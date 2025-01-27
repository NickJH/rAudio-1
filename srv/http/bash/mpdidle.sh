#!/bin/bash

. /srv/http/bash/common.sh

mpc idleloop | while read changed; do
	case $changed in
		mixer ) # for upmpdcli
			if [[ $( cat $dirshm/player ) == upnp ]]; then
				echo 5 > $dirshm/vol
				( for (( i=0; i < 5; i++ )); do
					sleep 0.1
					s=$(( $( cat $dirshm/vol ) - 1 )) # debounce volume long-press on client
					(( $s == 4 )) && i=0
					if (( $s > 0 )); then
						echo $s > $dirshm/vol
					else
						rm -f $dirshm/vol
						pushstream volume '{"val":'$( $dirbash/cmd.sh volumeget )'}'
					fi
				done ) &> /dev/null &
			fi
			;;
		playlist )
			if [[ $( mpc | awk '/^volume:.*consume:/ {print $NF}' ) == on || $pldiff > 0 ]]; then
				( sleep 0.05 # consume mode: playlist+player at once - run player fisrt
					data=$( php /srv/http/mpdplaylist.php current )
					pushstream playlist "$data"
				) &> /dev/null &
			fi
			;;
		player )
			if [[ ! -e $dirshm/radio && ! -e $dirshm/prevnextseek ]]; then
				killall status-push.sh &> /dev/null
				$dirbash/status-push.sh & # need to run in background for snapcast ssh
			fi
			;;
		update )
			sleep 1
			! mpc | grep -q '^Updating' && $dirbash/cmd-list.sh
			;;
	esac
done

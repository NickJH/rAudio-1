#!/bin/bash

alias=r1

. /srv/http/bash/addons.sh

grep -q sources.sh /etc/conf.d/devmon && sed -i 's/sources.sh/system.sh/g' /etc/conf.d/devmon

(( $( ls -p /etc/netctl | grep -v / | wc -l ) > 0 )) && systemctl enable netctl-auto@wlan0

file=/srv/http/data/system/display
grep -q conductor $file || sed -i '/composer/ a\\t"conductor": true,' $file

[[ -e /usr/lib/systemd/system/spotifyd.service ]] || ln -s /usr/lib/systemd/{user,system}/spotifyd.service

installstart "$1"

getinstallzip

/srv/http/bash/mpd-conf.sh

installfinish

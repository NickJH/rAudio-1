r A u d i o &ensp; 1
---
Audio player for all Raspberry Pis: Zero, 1, 2, 3 and 4

![guide](https://github.com/rern/_assets/raw/master/guide/guide.gif)

- A new release after [**R+R e6**](https://www.runeaudio.com/forum/runeaudio-r-e6-t7141.html)
- Based on Arch Linux Arm
- Metadata Tag Editor - `*.cue` support
- Album mode with coverarts
- File mode with thumbnail icons
- Coverarts and bookmarks - add, replace and remove
- WebRadio coverarts - online fetched
- `*.jpg`, `*.png` and animated `*.gif` applicable
- `*.wav` - album artists and sort tracks
- `*.cue` - virtually as individual tracks in all modes and user playlists
- Live display update across multiple clients
- Wi-Fi connection can be pre-configured for headless mode.
- USB DAC plug ang play
- Supported GPIO devices
	- [I²S audio module](https://github.com/rern/rAudio-1/blob/main/I2S_modules.md)
	- Character LCD (16x2, 20x4 and 40x4)
	- TFT 3.5" LCD (320x420)
	- Power on/off button
	- Relay module (GPIO)
- Renderers / Clients - with metadata and coverarts
	- AirPlay
	- Bluetooth audio (receiver)
	- Snapcast
	- Spotify Connect
	- UPnP
- Streamers
	- Bluetooth audio (sender)
	- HTTP (no metadata)
	- Snapcast (multiroom)
- Support boot from USB drive without SD card
- USB drive
	- Plug and play
	- Audio CD (with metadata and coverarts)
	
### Default root password: `ros`

### Q&A
[**rAudio Discussions**](https://github.com/rern/rAudio-1/discussions) - Questions, comments and bug reports

### Image files:
- RPi 64bit (4, 3 and 2 r1.2): [rAudio-1-RPi64.img.xz](https://github.com/rern/rAudio-1/releases/download/i20210621/rAudio-1-RPi64.img.xz)
- RPi 4: [rAudio-1-RPi4.img.xz](https://github.com/rern/rAudio-1/releases/download/i20210621/rAudio-1-RPi4.img.xz) ( or [mirror](https://cloud.s-t-franz.de/s/yP5jMwC6YkHmiiJ) )
- RPi 3 and 2: [rAudio-1-RPi2-3.img.xz](https://github.com/rern/rAudio-1/releases/download/i20210621/rAudio-1-RPi2-3.img.xz) ( or [mirror](https://cloud.s-t-franz.de/s/CxoqeZ3zjAjKsJd) )
- RPi 1 and Zero: [rAudio-1-RPi0-1.img.xz](https://github.com/rern/rAudio-1/releases/download/i20210621/rAudio-1-RPi0-1.img.xz) ( or [mirror](https://cloud.s-t-franz.de/s/6wcrD9QwNLLjwQW) )
	
### DIY Image file
- [**rOS**](https://github.com/rern/rOS) - Build image files with interactive process

### How-to
- Write an image file to a micro SD card (8GB or more):
	- Install **Raspberry Pi Imager**
		- Windows, MacOS, Ubuntu: [Raspberry Pi Imager](https://www.raspberrypi.org/software/)
		- Manjaro: `pacman -Sy rpi-imager`
		- Others: [Build and install](https://github.com/raspberrypi/rpi-imager)
	- Download an image file.
	- `CHOOSE OS` > Use custom (OR right click the image file > Open with > Raspberry Pi Imager)
	- `CHOOSE STORAGE` > select SD card > `WRITE`
	- Verify is optional.
	- Boot from USB drive without SD card
		- For Raspberry Pi 2B v1.2, 3A+, 3B, 3B+, 4B
		- Setup [USB mass storage boot](https://www.raspberrypi.org/documentation/hardware/raspberrypi/bootmodes/msd.md)
		- `CHOOSE STORAGE` > select USB drive > `WRITE`
		- Should be used only when USB drive is faster than SD card.
- Existing users:
	- Keep current setup SD card.
	- Try with a spare one before moving forward.
	- Always use backup.gz created by latest update to restore system.
- Before power on:
	- Wi-Fi pre-configure - 4 alternatives: (Only if no wired LAN available.)
		- From `backup.gz`
		- From existing
			- Copy an existing profile file from `/etc/netctl`
			- Rename it to `wifi` then copy it to `BOOT` before power on.
		- Edit template file - name and password.
			- Rename `wifi0` in `BOOT` to `wifi`
			- Edit SSID and Key.
		- Generate a complex profile - static IP, hidden SSID
			- With [Pre-configure Wi-Fi connection](https://rern.github.io/WiFi_profile/index.html)
			- Save it in `BOOT`
	- Wi-Fi access point mode
		- If no wired network and no pre-configured Wi-Fi connections, Wi-Fi access point will be enabled on boot.
		- On client devices, select `rAudio` from Wi-Fi network list to connect.
		- On browser, open web user interface with URL `raudio.local`
		- Settings > Networks > Wi-Fi - search
		- Select access point to connect
		- Reboot
		- Browser refreshes when ready. (Manually refresh if it's too long.)
	- System pre-configure: (Run once)
		- Restore database and settings (Wi-Fi connection included.)
			- Copy `backup.gz` to `BOOT`
		- Expand `root` partition:
			- By default, `root` partition will be expaned on initial boot.
			- SD card backup with shrunken `root` partition - Create a blank file `expand` in `BOOT` before backup
		- GPIO 3.5" LCD display (Not for Zero and 1)
			- Create a blank file in `BOOT` named as:
				- Generic display - `lcd`
				- Waveshare 35a   - `lcd35a`
				- Waveshare 35b   - `lcd35b`
				- Waveshare 35b v2   - `lcd35b-v2`
				- Waveshare 35c   - `lcd35c`
		- Custom startup / shutdown script
			- Copy custom script named `startup.sh` / `shutdown.sh` to `BOOT`
- Boot duration
	- RPi4: 20+ seconds
	- RPi3: 50+ seconds
	- RPi1, Zero: 80+ seconds
- After initial boot:
	- If connected to a screen, IP address and QR code for connecting from remote devices displayed.
	- Before setup anything: Settings > Addons > rAudio > Update (if available)
	- Restore settings and database:
		- If not pre-configured, Settings > System > Backup/Restore Settings
	- Update Library database:
		- Automatically run on boot if database is empty with connected USB and NAS
		- Force update - Settings > update Library (icon next to Sources)
	- Parse coverarts for Album and directory thumbnails :
		- Only if never run before or to force update
		- Library > Album > coverart icon (next to ALBUM heading)
	- User guide
		- Settings > last icon next to Addons

### Not working?
- Power off and wait a few seconds then power on
- If not connected, temporarily connect wired LAN then remove after Wi-Fi setup successfully.
- Still no - Download the image file and start over again


### Tips
- Best sound quality:
	- Settings > MPD > Bit-perfect - Enable
	- Use only amplifier volume (Unless quality of DAC hardware volume is better.)
- Disable features if not use to lower CPU usage:
	Settings > Features
- Coverart as large playback control buttons
	- Tap top of coverart to see controls guide.
- Hide top and bottom bars
	- No needs for top and bottom bars
	- Use coverart controls instead of top bar buttons
	- Swipe to switch between pages
		<- Library <-> Playback <-> Playlist ->
- Drag to arrange order
	- Library home blocks
	- Playlist tracks
	- Saved playlist tracks
- Some coverarts missing from album directories
	- Subdirectories listed after partial Library database update from context menu.
	- Subdirectories - context menu > Exclude directory
- Some music files missing from library
	- Settings > MPD > question mark icon -scroll- FFmpeg Decoder
	- Enable if filetypes list contains ones of the missing files.
- No albums found after update very large Library
	- Settings > MPD > Output Buffer - Increase by 8192 at a time
	- Update Library
- CUE sheet
	- `*.cue` filenames must be identical to each coresponding music file.
	- Can be directly edited by Tag Editor.
- Minimum permission for music files (on Linux ext filesystem)
	- Directories: `rwxr-xr-x` (755)
	- Files: `rw-r--r--` (644)
- RPi to router connection:
	- With wired LAN if possible - Disable Wi-Fi
	- With WiFi if necessary
	- With RPi accesspoint only if there's no router
- Connect to rAudio with IP address instead of raudio.local
	- Get IP address: Menu > Network > Network Interfaces list
- Backup SD card which already setup
	- On Linux: `bash <( wget -qO - https://github.com/rern/rOS/raw/main/imagecreate.sh )`
		- Shrink ROOT partition to minimum
		- Create and compress image file
- App icon (Full screen UI) - Add to Home Screen
	- Android Chrome / iOS Safari

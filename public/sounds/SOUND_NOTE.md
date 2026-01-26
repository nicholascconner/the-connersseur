# Notification Sound

## Required File
Place a notification sound file named `notification.mp3` in this directory.

## Sound Requirements
- Format: MP3
- Duration: ~100-500ms
- Volume: Moderate
- Type: Pleasant "ding" or "chime" sound

## Free Sound Options

### Option 1: Create Your Own
Use an online tool like:
- https://www.beepbox.co/ - Create custom beep/chime sounds
- https://sfxr.me/ - Generate retro-style notification sounds

### Option 2: Download Free Sounds
Get free notification sounds from:
- https://freesound.org/ (search for "notification" or "ding")
- https://mixkit.co/free-sound-effects/notification/
- https://notificationsounds.com/

### Option 3: Use Web Audio API (No File Needed)
If you don't want to use a file, you can modify the bartender dashboard to use the Web Audio API to generate a simple beep programmatically.

## Current Implementation
The bartender dashboard ([bartender]/page.tsx) expects the sound file at `/sounds/notification.mp3`.

If the file is missing, the notification will still work (toast + vibration), but no sound will play (browser will log an error).

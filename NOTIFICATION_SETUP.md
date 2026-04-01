# Message Notification Setup

## Features Implemented

✅ **Real-time message notifications** - Shows a popup toast when someone messages you
✅ **Browser notifications** - Native system notifications (requires permission)
✅ **Unread message badges** - Visual indicator in the sidebar showing unread message count
✅ **Sound notifications** - Optional audio alert (requires notification.mp3 file)

## Notification Sound Setup

To enable sound notifications:

1. Download or create a notification sound file (MP3 format)
2. Save it as `notification.mp3` in the `frontend/public` folder
3. The sound will automatically play when you receive a new message

### Where to get notification sounds:
- **Free sounds**: https://notificationsounds.com/
- **Pixabay**: https://pixabay.com/sound-effects/search/notification/
- **Freesound**: https://freesound.org/

## How It Works

1. **Global Message Listener**: When you log in, the app starts listening for all incoming messages globally
2. **Smart Notifications**: Notifications only show when:
   - Someone sends you a message
   - You're NOT currently chatting with that person
3. **Unread Counter**: Shows a badge on the sidebar for users with unread messages
4. **Auto-clear**: Unread count clears when you open the chat with that user

## Browser Notification Permission

The app will request browser notification permission on first login. To enable/disable:
- **Chrome**: Settings → Privacy and security → Site settings → Notifications
- **Firefox**: Settings → Privacy & Security → Permissions → Notifications
- **Safari**: Preferences → Websites → Notifications

## Testing

1. Open two browser windows (or use incognito mode)
2. Log in as different users in each window
3. Send a message from one user
4. The other user should see:
   - A toast notification popup
   - A browser notification (if permitted)
   - An unread badge on the sidebar
   - Hear a sound (if notification.mp3 exists)

## Customization

You can customize the notification behavior in `frontend/src/store/useChatStore.js`:
- Change notification duration
- Modify notification styling
- Adjust sound volume
- Add custom notification logic

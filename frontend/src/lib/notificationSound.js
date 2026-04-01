// Notification Sound Utility
// This provides a fallback beep sound if notification.mp3 is not available

export const playNotificationSound = () => {
  try {
    // Try to play the custom notification sound first
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.5;
    
    audio.play().catch(() => {
      // Fallback: Generate a simple beep sound using Web Audio API
      playBeepSound();
    });
  } catch (error) {
    console.log("Audio error:", error);
    playBeepSound();
  }
};

// Generate a simple beep sound using Web Audio API
const playBeepSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Set frequency (higher = higher pitched)
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    // Set volume
    gainNode.gain.value = 0.3;

    // Play for 200ms
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.log("Could not play beep sound:", error);
  }
};

export default playNotificationSound;

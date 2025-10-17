import notifySound from '../sound/notifications/notifySound.wav'
let currentAudio = null;

const playNotificationSound = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  try {
    currentAudio = new Audio(notifySound);
    currentAudio.volume = 0.3;
    currentAudio.play().catch(() => {
      console.warn('Notification sound blocked by browser');
    });
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

export default playNotificationSound;
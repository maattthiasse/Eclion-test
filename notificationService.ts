import { TrainingSession, TrainingStatus, Notification } from '../types';

// Default start time if not specified (based on PDF template)
const DEFAULT_START_TIME = '09:30';

const formatDate = (dateStr: string) => {
    return dateStr.split('-').reverse().join('/');
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

export const sendSystemNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: 'https://res.cloudinary.com/subframe/image/upload/v1711417513/uploads/2024-03-26/11_02_44.png' // App Icon
    });
  }
};

export const checkNotifications = (trainings: TrainingSession[], currentNotifications: Notification[]): Notification[] => {
  const newNotifications: Notification[] = [];
  const now = new Date();

  trainings.forEach(training => {
    const trainingDateStr = training.date; // YYYY-MM-DD
    const startTimeStr = training.startTime || DEFAULT_START_TIME;
    
    // Construct Date objects
    const trainingStart = new Date(`${trainingDateStr}T${startTimeStr}:00`);
    const trainingEndDay = new Date(`${trainingDateStr}T23:59:59`);
    
    // Logic 1: Pre-training reminder (15 mins before)
    // Window: between 20 mins before and start time
    const timeDiff = trainingStart.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    if (minutesDiff > 0 && minutesDiff <= 15 && training.status === TrainingStatus.SCHEDULED) {
      const notifId = `pre-${training.id}`;
      // Avoid duplicate notifications
      if (!currentNotifications.some(n => n.id === notifId)) {
        const notif: Notification = {
          id: notifId,
          title: 'Formation imminente',
          message: `La formation "${training.trainingName}" commence dans 15 min. Pensez à faire signer les participants.`,
          type: 'alert',
          timestamp: new Date(),
          trainingId: training.id,
          read: false
        };
        newNotifications.push(notif);
        sendSystemNotification(notif.title, notif.message);
      }
    }

    // Logic 2: Post-training forgotten signature (1 day after)
    // We check if "now" is past the training day + 1 day
    const oneDayAfter = new Date(trainingEndDay);
    oneDayAfter.setDate(oneDayAfter.getDate() + 1);
    
    // If it's more than 24 hours after the training date AND not completed
    // We relax the check slightly: if it is currently the day AFTER the training or later
    const dayAfterTraining = new Date(trainingDateStr);
    dayAfterTraining.setDate(dayAfterTraining.getDate() + 1);
    dayAfterTraining.setHours(0, 0, 0, 0);

    if (now >= dayAfterTraining && training.status !== TrainingStatus.COMPLETED) {
      const notifId = `post-${training.id}`;
      if (!currentNotifications.some(n => n.id === notifId)) {
        const notif: Notification = {
          id: notifId,
          title: 'Session non clôturée',
          message: `Oubli de signature ? La session "${training.trainingName}" du ${formatDate(training.date)} n'est pas clôturée par le formateur.`,
          type: 'reminder',
          timestamp: new Date(),
          trainingId: training.id,
          read: false
        };
        newNotifications.push(notif);
        sendSystemNotification(notif.title, notif.message);
      }
    }
  });

  return newNotifications;
};
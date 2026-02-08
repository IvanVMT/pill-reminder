import { useEffect } from 'react';
import { getMedications, getTodayLogs } from '../storage';

const NOTIFICATION_STATE_KEY = 'pill-reminder-notification-state';

interface NotificationState {
    [key: string]: number; // key: "medId-scheduledTime", value: timestamp of last notification
}

export const NotificationManager = () => {
    useEffect(() => {
        const checkSchedule = () => {
            if (Notification.permission !== 'granted') return;

            const now = new Date();
            // Construct a comparable time integer for easier math (e.g., 1430 for 14:30)
            const currentMinutes = now.getHours() * 60 + now.getMinutes();

            const meds = getMedications();
            const logs = getTodayLogs();
            const state: NotificationState = JSON.parse(localStorage.getItem(NOTIFICATION_STATE_KEY) || '{}');
            let stateChanged = false;

            meds.forEach(med => {
                if (med.frequency !== 'Daily') return;

                med.times.forEach(scheduledTime => {
                    // scheduledTime is "HH:MM"
                    const [schedHour, schedMinute] = scheduledTime.split(':').map(Number);
                    const schedMinutes = schedHour * 60 + schedMinute;

                    // Check if taken
                    // This naive "is taken" check matches the Dashboard logic
                    // Ideally we need to link log to specific time slot, but for now:
                    // "If taken count < scheduled count up to this time" logic from Dashboard is implicitly handling slots.
                    // Let's rely on: Is there a log for this med TODAY that works?
                    // Actually, we need to know if THIS specific slot is taken.
                    // We used a heuristic in Dashboard: `slotIndex < takenCount`.

                    const scheduledSlots = med.times.sort();
                    const slotIndex = scheduledSlots.indexOf(scheduledTime);
                    const takenCount = logs.filter(l => l.medicationId === med.id).length;
                    const isTaken = slotIndex < takenCount;

                    if (isTaken) return;

                    const key = `${med.id}-${scheduledTime}`;
                    const lastNotified = state[key] || 0;

                    // Logic 1: Exact time (or within the first minute window)
                    // We allow a small buffer in case the interval assumes exactly :00
                    if (Math.abs(currentMinutes - schedMinutes) <= 1) {
                        // If we haven't notified recently (within last 2 minutes to avoid double send in same window)
                        if (Date.now() - lastNotified > 2 * 60 * 1000) {
                            sendNotification(`Time to take ${med.name}`, `Dosage: ${med.dosage}`);
                            state[key] = Date.now();
                            stateChanged = true;
                        }
                    }

                    // Logic 2: Retry 5 minutes later
                    if (currentMinutes - schedMinutes === 5) {
                        // Check if we already sent the retry? 
                        // We can check if lastNotified was around the 5 min mark?
                        // Or just check if we haven't notified in the last 4 minutes (since the initial one)
                        if (Date.now() - lastNotified > 4 * 60 * 1000) {
                            sendNotification(`Reminder: ${med.name}`, `You haven't marked ${med.name} as taken yet!`);
                            state[key] = Date.now();
                            stateChanged = true;
                        }
                    }
                });
            });

            if (stateChanged) {
                localStorage.setItem(NOTIFICATION_STATE_KEY, JSON.stringify(state));
            }
        };

        const sendNotification = (title: string, body: string) => {
            // Check service worker for mobile support
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, {
                        body,
                        icon: '/pwa-192x192.png',
                        badge: '/pwa-192x192.png',
                        vibrate: [200, 100, 200]
                    } as any);
                });
            } else {
                // Fallback for desktop testing / non-sw
                new Notification(title, { body, icon: '/pwa-192x192.png' });
            }
        };

        // Check every 30 seconds
        const interval = setInterval(checkSchedule, 30000);
        return () => clearInterval(interval);
    }, []);

    return null;
};

// Notification Service for Browser Notifications
export const notificationService = {
    // Check if notifications are supported
    isSupported: (): boolean => {
        return 'Notification' in window;
    },

    // Get current permission status
    getPermission: (): NotificationPermission => {
        if (!notificationService.isSupported()) return 'denied';
        return Notification.permission;
    },

    // Request notification permission
    requestPermission: async (): Promise<NotificationPermission> => {
        if (!notificationService.isSupported()) {
            console.warn('Notifications not supported in this browser');
            return 'denied';
        }

        if (Notification.permission === 'granted') {
            return 'granted';
        }

        if (Notification.permission === 'denied') {
            return 'denied';
        }

        try {
            const permission = await Notification.requestPermission();
            return permission;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return 'denied';
        }
    },

    // Show a notification
    showNotification: (title: string, options?: NotificationOptions): Notification | null => {
        if (!notificationService.isSupported()) {
            console.warn('Notifications not supported');
            return null;
        }

        if (Notification.permission !== 'granted') {
            console.warn('Notification permission not granted');
            return null;
        }

        try {
            const notification = new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                ...options,
            });

            // Auto-close after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);

            return notification;
        } catch (error) {
            console.error('Error showing notification:', error);
            return null;
        }
    },

    // Show chat message notification
    showChatNotification: (
        username: string,
        message: string,
        projectTitle?: string,
        onClick?: () => void
    ): Notification | null => {
        const title = projectTitle
            ? `${username} (${projectTitle})`
            : username;

        // Truncate long messages
        const body = message.length > 100
            ? message.substring(0, 100) + '...'
            : message;

        const notification = notificationService.showNotification(title, {
            body,
            tag: 'chat-message', // Prevents duplicate notifications
            requireInteraction: false,
            silent: false,
        });

        if (notification && onClick) {
            notification.onclick = () => {
                window.focus();
                onClick();
                notification.close();
            };
        }

        return notification;
    },

    // Check if user has interacted with permission request
    hasAskedPermission: (): boolean => {
        return localStorage.getItem('notification-permission-asked') === 'true';
    },

    // Mark that we've asked for permission
    markPermissionAsked: (): void => {
        localStorage.setItem('notification-permission-asked', 'true');
    },

    // Play notification sound
    playSound: (): void => {
        try {
            // Create fresh audio element each time for better reliability
            const audio = new Audio();
            audio.volume = 0.5;

            // Generate sound on-the-fly using Web Audio API and convert to blob
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const sampleRate = audioContext.sampleRate;
            const duration = 0.25; // Total duration
            const numSamples = sampleRate * duration;
            const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
            const data = buffer.getChannelData(0);

            // Generate two beeps
            for (let i = 0; i < numSamples; i++) {
                const t = i / sampleRate;
                let value = 0;

                // First beep (0-0.1s, 900Hz)
                if (t < 0.1) {
                    value = Math.sin(2 * Math.PI * 900 * t) * Math.exp(-t * 20);
                }
                // Second beep (0.12-0.22s, 700Hz)
                else if (t >= 0.12 && t < 0.22) {
                    const t2 = t - 0.12;
                    value = Math.sin(2 * Math.PI * 700 * t2) * Math.exp(-t2 * 20);
                }

                data[i] = value * 0.3; // Volume
            }

            // Convert buffer to WAV blob
            const wav = notificationService.bufferToWave(buffer, numSamples);
            const blob = new Blob([wav], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);

            // Play using HTML5 Audio
            audio.src = url;

            // Play immediately and handle errors
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        // Audio playing successfully
                    })
                    .catch(err => {
                        console.warn('Could not play notification sound:', err);
                    });
            }

            // Clean up URL after playing
            audio.onended = () => {
                URL.revokeObjectURL(url);
            };

            // Also clean up on error
            audio.onerror = () => {
                URL.revokeObjectURL(url);
            };

            audioContext.close();
        } catch (error) {
            console.error('Could not play notification sound:', error);
        }
    },

    // Helper function to convert AudioBuffer to WAV
    bufferToWave: (buffer: AudioBuffer, len: number): ArrayBuffer => {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;

        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;

        const data = new Float32Array(len);
        buffer.copyFromChannel(data, 0, 0);

        const dataLength = len * numChannels * bytesPerSample;
        const arrayBuffer = new ArrayBuffer(44 + dataLength);
        const view = new DataView(arrayBuffer);

        // Write WAV header
        const writeString = (offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        writeString(36, 'data');
        view.setUint32(40, dataLength, true);

        // Write audio data
        let offset = 44;
        for (let i = 0; i < len; i++) {
            const sample = Math.max(-1, Math.min(1, data[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }

        return arrayBuffer;
    },
};

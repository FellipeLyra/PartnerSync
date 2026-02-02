
// Helper to remove undefined fields recursively (Deep Sanitize)
// Firestore crashes if ANY nested field is undefined.
export const deepSanitize = (obj: any): any => {
    if (obj === null || obj === undefined) return null;

    if (Array.isArray(obj)) {
        return obj.map(item => deepSanitize(item)).filter(item => item !== undefined);
    }

    if (typeof obj === 'object') {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                acc[key] = deepSanitize(value);
            }
            return acc;
        }, {} as any);
    }

    return obj;
};

// Convert Firebase Snapshots to our Types
export const mapDoc = (doc: any) => ({ id: doc.id, ...doc.data() });

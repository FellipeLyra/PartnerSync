import { storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const fileService = {
    /**
     * Uploads a file to Firebase Storage and returns the public download URL.
     * @param file The file object to upload
     * @param path The path in storage (e.g., 'chat_media/filename.jpg')
     */
    uploadFile: async (file: File, path: string): Promise<string> => {
        if (!storage) throw new Error("Firebase Storage is not initialized.");

        const storageRef = ref(storage, path);

        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    }
};

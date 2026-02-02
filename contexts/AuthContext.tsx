import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { userService } from '../services/userService';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    error: string | null;
    login: (user: User) => void;
    logout: () => Promise<void>;
    updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    // Attempt to fetch full user profile from Firestore
                    const userData = await userService.getUser(firebaseUser.uid);

                    if (userData) {
                        setCurrentUser(userData);
                    } else {
                        // Fallback for new users or permission issues (simulating "limp mode")
                        setCurrentUser({
                            id: firebaseUser.uid,
                            username: firebaseUser.displayName || 'User',
                            email: firebaseUser.email || '',
                            // Important: We don't set companyId here if not found, app handles it
                            companyId: '',
                            avatar: firebaseUser.photoURL || '',
                            role: 'MEMBER' // Default safe role
                        });
                    }
                } else {
                    setCurrentUser(null);
                }
            } catch (err: any) {
                console.error("Auth Context Error:", err);
                if (err.code === 'permission-denied') {
                    setError('permission-denied');
                }
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const login = (user: User) => {
        setCurrentUser(user);
    };

    const logout = async () => {
        if (auth) await auth.signOut();
        setCurrentUser(null);
    };

    const updateUser = async (updatedUser: User) => {
        try {
            await userService.updateUser(updatedUser);
            setCurrentUser(updatedUser);
        } catch (e: any) {
            console.error("Error updating user:", e);
            throw e;
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, loading, error, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

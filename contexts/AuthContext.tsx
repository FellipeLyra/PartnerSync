import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { userService } from '../services/userService';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    error: string | null;
    isEmailVerified: boolean;
    login: (user: User) => void;
    logout: () => Promise<void>;
    updateUser: (user: User) => Promise<void>;
    sendVerificationEmail: () => Promise<void>;
    reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
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
                    setIsEmailVerified(firebaseUser.emailVerified);
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
                    setIsEmailVerified(false);
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
        setIsEmailVerified(false);
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

    const sendVerificationEmailFn = async () => {
        if (auth?.currentUser) {
            await sendEmailVerification(auth.currentUser);
        }
    };

    const reloadUser = async () => {
        if (auth?.currentUser) {
            await auth.currentUser.reload();
            setIsEmailVerified(auth.currentUser.emailVerified);
        }
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
            loading,
            error,
            isEmailVerified,
            login,
            logout,
            updateUser,
            sendVerificationEmail: sendVerificationEmailFn,
            reloadUser
        }}>
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

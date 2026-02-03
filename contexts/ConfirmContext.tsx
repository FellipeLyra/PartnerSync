import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import ConfirmModal from '../components/ui/ConfirmModal';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const resolveRef = useRef<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions) => {
        setOptions(opts);
        setIsOpen(true);
        return new Promise<boolean>((resolve) => {
            resolveRef.current = resolve;
        });
    }, []);

    const handleConfirm = () => {
        setIsOpen(false);
        if (resolveRef.current) {
            resolveRef.current(true);
            resolveRef.current = null;
        }
    };

    const handleCancel = () => {
        setIsOpen(false);
        if (resolveRef.current) {
            resolveRef.current(false);
            resolveRef.current = null;
        }
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {options && (
                <ConfirmModal
                    isOpen={isOpen}
                    title={options.title}
                    message={options.message}
                    confirmText={options.confirmText}
                    cancelText={options.cancelText}
                    isDestructive={options.isDestructive}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context.confirm;
};

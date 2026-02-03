import React from 'react';
import { useToast, ToastType } from '../../contexts/ToastContext';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />,
    warning: <AlertTriangle size={20} />
};

const colors: Record<ToastType, string> = {
    success: 'bg-emerald-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-amber-500 text-white'
};

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-4 right-4 z-[70] flex flex-col gap-3 pointer-events-none">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto flex items-start gap-3 min-w-[300px] max-w-sm p-4 rounded-xl shadow-lg shadow-black/10 transform transition-all duration-300 animate-slideIn ${colors[toast.type]}`}
                >
                    <div className="mt-0.5 flex-shrink-0">
                        {icons[toast.type]}
                    </div>
                    <p className="flex-1 text-sm font-medium leading-relaxed">
                        {toast.message}
                    </p>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <X size={18} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;

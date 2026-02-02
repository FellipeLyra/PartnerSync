import { useState } from 'react';
import { type LeadFormData } from '../types';
import { LeadService } from '../services/leadService';

interface UseLeadFormReturn {
    step: number;
    formData: LeadFormData;
    loading: boolean;
    errors: Record<string, string>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleNext: () => void;
    handleBack: () => void;
    handleSubmit: (e: React.FormEvent, onSuccess: () => void) => Promise<void>;
}

export const useLeadForm = (): UseLeadFormReturn => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<LeadFormData>({
        name: '',
        email: '',
        phone: '',
        organizationName: '',
        role: '',
        interest: '',
        message: ''
    });

    const validateStep = (currentStep: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (currentStep === 1) {
            if (!formData.name.trim()) newErrors.name = 'Por favor, informe seu nome';
            if (!formData.email.trim()) {
                newErrors.email = 'Email é obrigatório';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = 'Email inválido';
            }
            if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório para contato';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
        setErrors({});
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent, onSuccess: () => void) => {
        e.preventDefault();

        if (!validateStep(1)) {
            setStep(1);
            return;
        }

        setLoading(true);

        try {
            await LeadService.submitLead(formData);
            onSuccess();
        } catch (error) {
            console.error('Error submitting lead:', error);
            setErrors({ submit: 'Erro ao enviar. Tente novamente mais tarde.' });
        } finally {
            setLoading(false);
        }
    };

    return {
        step,
        formData,
        loading,
        errors,
        handleChange,
        handleNext,
        handleBack,
        handleSubmit
    };
};

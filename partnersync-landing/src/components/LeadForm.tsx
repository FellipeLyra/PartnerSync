import React from 'react';
import { useLeadForm } from '../hooks/useLeadForm';
import { type LeadFormData } from '../types';

/* -------------------------------------------------------------------------- */
/*                                SUB-COMPONENTS                              */
/* -------------------------------------------------------------------------- */

// --- UI Components ---
const ProgressBar: React.FC<{ step: number }> = ({ step }) => (
    <div className="flex items-center justify-between mb-8 relative">
        {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2 relative z-10 w-1/3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2 ${step >= s ? 'bg-primary border-primary text-white' : 'bg-white border-border text-text-tertiary'}`}>
                    {s}
                </div>
            </div>
        ))}
        <div className="absolute top-4 left-0 w-full h-0.5 bg-border/50 -z-0 rounded-full">
            <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
        </div>
    </div>
);

const MarketingContent: React.FC = () => (
    <div className="hidden lg:block animate-fadeInUp">
        <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-text-primary leading-tight">
            Vamos construir sua <br />
            <span className="text-gradient">história de sucesso?</span>
        </h2>
        <p className="text-lg text-text-secondary mb-8 leading-relaxed">
            Junte-se a centenas de empresas que transformaram sua presença digital com a Viral Studio.
            Preencha o formulário e receba um plano de ação personalizado.
        </p>

        <div className="space-y-6">
            <FeatureBadge icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />} color="green" title="Análise Gratuita" text="Avaliação completa do seu perfil atual" />
            <FeatureBadge icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14H11L11 21L20 10L13 10Z" />} color="blue" title="Estratégia Personalizada" text="Plano focado nos seus objetivos" />
        </div>
    </div>
);

const FeatureBadge: React.FC<{ icon: React.ReactNode; color: string; title: string; text: string }> = ({ icon, color, title, text }) => (
    <div className="flex items-center gap-4 p-4 bg-bg-tertiary rounded-xl shadow-sm border border-border">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color === 'green' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {icon}
            </svg>
        </div>
        <div>
            <h4 className="font-bold text-text-primary">{title}</h4>
            <p className="text-sm text-text-secondary">{text}</p>
        </div>
    </div>
);


// --- Form Steps ---

interface StepProps {
    formData: LeadFormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    errors: Record<string, string>;
}

const StepOne: React.FC<StepProps> = ({ formData, handleChange, errors }) => (
    <div className="animate-fadeIn space-y-5">
        <h3 className="text-2xl font-bold text-center mb-6">Seus Dados</h3>
        <InputField
            label="Nome Completo"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Digite seu nome"
            error={errors.name}
        />
        <InputField
            label="Email Corporativo"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@empresa.com"
            error={errors.email}
        />
        <InputField
            label="WhatsApp"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            error={errors.phone}
        />
    </div>
);

const StepTwo: React.FC<StepProps> = ({ formData, handleChange, errors }) => (
    <div className="animate-fadeIn space-y-5">
        <h3 className="text-2xl font-bold text-center mb-6">Sua Empresa</h3>
        <InputField
            label="Nome da Empresa"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            placeholder="Nome da sua empresa"
            error={errors.organizationName}
        />
        <InputField
            label="Instagram Comercial"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="@suamarca"
            error={errors.role}
        />
    </div>
);

const StepThree: React.FC<StepProps> = ({ formData, handleChange, errors }) => (
    <div className="animate-fadeIn space-y-5">
        <h3 className="text-2xl font-bold text-center mb-6">Objetivos</h3>
        <InputField
            label="Serviço de Interesse"
            name="interest"
            value={formData.interest}
            onChange={handleChange}
            placeholder="Ex: Tráfego Pago, Gestão de Redes..."
            error={errors.interest}
        />
        <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5 ml-1">Desafios Atuais</label>
            <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary focus:bg-bg-tertiary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none min-h-[100px] resize-none"
                placeholder="Como podemos te ajudar?"
            />
        </div>
    </div>
);

// --- Inputs ---

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, error, className, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5 ml-1">{label}</label>
        <input
            {...props}
            className={`w-full px-4 py-3 rounded-xl border bg-bg-secondary text-text-primary focus:bg-bg-tertiary focus:ring-2 focus:ring-primary/20 transition-all outline-none ${error ? 'border-error' : 'border-border focus:border-primary'} ${className || ''}`}
        />
        {error && <span className="text-error text-xs mt-1 ml-1">{error}</span>}
    </div>
);

/* -------------------------------------------------------------------------- */
/*                                MAIN COMPONENT                              */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                                MAIN COMPONENT                              */
/* -------------------------------------------------------------------------- */

interface LeadFormProps {
    onSuccess: () => void;
    compact?: boolean;
    initialInterest?: string;
}

interface LeadFormContentProps extends ReturnType<typeof useLeadForm> {
    onSuccess: () => void;
    compact: boolean;
}
const LeadFormContent: React.FC<LeadFormContentProps> = ({
    step,
    formData,
    loading,
    errors,
    handleChange,
    handleNext,
    handleBack,
    handleSubmit,
    onSuccess,
    compact
}) => {
    return (
        <div className={`bg-bg-tertiary rounded-2xl border border-border/50 shadow-xl ${compact ? 'p-6' : 'p-8 w-full'}`}>
            <ProgressBar step={step} />

            <form onSubmit={(e) => handleSubmit(e, onSuccess)}>
                <div className="min-h-[300px]">
                    {step === 1 && <StepOne formData={formData} handleChange={handleChange} errors={errors} />}
                    {step === 2 && <StepTwo formData={formData} handleChange={handleChange} errors={errors} />}
                    {step === 3 && <StepThree formData={formData} handleChange={handleChange} errors={errors} />}
                </div>

                <div className="mt-8 flex gap-4">
                    {step > 1 && (
                        <button
                            key="back-btn"
                            type="button"
                            onClick={handleBack}
                            className="w-full py-4 rounded-xl border border-border text-text-primary font-bold hover:bg-bg-secondary transition-all disabled:opacity-50"
                            disabled={loading}
                        >
                            Voltar
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            key="next-btn"
                            type="button"
                            onClick={handleNext}
                            className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/25"
                        >
                            Próximo
                        </button>
                    ) : (
                        <button
                            key="submit-btn"
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enviando...
                                </>
                            ) : (
                                'Enviar Solicitação'
                            )}
                        </button>
                    )}
                </div>

                {errors.submit && (
                    <div className="mt-4 p-4 bg-error/10 text-error rounded-xl text-center text-sm">
                        {errors.submit}
                    </div>
                )}
            </form>
        </div>
    );
};
const LeadForm: React.FC<LeadFormProps> = ({ onSuccess, compact = false, initialInterest }) => {
    const leadForm = useLeadForm({ interest: initialInterest });

    if (compact) {
        return <LeadFormContent {...leadForm} onSuccess={onSuccess} compact={compact} />;
    }

    return (
        <section className="section bg-bg-secondary relative py-20" id="form">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                    <MarketingContent />
                    <LeadFormContent {...leadForm} onSuccess={onSuccess} compact={compact} />
                </div>
            </div>
        </section>
    );
};

export default LeadForm;

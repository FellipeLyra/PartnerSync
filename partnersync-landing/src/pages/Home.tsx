import React, { useState } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import SocialProof from '../components/SocialProof';
import LeadForm from '../components/LeadForm';
import Success from '../components/Success';

const Home: React.FC = () => {
    const [showSuccess, setShowSuccess] = useState(false);

    const scrollToForm = () => {
        const formElement = document.getElementById('form');
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleFormSuccess = () => {
        setShowSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackToHome = () => {
        setShowSuccess(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (showSuccess) {
        return <Success onBackToHome={handleBackToHome} />;
    }

    return (
        <>
            <Hero onGetStarted={scrollToForm} />
            <Features />
            <SocialProof />
            <LeadForm onSuccess={handleFormSuccess} />
        </>
    );
};

export default Home;

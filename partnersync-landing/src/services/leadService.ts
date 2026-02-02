import { collection, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { type LeadFormData, type Client, type Deal, type Interaction } from '../types';

const LANDING_PAGE_COMPANY_ID = '1hpedJaqO5oxG13XDT2y'; // Consider moving to env var or config constant

/**
 * Service responsible for handling lead submission logic
 */
export const LeadService = {
    /**
     * Submits a new lead to Firestore, creating Client, Deal, and Interaction records.
     * @param formData The data collected from the lead form
     */
    async submitLead(formData: LeadFormData): Promise<void> {
        // 1. Create Client
        const clientsRef = collection(db, 'clients');
        const newClientRef = doc(clientsRef);

        const clientData: Client = {
            id: newClientRef.id,
            companyId: LANDING_PAGE_COMPANY_ID,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            organizationName: formData.organizationName,
            role: formData.role,
            leadSource: 'Landing Page',
            tags: formData.interest ? [formData.interest] : [],
            notes: formData.message || 'Lead capturado via landing page',
            createdAt: Date.now()
        };

        await setDoc(newClientRef, clientData);

        // 2. Create Deal
        const dealsRef = collection(db, 'deals');
        const newDealRef = doc(dealsRef);
        const dealData: Deal = {
            id: newDealRef.id,
            companyId: LANDING_PAGE_COMPANY_ID,
            clientId: newClientRef.id,
            title: `Lead: ${formData.name}`,
            value: 0,
            stageId: 'lead',
            probability: 20,
            status: 'OPEN',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await setDoc(newDealRef, dealData);

        // 3. Create Interaction (Log)
        const interactionsRef = collection(db, 'interactions');
        const newInteractionRef = doc(interactionsRef);
        const interactionData: Interaction = {
            id: newInteractionRef.id,
            companyId: LANDING_PAGE_COMPANY_ID,
            clientId: newClientRef.id,
            type: 'NOTE',
            content: `Lead capturado via landing page. Interesse: ${formData.interest || 'Não especificado'}. Mensagem: ${formData.message || 'Nenhuma mensagem'}`,
            date: Date.now(),
            performedBy: 'system'
        };

        await setDoc(newInteractionRef, interactionData);
    }
};

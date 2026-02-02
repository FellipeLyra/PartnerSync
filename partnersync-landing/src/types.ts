// Lead form data structure
export interface LeadFormData {
    // Step 1: Essential Contact Info
    name: string;
    email: string;
    phone: string;

    // Step 2: Qualification (optional)
    organizationName?: string;
    role?: string;

    // Step 3: Interest/Needs (optional)
    interest?: string;
    message?: string;
}

// CRM Client structure (matching PartnerSync)
export interface Client {
    id?: string;
    companyId: string;
    name: string;
    email?: string;
    phone?: string;
    organizationName?: string;
    role?: string;
    leadSource?: string;
    tags?: string[];
    notes?: string;
    createdAt: number;
}

// CRM Deal structure (matching PartnerSync)
export interface Deal {
    id?: string;
    companyId: string;
    clientId: string;
    title: string;
    value: number;
    stageId: string;
    probability: number;
    status: 'OPEN' | 'WON' | 'LOST';
    createdAt: number;
    updatedAt: number;
}

// CRM Interaction structure (matching PartnerSync)
export interface Interaction {
    id?: string;
    companyId: string;
    clientId: string;
    type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'WHATSAPP';
    content: string;
    date: number;
    performedBy: string;
}

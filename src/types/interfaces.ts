import { FormInstance } from 'antd/es/form';

export interface Item {
    item_detail: string;
    quantity: number;
    unit_price: number;
    discount?: number;
    total_amount?: number;
    order: number;
}

export interface PriceAdjustment {
    id: string;
    name: string;
}

export interface AdjustmentEntry {
    price_adjustment?: string;
    amount: number;
    order: number;
}

export interface AdjustmentFieldsProps {
    adjustments: AdjustmentEntry[];
    setAdjustments: React.Dispatch<React.SetStateAction<AdjustmentEntry[]>>;
    adjustmentOptions: PriceAdjustment[];
    setAdjustmentOptions: React.Dispatch<React.SetStateAction<PriceAdjustment[]>>;
    isLoading: boolean;
    form: FormInstance
}

export interface LatestNumberResponse {
    latest_number: string;
}

export interface UserProfile {
    custom_code: string;
}

export interface Identity {
    access: string;
    email: string;
    first_name: string;
    id: number;
    last_name: string;
    name: string;
    refresh: string;
}

export interface Group {
    id: number;
    name: string;
}

export interface QuotationPayload {
    customer: string;
    reference_number: string;
    issue_date: string;
    expiry_date: string;
    created_by: number;
    customer_notes: string;
    terms_conditions: string;
    items: Item[];
    adjustments: AdjustmentEntry[];
}

export interface InvoicePayload {
    customer: string;
    reference_number: string;
    issue_date: string;
    expiry_date: string;
    created_by: number;
    customer_notes: string;
    terms_conditions: string;
    quotation_number: string;
    quotation?: string;
    items: Item[];
    adjustments: AdjustmentEntry[];
}

export interface Group {
    id: number;
    name: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    userprofile: UserProfile;
    group: Group[];
}

export interface PaymentTerm {
    id: string;
    term_name: string;
    days_due: number;
}

export interface UserSignatureDropDown {
    id: string;
    signature_name: string;
}

export interface UserProfile {
    first_name: string;
    last_name: string;
    email: string;
    custom_code: string;
    job_title: string;
    default_quotation_signature: string;
}

export interface PaymentRecord {
    id: string;
    payment_number: string;
    payment_date: string;
    amount: number;
    payment_method_name: string;
    deposit_to_name: string;
    reference_number?: string;
    notes?: string;
    documents: { id: string; original_filename: string; description: string }[];
}

export interface PaymentMethod {
    id: string;
    name: string;
}

export interface Account {
    id: string;
    name: string;
}

export interface PaymentRecordView {
    id: string;
    payment_number: string;
    payment_date: string;
    amount: number;
    payment_method_name: string;
    deposit_to_name: string;
    reference_number: string;
    notes: string;
    documents: { id: string; original_filename: string; description: string }[];
    invoice_reference_number: string;
    customer_display_name: string;
    invoice_id: string;
}


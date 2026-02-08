export interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string; // e.g., "Daily", "As needed"
    times: string[]; // ["08:00", "20:00"]
    color?: string;
}

export interface Log {
    id: string;
    medicationId: string;
    timestamp: number;
    date: string; // YYYY-MM-DD
    status: 'taken' | 'skipped';
}

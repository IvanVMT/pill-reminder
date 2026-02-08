import type { Medication, Log } from './types';

const MEDS_KEY = 'pill-reminder-meds';
const LOGS_KEY = 'pill-reminder-logs';

export const getMedications = (): Medication[] => {
    const data = localStorage.getItem(MEDS_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveMedication = (med: Medication) => {
    const meds = getMedications();
    const existingIndex = meds.findIndex(m => m.id === med.id);

    if (existingIndex >= 0) {
        meds[existingIndex] = med;
    } else {
        meds.push(med);
    }

    localStorage.setItem(MEDS_KEY, JSON.stringify(meds));
};

export const deleteMedication = (id: string) => {
    const meds = getMedications().filter(m => m.id !== id);
    localStorage.setItem(MEDS_KEY, JSON.stringify(meds));
};

export const getLogs = (): Log[] => {
    const data = localStorage.getItem(LOGS_KEY);
    return data ? JSON.parse(data) : [];
};

export const addLog = (log: Log) => {
    const logs = getLogs();
    logs.push(log);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};

export const getTodayLogs = (): Log[] => {
    const today = new Date().toISOString().split('T')[0];
    return getLogs().filter(log => log.date === today);
};

import React, { useEffect, useState } from 'react';
import { Check, Clock, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMedications, getTodayLogs, addLog } from '../storage';
import type { Medication, Log } from '../types';
import { cn } from '../lib/utils';

export const Dashboard: React.FC = () => {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        loadData();
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const loadData = () => {
        setMedications(getMedications());
        setLogs(getTodayLogs());
    };

    const handleTake = (medId: string) => {
        const log: Log = {
            id: crypto.randomUUID(),
            medicationId: medId,
            timestamp: Date.now(),
            date: new Date().toISOString().split('T')[0],
            status: 'taken'
        };
        addLog(log);
        loadData();
    };

    const scheduledMeds = medications.filter(m => m.frequency === 'Daily');

    // Flatten medication times into scheduled events
    const schedule = scheduledMeds.flatMap(med =>
        med.times.map(time => ({
            medication: med,
            time,
            taken: logs.some(l => l.medicationId === med.id && l.status === 'taken'), // This logic is simplified; needs refined time matching later
            // Simple logic: if taken *at all* today, mark as taken. 
            // Ideally should match time windows, but for MVP "Taken today" is a start.
            // Better: check if there's a log. 
        }))
    ).sort((a, b) => a.time.localeCompare(b.time));

    // Enhanced logic for "taken" status: 
    // We need to know WHICH time slot was taken. 
    // For now, let's just allow taking it multiple times? 
    // Or maybe we can just show the list of meds and their next time?
    // Let's iterate: Show a card for each scheduled time. 
    // If we have a log for that med around that time (within 2 hours?), mark taken.
    // For MVP: List all scheduled occurrences. 

    // Refined "taken" check:
    // We need to store *which* scheduled time was taken in the log, OR infer it.
    // Let's keep it simple: Just show the list. Clicking check adds a log.
    // If > 0 logs exist for this med today, we might want to be careful.
    // Let's just allow checking off items. 

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Today</h1>
                    <p className="text-gray-500">
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <Link to="/add" className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
                    <Plus size={24} />
                </Link>
            </header>

            {/* Notification Permission Request */}
            {
                Notification.permission === 'default' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg h-fit">
                                <Clock size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-900">Enable Reminders</h3>
                                <p className="text-sm text-blue-700">Get notified when it's time to take your pills.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => Notification.requestPermission().then(() => window.location.reload())}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                        >
                            Allow Notifications
                        </button>
                    </div>
                )
            }

            {
                schedule.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-gray-900 font-medium mb-1">No reminders today</h3>
                        <p className="text-gray-500 text-sm">Add a medication to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {schedule.map((item) => {

                            // This logic is tricky without explicit linkage. 
                            // Alternative: Just show unique medications and their next due time?
                            // "Next Dose: 2:00 PM"
                            // Let's stick to the list of time slots.
                            // If I have 2 logs for Med A, the first 2 slots are taken.
                            const takenCount = logs.filter(l => l.medicationId === item.medication.id).length;
                            const slotIndex = schedule.filter(s => s.medication.id === item.medication.id).indexOf(item);
                            const taken = slotIndex < takenCount;

                            return (
                                <div
                                    key={`${item.medication.id}-${item.time}`}
                                    className={cn(
                                        "flex items-center p-4 bg-white rounded-2xl border transition-all duration-300",
                                        taken ? "border-green-200 bg-green-50/50" : "border-gray-100 shadow-sm hover:shadow-md"
                                    )}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock size={14} className={taken ? "text-green-600" : "text-gray-400"} />
                                            <span className={cn("text-xs font-semibold", taken ? "text-green-700" : "text-gray-500")}>
                                                {item.time}
                                            </span>
                                        </div>
                                        <h3 className={cn("font-bold text-lg", taken ? "text-green-900 line-through decoration-green-500/30" : "text-gray-900")}>
                                            {item.medication.name}
                                        </h3>
                                        <p className={cn("text-sm", taken ? "text-green-700" : "text-gray-500")}>
                                            {item.medication.dosage}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => !taken && handleTake(item.medication.id)}
                                        disabled={taken}
                                        className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                                            taken
                                                ? "bg-green-500 text-white shadow-green-200 shadow-lg scale-90"
                                                : "bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-600 hover:scale-105 active:scale-95"
                                        )}
                                    >
                                        {taken ? <Check size={24} /> : <Check size={24} />}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )
            }
        </div >
    );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Save } from 'lucide-react';
import { saveMedication } from '../storage';
import type { Medication } from '../types';

export const AddMedication: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequency, setFrequency] = useState('Daily');
    const [times, setTimes] = useState<string[]>(['09:00']);

    const addTime = () => {
        setTimes([...times, '09:00']);
    };

    const removeTime = (index: number) => {
        setTimes(times.filter((_, i) => i !== index));
    };

    const updateTime = (index: number, value: string) => {
        const newTimes = [...times];
        newTimes[index] = value;
        setTimes(newTimes);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        const newMed: Medication = {
            id: crypto.randomUUID(),
            name,
            dosage,
            frequency,
            times: times.sort(),
        };

        saveMedication(newMed);
        navigate('/');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Add Medication</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medication Name
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="e.g. Ibuprofen"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage
                    </label>
                    <input
                        type="text"
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="e.g. 200mg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                    </label>
                    <select
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                        <option value="Daily">Daily</option>
                        <option value="AsNeeded">As Needed</option>
                    </select>
                </div>

                {frequency === 'Daily' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Schedule Times
                        </label>
                        <div className="space-y-2">
                            {times.map((time, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => updateTime(index, e.target.value)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                    {times.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeTime(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addTime}
                                className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700 mt-2"
                            >
                                <Plus size={16} />
                                Add another time
                            </button>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all mt-8 shadow-lg shadow-blue-200"
                >
                    <Save size={20} />
                    Save Medication
                </button>
            </form>
        </div>
    );
};

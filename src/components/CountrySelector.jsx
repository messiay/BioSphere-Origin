import { useState } from 'react';
import { getAvailableJurisdictions } from '../services/compliance';

export function CountrySelector({ selectedCountry, onCountryChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const jurisdictions = getAvailableJurisdictions();
    const current = jurisdictions.find(j => j.code === selectedCountry) || jurisdictions[jurisdictions.length - 1];

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 rounded-lg shadow-sm hover:border-indigo-400 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                <span className="text-2xl">{current.flagIcon}</span>
                <div className="text-left">
                    <div className="text-sm font-semibold text-slate-900">{current.name}</div>
                    <div className="text-xs text-slate-500">Regulatory Zone</div>
                </div>
                <svg
                    className={`ml-2 h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop to close dropdown */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown menu */}
                    <div className="absolute left-0 z-20 mt-2 w-80 origin-top-left rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-slate-100">
                        <div className="py-2">
                            <div className="px-4 py-2 border-b border-slate-100">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                    Select Jurisdiction
                                </h3>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {jurisdictions.map((jurisdiction) => (
                                    <button
                                        key={jurisdiction.code}
                                        onClick={() => {
                                            onCountryChange(jurisdiction.code);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors flex items-center gap-3 ${jurisdiction.code === selectedCountry ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                                            }`}
                                    >
                                        <span className="text-3xl">{jurisdiction.flagIcon}</span>
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900">{jurisdiction.name}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{jurisdiction.authority}</div>
                                        </div>
                                        {jurisdiction.code === selectedCountry && (
                                            <svg
                                                className="h-5 w-5 text-indigo-600"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

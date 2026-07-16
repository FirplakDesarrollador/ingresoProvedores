import React from 'react';

export default function FeriasPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[#254153]">Ferias</h1>
                <p className="text-gray-500">Gestión y control de ferias.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-blue-800">
                    <div className="flex gap-3">
                        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="font-semibold">Módulo en desarrollo</p>
                            <p className="text-sm opacity-90">Este módulo se encuentra en fase de construcción.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

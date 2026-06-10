"use client";

import { useState } from "react";

export default function AdminCartsPage() {
    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-serif tracking-tight text-[#111]">Carritos Activos</h2>
                    <p className="text-sm text-[#777] mt-1">Los carritos se gestionan automáticamente</p>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-[#111]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-[#111] mb-2">Carritos Basados en Sesión</h3>
                <p className="text-[#555] max-w-md mx-auto">
                    Los carritos se crean automáticamente cuando los clientes agregan productos. 
                    Se convierten en órdenes cuando el cliente completa la compra.
                </p>
            </div>

            <div className="mt-8 bg-white rounded-xl border border-[#e8e4df] p-6">
                <h4 className="font-semibold text-[#111] mb-4">Información</h4>
                <ul className="space-y-2 text-sm text-[#555]">
                    <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-[#111] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Los carritos se identifican por session_id único del navegador</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-[#111] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>No requieren login del cliente</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-[#111] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Se vacían automáticamente al crear una orden</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-[#111] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Almacenan productos con opciones configurables seleccionadas</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

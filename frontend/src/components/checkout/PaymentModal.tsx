"use client";

import { useState } from "react";

interface PaymentModalProps {
    isOpen: boolean;
    total: number;
    onClose: () => void;
    onConfirm: () => void;
}

type PaymentMethod = "qr" | "card" | "paypal" | null;

export default function PaymentModal({ isOpen, total, onClose, onConfirm }: PaymentModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);

    if (!isOpen) return null;

    const handleSelectMethod = (method: PaymentMethod) => {
        setSelectedMethod(method);
    };

    const handleConfirm = () => {
        setSelectedMethod(null);
        onConfirm();
    };

    const handleClose = () => {
        setSelectedMethod(null);
        onClose();
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: "16px",
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    maxWidth: "480px",
                    width: "100%",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: "linear-gradient(to right, #1c1917, #292524)",
                        padding: "20px 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "white", margin: 0 }}>
                        Método de Pago
                    </h3>
                    <button
                        onClick={handleClose}
                        type="button"
                        style={{
                            background: "none",
                            border: "none",
                            color: "#a8a29e",
                            cursor: "pointer",
                            fontSize: "24px",
                            lineHeight: 1,
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ padding: "24px" }}>
                    {/* Total */}
                    <div
                        style={{
                            backgroundColor: "#fffbeb",
                            border: "1px solid #fde68a",
                            borderRadius: "12px",
                            padding: "16px",
                            marginBottom: "24px",
                            textAlign: "center",
                        }}
                    >
                        <p style={{ fontSize: "14px", color: "#b45309", fontWeight: 500, margin: "0 0 4px 0" }}>
                            Total a pagar
                        </p>
                        <p style={{ fontSize: "32px", fontWeight: "bold", color: "#d97706", margin: 0 }}>
                            ${Number(total).toFixed(2)}
                        </p>
                    </div>

                    {/* Payment Methods Selection */}
                    {selectedMethod === null && (
                        <div>
                            <p style={{ fontSize: "14px", fontWeight: 500, color: "#57534e", marginBottom: "16px" }}>
                                Selecciona un método de pago:
                            </p>

                            {/* QR */}
                            <button
                                type="button"
                                onClick={() => handleSelectMethod("qr")}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "16px",
                                    padding: "16px",
                                    border: "2px solid #e7e5e4",
                                    borderRadius: "12px",
                                    background: "white",
                                    cursor: "pointer",
                                    marginBottom: "12px",
                                    textAlign: "left",
                                }}
                            >
                                <div
                                    style={{
                                        width: "48px",
                                        height: "48px",
                                        backgroundColor: "#f3e8ff",
                                        borderRadius: "8px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        fontSize: "24px",
                                    }}
                                >
                                    📱
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, color: "#1c1917", margin: 0 }}>Pago QR</p>
                                    <p style={{ fontSize: "13px", color: "#78716c", margin: "2px 0 0 0" }}>
                                        Escanea el código QR para pagar
                                    </p>
                                </div>
                                <span style={{ color: "#a8a29e", fontSize: "18px" }}>→</span>
                            </button>

                            {/* Card */}
                            <button
                                type="button"
                                onClick={() => handleSelectMethod("card")}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "16px",
                                    padding: "16px",
                                    border: "2px solid #e7e5e4",
                                    borderRadius: "12px",
                                    background: "white",
                                    cursor: "pointer",
                                    marginBottom: "12px",
                                    textAlign: "left",
                                }}
                            >
                                <div
                                    style={{
                                        width: "48px",
                                        height: "48px",
                                        backgroundColor: "#dbeafe",
                                        borderRadius: "8px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        fontSize: "24px",
                                    }}
                                >
                                    💳
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, color: "#1c1917", margin: 0 }}>Tarjeta de Crédito/Débito</p>
                                    <p style={{ fontSize: "13px", color: "#78716c", margin: "2px 0 0 0" }}>
                                        Visa, Mastercard, American Express
                                    </p>
                                </div>
                                <span style={{ color: "#a8a29e", fontSize: "18px" }}>→</span>
                            </button>

                            {/* PayPal */}
                            <button
                                type="button"
                                onClick={() => handleSelectMethod("paypal")}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "16px",
                                    padding: "16px",
                                    border: "2px solid #e7e5e4",
                                    borderRadius: "12px",
                                    background: "white",
                                    cursor: "pointer",
                                    textAlign: "left",
                                }}
                            >
                                <div
                                    style={{
                                        width: "48px",
                                        height: "48px",
                                        backgroundColor: "#e0f2fe",
                                        borderRadius: "8px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        fontSize: "24px",
                                    }}
                                >
                                    🅿️
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, color: "#1c1917", margin: 0 }}>PayPal</p>
                                    <p style={{ fontSize: "13px", color: "#78716c", margin: "2px 0 0 0" }}>
                                        Paga con tu cuenta PayPal
                                    </p>
                                </div>
                                <span style={{ color: "#a8a29e", fontSize: "18px" }}>→</span>
                            </button>
                        </div>
                    )}

                    {/* QR View - Shows QR immediately + confirm button */}
                    {selectedMethod === "qr" && (
                        <div style={{ textAlign: "center" }}>
                            <button
                                type="button"
                                onClick={() => handleSelectMethod(null)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#78716c",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    marginBottom: "16px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}
                            >
                                ← Volver
                            </button>

                            <p style={{ fontSize: "14px", color: "#57534e", marginBottom: "16px" }}>
                                Escanea este código para completar el pago
                            </p>

                            {/* Fake QR Code */}
                            <div
                                style={{
                                    display: "inline-block",
                                    padding: "16px",
                                    backgroundColor: "white",
                                    border: "2px solid #e7e5e4",
                                    borderRadius: "12px",
                                    marginBottom: "12px",
                                }}
                            >
                                <svg width="180" height="180" viewBox="0 0 180 180">
                                    <rect width="180" height="180" fill="white" />
                                    <rect x="10" y="10" width="50" height="50" fill="none" stroke="black" strokeWidth="6" />
                                    <rect x="20" y="20" width="30" height="30" fill="black" />
                                    <rect x="120" y="10" width="50" height="50" fill="none" stroke="black" strokeWidth="6" />
                                    <rect x="130" y="20" width="30" height="30" fill="black" />
                                    <rect x="10" y="120" width="50" height="50" fill="none" stroke="black" strokeWidth="6" />
                                    <rect x="20" y="130" width="30" height="30" fill="black" />
                                    <rect x="70" y="10" width="8" height="8" fill="black" />
                                    <rect x="86" y="10" width="8" height="8" fill="black" />
                                    <rect x="102" y="10" width="8" height="8" fill="black" />
                                    <rect x="70" y="26" width="8" height="8" fill="black" />
                                    <rect x="86" y="26" width="8" height="8" fill="black" />
                                    <rect x="70" y="42" width="8" height="8" fill="black" />
                                    <rect x="102" y="42" width="8" height="8" fill="black" />
                                    <rect x="10" y="70" width="8" height="8" fill="black" />
                                    <rect x="26" y="70" width="8" height="8" fill="black" />
                                    <rect x="42" y="70" width="8" height="8" fill="black" />
                                    <rect x="70" y="70" width="8" height="8" fill="black" />
                                    <rect x="86" y="70" width="8" height="8" fill="black" />
                                    <rect x="102" y="70" width="8" height="8" fill="black" />
                                    <rect x="118" y="70" width="8" height="8" fill="black" />
                                    <rect x="134" y="70" width="8" height="8" fill="black" />
                                    <rect x="150" y="70" width="8" height="8" fill="black" />
                                    <rect x="10" y="86" width="8" height="8" fill="black" />
                                    <rect x="42" y="86" width="8" height="8" fill="black" />
                                    <rect x="70" y="86" width="8" height="8" fill="black" />
                                    <rect x="102" y="86" width="8" height="8" fill="black" />
                                    <rect x="134" y="86" width="8" height="8" fill="black" />
                                    <rect x="162" y="86" width="8" height="8" fill="black" />
                                    <rect x="10" y="102" width="8" height="8" fill="black" />
                                    <rect x="26" y="102" width="8" height="8" fill="black" />
                                    <rect x="42" y="102" width="8" height="8" fill="black" />
                                    <rect x="70" y="102" width="8" height="8" fill="black" />
                                    <rect x="86" y="102" width="8" height="8" fill="black" />
                                    <rect x="118" y="102" width="8" height="8" fill="black" />
                                    <rect x="150" y="102" width="8" height="8" fill="black" />
                                    <rect x="70" y="118" width="8" height="8" fill="black" />
                                    <rect x="86" y="118" width="8" height="8" fill="black" />
                                    <rect x="102" y="118" width="8" height="8" fill="black" />
                                    <rect x="118" y="118" width="8" height="8" fill="black" />
                                    <rect x="150" y="118" width="8" height="8" fill="black" />
                                    <rect x="70" y="134" width="8" height="8" fill="black" />
                                    <rect x="102" y="134" width="8" height="8" fill="black" />
                                    <rect x="134" y="134" width="8" height="8" fill="black" />
                                    <rect x="162" y="134" width="8" height="8" fill="black" />
                                    <rect x="70" y="150" width="8" height="8" fill="black" />
                                    <rect x="86" y="150" width="8" height="8" fill="black" />
                                    <rect x="118" y="150" width="8" height="8" fill="black" />
                                    <rect x="134" y="150" width="8" height="8" fill="black" />
                                    <rect x="150" y="150" width="8" height="8" fill="black" />
                                    <rect x="162" y="150" width="8" height="8" fill="black" />
                                    <rect x="70" y="162" width="8" height="8" fill="black" />
                                    <rect x="102" y="162" width="8" height="8" fill="black" />
                                    <rect x="118" y="162" width="8" height="8" fill="black" />
                                    <rect x="150" y="162" width="8" height="8" fill="black" />
                                </svg>
                            </div>

                            <p style={{ fontSize: "12px", color: "#a8a29e", marginBottom: "20px" }}>
                                QR generado • Válido por 15 minutos
                            </p>

                            <button
                                type="button"
                                onClick={handleConfirm}
                                style={{
                                    width: "100%",
                                    padding: "16px",
                                    backgroundColor: "#16a34a",
                                    color: "white",
                                    fontWeight: 600,
                                    fontSize: "16px",
                                    border: "none",
                                    borderRadius: "12px",
                                    cursor: "pointer",
                                }}
                            >
                                ✓ Confirmar Pago
                            </button>
                        </div>
                    )}

                    {/* Card View (disabled/demo) */}
                    {selectedMethod === "card" && (
                        <div>
                            <button
                                type="button"
                                onClick={() => handleSelectMethod(null)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#78716c",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    marginBottom: "16px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}
                            >
                                ← Volver
                            </button>

                            <div style={{ opacity: 0.5, pointerEvents: "none" }}>
                                <div style={{ marginBottom: "12px" }}>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#44403c", marginBottom: "4px" }}>
                                        Número de tarjeta
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="4242 4242 4242 4242"
                                        disabled
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            border: "1px solid #d6d3d1",
                                            borderRadius: "8px",
                                            backgroundColor: "#fafaf9",
                                        }}
                                    />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#44403c", marginBottom: "4px" }}>
                                            Vencimiento
                                        </label>
                                        <input type="text" placeholder="MM/AA" disabled style={{ width: "100%", padding: "12px", border: "1px solid #d6d3d1", borderRadius: "8px", backgroundColor: "#fafaf9" }} />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#44403c", marginBottom: "4px" }}>
                                            CVV
                                        </label>
                                        <input type="text" placeholder="123" disabled style={{ width: "100%", padding: "12px", border: "1px solid #d6d3d1", borderRadius: "8px", backgroundColor: "#fafaf9" }} />
                                    </div>
                                </div>
                            </div>

                            <div
                                style={{
                                    backgroundColor: "#fefce8",
                                    border: "1px solid #fde047",
                                    borderRadius: "8px",
                                    padding: "12px",
                                    marginTop: "16px",
                                    textAlign: "center",
                                }}
                            >
                                <p style={{ fontSize: "14px", color: "#854d0e", fontWeight: 500, margin: 0 }}>
                                    🚧 Método no disponible aún — Próximamente
                                </p>
                            </div>
                        </div>
                    )}

                    {/* PayPal View (disabled/demo) */}
                    {selectedMethod === "paypal" && (
                        <div>
                            <button
                                type="button"
                                onClick={() => handleSelectMethod(null)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#78716c",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    marginBottom: "16px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}
                            >
                                ← Volver
                            </button>

                            <div style={{ textAlign: "center", padding: "24px 0", opacity: 0.5 }}>
                                <div
                                    style={{
                                        width: "64px",
                                        height: "64px",
                                        backgroundColor: "#e0f2fe",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 16px",
                                        fontSize: "28px",
                                    }}
                                >
                                    🅿️
                                </div>
                                <p style={{ fontWeight: 500, color: "#44403c", margin: "0 0 4px 0" }}>Conectar con PayPal</p>
                                <p style={{ fontSize: "13px", color: "#78716c", margin: 0 }}>
                                    Serás redirigido a PayPal para completar el pago
                                </p>
                            </div>

                            <div
                                style={{
                                    backgroundColor: "#fefce8",
                                    border: "1px solid #fde047",
                                    borderRadius: "8px",
                                    padding: "12px",
                                    textAlign: "center",
                                }}
                            >
                                <p style={{ fontSize: "14px", color: "#854d0e", fontWeight: 500, margin: 0 }}>
                                    🚧 Método no disponible aún — Próximamente
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

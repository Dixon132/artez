"use client";

import Image from "next/image";
import { getAbsoluteMediaUrl } from "@/services/api";

export default function OrderSummary({ cart, customerData }: { cart: any; customerData: any }) {
    const subtotal = cart.items.reduce((acc: number, item: any) => {
        const itemPrice = Number(item.product_price) + item.selected_options.reduce((sum: number, opt: any) => sum + Number(opt.extra_price), 0);
        return acc + itemPrice * item.quantity;
    }, 0);

    const shipping: number = 0;
    const total = subtotal + shipping;

    return (
        <div className="order-summary">
            <div className="summary-header">
                <h2>Resumen de Orden</h2>
                <p className="summary-subtitle">Revisa tu pedido antes de confirmar</p>
            </div>

            <div className="summary-section">
                <h3 className="section-title">Datos de Contacto</h3>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">Nombre completo</span>
                        <span className="info-value">{customerData.full_name}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Email</span>
                        <span className="info-value">{customerData.email}</span>
                    </div>
                    <div className="info-item full-width">
                        <span className="info-label">Dirección de envío</span>
                        <span className="info-value">{customerData.address}</span>
                    </div>
                </div>
            </div>

            <div className="summary-section">
                <h3 className="section-title">Productos ({cart.items.length})</h3>
                <div className="items-list">
                    {cart.items.map((item: any) => {
                        const itemPrice = Number(item.product_price);
                        const optionsPrice = item.selected_options.reduce((sum: number, opt: any) => sum + Number(opt.extra_price), 0);
                        const unitTotal = itemPrice + optionsPrice;
                        const lineTotal = unitTotal * item.quantity;

                        return (
                            <div key={item.id} className="order-item">
                                <div className="item-image">
                                    {item.product_image ? (
                                        <Image
                                            src={getAbsoluteMediaUrl(item.product_image)}
                                            alt={item.product_name || "Product image"}
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="item-placeholder">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M9 19V6l12-3v13M9 19c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2zm12-3c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2zM9 10l12-3"/>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="item-details">
                                    <h4 className="item-name">{item.product_name}</h4>
                                    <div className="item-options">
                                        {item.selected_options.map((opt: any) => (
                                            <span key={opt.id} className="option-badge">
                                                {opt.option_name}: {opt.value_name}
                                                {Number(opt.extra_price) > 0 && ` (+$${opt.extra_price})`}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="item-pricing">
                                        <span className="item-qty">Cantidad: {item.quantity}</span>
                                        <span className="item-unit">${unitTotal.toFixed(2)} c/u</span>
                                    </div>
                                </div>
                                <div className="item-total">
                                    ${lineTotal.toFixed(2)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="summary-section">
                <h3 className="section-title">Totales</h3>
                <div className="totals">
                    <div className="total-row">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="total-row">
                        <span>Envío</span>
                        <span>{shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="total-row total-row--final">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="summary-notice">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                </svg>
                <div>
                    <p className="notice-title">Información importante</p>
                    <p className="notice-text">
                        Al confirmar tu orden, nuestro equipo revisará tu pedido y se pondrá en contacto contigo 
                        en las próximas 24 horas para coordinar el pago y envío. Recibirás un email de confirmación 
                        con todos los detalles.
                    </p>
                </div>
            </div>

            <style jsx>{`
                .order-summary {
                    max-width: 900px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 16px;
                    border: 1px solid #e7e5e4;
                    overflow: hidden;
                }

                .summary-header {
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    padding: 32px;
                    border-bottom: 1px solid #e7e5e4;
                }

                .summary-header h2 {
                    font-size: 28px;
                    font-weight: 700;
                    color: #78350f;
                    margin-bottom: 6px;
                }

                .summary-subtitle {
                    font-size: 14px;
                    color: #92400e;
                }

                .summary-section {
                    padding: 28px 32px;
                    border-bottom: 1px solid #f5f5f4;
                }

                .summary-section:last-of-type {
                    border-bottom: none;
                }

                .section-title {
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: #78716c;
                    margin-bottom: 18px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .info-item.full-width {
                    grid-column: 1 / -1;
                }

                .info-label {
                    font-size: 11px;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: #a8a29e;
                }

                .info-value {
                    font-size: 15px;
                    color: #1c1917;
                    font-weight: 500;
                }

                .items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .order-item {
                    display: grid;
                    grid-template-columns: 80px 1fr auto;
                    gap: 16px;
                    padding: 16px;
                    background: #fafaf9;
                    border-radius: 12px;
                    border: 1px solid #f5f5f4;
                }

                .item-image {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #e7e5e4;
                }

                .item-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .item-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #a8a29e;
                }

                .item-details {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .item-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: #1c1917;
                }

                .item-options {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .option-badge {
                    display: inline-block;
                    padding: 3px 10px;
                    background: white;
                    border: 1px solid #e7e5e4;
                    border-radius: 6px;
                    font-size: 11px;
                    color: #57534e;
                }

                .item-pricing {
                    display: flex;
                    gap: 16px;
                    font-size: 13px;
                    color: #78716c;
                }

                .item-total {
                    display: flex;
                    align-items: center;
                    font-size: 20px;
                    font-weight: 700;
                    color: #92400e;
                }

                .totals {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .total-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 15px;
                    color: #57534e;
                    padding: 10px 0;
                }

                .total-row--final {
                    border-top: 2px solid #e7e5e4;
                    padding-top: 16px;
                    margin-top: 8px;
                    font-size: 22px;
                    font-weight: 700;
                    color: #1c1917;
                }

                .summary-notice {
                    display: flex;
                    gap: 14px;
                    padding: 24px 32px;
                    background: #fffbeb;
                    border-top: 1px solid #fde68a;
                }

                .summary-notice svg {
                    flex-shrink: 0;
                    color: #d97706;
                    margin-top: 2px;
                }

                .notice-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: #92400e;
                    margin-bottom: 6px;
                }

                .notice-text {
                    font-size: 13px;
                    line-height: 1.6;
                    color: #78350f;
                }

                @media (max-width: 768px) {
                    .summary-header {
                        padding: 24px 20px;
                    }

                    .summary-section {
                        padding: 20px;
                    }

                    .info-grid {
                        grid-template-columns: 1fr;
                    }

                    .order-item {
                        grid-template-columns: 60px 1fr;
                        gap: 12px;
                    }

                    .item-image {
                        width: 60px;
                        height: 60px;
                    }

                    .item-total {
                        grid-column: 2;
                        justify-content: flex-end;
                        margin-top: 8px;
                    }

                    .summary-notice {
                        padding: 20px;
                    }
                }
            `}</style>
        </div>
    );
}

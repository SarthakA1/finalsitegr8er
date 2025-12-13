import React, { useEffect } from 'react';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

type GoogleAdProps = {
    slot: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    responsive?: boolean;
    style?: React.CSSProperties;
};

const GoogleAd: React.FC<GoogleAdProps> = ({ slot, format = 'auto', responsive = true, style }) => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense Error:", e);
        }
    }, []);

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX'; // Fallback for dev

    // Show visual placeholder if ID is not configured (is the default dummy) OR doesn't look like a valid ID
    if (clientId === 'ca-pub-XXXXXXXXXXXXXXXX' || !clientId.includes('ca-pub')) {
        return (
            <div style={{
                padding: '40px',
                background: '#f7fafc',
                color: '#718096',
                border: '2px dashed #cbd5e0',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'sans-serif',
                margin: '16px 0'
            }}>
                📢 Gooogle Ads Placeholder <br />
                <span style={{ fontWeight: 400, fontSize: '12px' }}>
                    (Configure <code>NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID</code> in .env.local)
                </span>
            </div>
        );
    }

    return (
        <div style={{ overflow: 'hidden', ...style }}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={clientId}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive}
            />
        </div>
    );
};

export default GoogleAd;

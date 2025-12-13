import React, { useEffect } from 'react';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

type GoogleAdProps = {
    slot: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    layoutKey?: string;
    responsive?: boolean;
    style?: React.CSSProperties;
};

const GoogleAd: React.FC<GoogleAdProps> = ({ slot, format = 'auto', layoutKey, responsive = true, style }) => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense Error:", e);
        }
    }, []);

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID || 'ca-pub-6442166008118008';

    // Show visible placeholder ONLY if we are using the internal dev dummy
    // Since user provided a real ID, this check effectively passes now
    if (clientId.includes('XXXXXXXXXXXXXXXX')) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>Placeholder</div>
        )
    }

    return (
        <div style={{ overflow: 'hidden', ...style }}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={clientId}
                data-ad-slot={slot}
                data-ad-layout-key={layoutKey}
                data-ad-format={format}
                data-full-width-responsive={responsive}
            />
        </div>
    );
};

export default GoogleAd;

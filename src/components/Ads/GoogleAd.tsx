import React, { useEffect } from 'react';
import { Text } from '@chakra-ui/react';

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
            console.log("Attempting to push ad...");
            const adsbygoogle = window.adsbygoogle || [];
            if (Array.isArray(adsbygoogle)) {
                adsbygoogle.push({});
            } else {
                (window.adsbygoogle as any).push({});
            }
            console.log("Ad pushed successfully.");

        } catch (e) {
            console.error("AdSense Error:", e);
        }
    }, [slot]); // Re-run if slot changes

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID || 'ca-pub-6442166008118008';

    // Show visible placeholder ONLY if we are using the internal dev dummy
    if (clientId.includes('XXXXXXXXXXXXXXXX')) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>Placeholder</div>
        )
    }

    return (
        <div style={{ overflow: 'hidden', minHeight: '100px', ...style }}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={clientId}
                data-ad-slot={slot}
                data-ad-layout-key={layoutKey}
                data-ad-format={format}
                data-full-width-responsive={responsive}
                data-ad-test="on"
            />
        </div>
    );
};

export default GoogleAd;

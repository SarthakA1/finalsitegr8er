import React from 'react';

type FounderPageProps = {};

const FounderPage: React.FC<FounderPageProps> = () => {
    return (
        <div style={styles.pageContainer}>
            <h1 style={styles.pageTitle}>The Founder</h1>

            {/* Founder Bio Section */}
            <Section title="Sarthak Ahuja" imageSrc="https://media.licdn.com/dms/image/v2/D5603AQG0BWdI8Fjf9A/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1720973014753?e=1737590400&v=beta&t=RFK2_v7ydw_cYSSP99lxU9Bv66IHoYT82_Slg3mjXJg">
                <p>
                    Hi! Connect with me @ sarthak.ahuja231@gmail.com
                </p>
            </Section>
        </div>
    );
};

// Reusable Section Component
interface SectionProps {
    title: string;
    imageSrc: string;
    reverse?: boolean;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, imageSrc, reverse = false, children }) => {
    return (
        <div style={reverse ? { ...styles.sectionContainer, ...styles.reverse } : styles.sectionContainer}>
            <div style={styles.sectionContent}>
                <h2 style={styles.sectionTitle}>{title}</h2>
                <div style={styles.sectionText}>{children}</div>
            </div>
            <div style={styles.sectionImage}>
                <img src={imageSrc} alt={title} style={styles.image} />
            </div>
        </div>
    );
};

// Inline styling
const styles: Record<string, React.CSSProperties> = {
    pageContainer: {
        padding: '20px',
        marginTop: '40px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
    },
    pageTitle: {
        textAlign: 'center',
        fontSize: '2.5rem',
        color: '#333',
        marginBottom: '20px',
    },
    sectionContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: '40px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        padding: '20px',
    },
    reverse: {
        flexDirection: 'row-reverse',
    },
    sectionContent: {
        flex: 1,
        paddingRight: '20px',
    },
    sectionTitle: {
        fontSize: '1.8rem',
        color: '#333',
        marginBottom: '10px',
    },
    sectionText: {
        fontSize: '1.1rem',
        color: '#555',
        lineHeight: '1.6',
    },
    sectionImage: {
        flex: 1,
        textAlign: 'right',
    },
    image: {
        maxWidth: '40%',
        height: 'auto',
        borderRadius: '8px',
    },
};

export default FounderPage;

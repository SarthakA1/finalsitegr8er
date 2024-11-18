import React from 'react';

type FounderPageProps = {};

const FounderPage: React.FC<FounderPageProps> = () => {
    return (
        <div style={styles.pageContainer}>
            <h1 style={styles.pageTitle}>The Founder</h1>

            {/* Founder Bio Section */}
            <Section
                title="Sarthak Ahuja"
                imageSrc="https://media.licdn.com/dms/image/v2/D5603AQG0BWdI8Fjf9A/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1720973014753?e=1737590400&v=beta&t=RFK2_v7ydw_cYSSP99lxU9Bv66IHoYT82_Slg3mjXJg"
            >
                <p>Hi! Connect with me @ sarthak.ahuja231@gmail.com</p>
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
        fontFamily: 'Roboto, sans-serif', // Modern sans-serif font
        backgroundColor: '#f4f6f8',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        textAlign: 'center',
    },
    pageTitle: {
        fontSize: '3rem',
        color: '#2c3e50',
        marginBottom: '30px',
        fontWeight: '700',
    },
    sectionContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '40px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '30px',
        maxWidth: '1000px',
        width: '80%',
    },
    reverse: {
        flexDirection: 'row-reverse',
    },
    sectionContent: {
        flex: 1,
        paddingRight: '30px',
    },
    sectionTitle: {
        fontSize: '2rem',
        color: '#2c3e50',
        marginBottom: '20px',
        fontWeight: '600',
    },
    sectionText: {
        fontSize: '1.1rem',
        color: '#7f8c8d',
        lineHeight: '1.8',
    },
    sectionImage: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        maxWidth: '90%',
        height: 'auto',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    },
};

export default FounderPage;

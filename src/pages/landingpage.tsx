import React from 'react';
import './FounderPage.css';

type FounderPageProps = {};

const FounderPage: React.FC<FounderPageProps> = () => {
    return (
        <div className="founder-page-container">
            <h1 className="page-title">Get to Know the Founder</h1>

            {/* Founder Bio Section */}
            <Section title="Meet the Founder" imageSrc="/images/founder-photo.jpg">
                <p>
                    [Founder’s Name] is the visionary behind this platform, creating a space where students can come together to share knowledge and grow. With years of experience in education and a deep passion for supporting learners, [Founder’s Name] believes in the power of community and collaboration to foster success.
                </p>
            </Section>

            
        </div>
    );
};

// Modular Section Component
interface SectionProps {
    title: string;
    imageSrc: string;
    reverse?: boolean;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, imageSrc, reverse = false, children }) => {
    return (
        <div className={`section-container ${reverse ? 'reverse' : ''}`}>
            <div className="section-content">
                <h2 className="section-title">{title}</h2>
                <div className="section-text">{children}</div>
            </div>
            <div className="section-image">
                <img src={imageSrc} alt={title} />
            </div>
        </div>
    );
};

export default FounderPage;

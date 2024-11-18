import React from 'react';

type FounderPageProps = {};

const FounderPage: React.FC<FounderPageProps> = () => {
  return (
    <div className="founder-page-container">
      <style>
        {`
        /* Global Styles */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Helvetica Neue', sans-serif;
        }

        body {
          background-color: #fafafa;
          color: #333;
          padding: 20px;
          line-height: 1.6;
        }

        /* Page Title */
        .page-title {
          text-align: center;
          font-size: 3rem;
          font-weight: 600;
          margin-bottom: 50px;
          color: #333;
        }

        /* Section Styles */
        .section-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 50px;
          padding: 30px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .section-container.reverse {
          flex-direction: row-reverse;
        }

        .section-container:hover {
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
          transform: translateY(-5px);
        }

        .section-content {
          flex: 1;
          max-width: 600px;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 500;
          color: #2c3e50;
          margin-bottom: 20px;
        }

        .section-text {
          font-size: 1.1rem;
          color: #7f8c8d;
          line-height: 1.8;
        }

        .section-image img {
          width: 350px;
          height: 350px;
          object-fit: cover;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* Hover Effects for Images */
        .section-image img:hover {
          transform: scale(1.05);
          transition: all 0.3s ease;
        }

        /* Responsive Layout */
        @media (max-width: 768px) {
          .section-container {
            flex-direction: column;
            text-align: center;
            padding: 20px;
          }

          .section-image {
            margin-top: 20px;
          }

          .section-image img {
            width: 100%;
            height: auto;
          }
        }
        `}
      </style>

      <h1 className="page-title">Get to Know the Founder</h1>

      {/* Founder Bio Section */}
      <Section title="Meet the Founder" imageSrc="/images/founder-photo.jpg">
        <p>
          [Founder’s Name] is the visionary behind this platform, creating a space where students can come together to share knowledge and grow. With years of experience in education and a deep passion for supporting learners, [Founder’s Name] believes in the power of community and collaboration to foster success.
        </p>
      </Section>

      {/* Founder’s Vision Section */}
      <Section title="Founder’s Vision" imageSrc="/images/vision.jpg" reverse={true}>
        <p>
          [Founder’s Name] aims to revolutionize the way students interact with learning resources. By creating a global community where every student can collaborate and succeed, the platform empowers individuals to reach their full potential. The vision is to make education accessible and supportive for all.
        </p>
      </Section>

      {/* The Journey So Far Section */}
      <Section title="The Journey So Far" imageSrc="/images/journey.jpg">
        <p>
          Starting as a simple idea, this platform has grown into a thriving community of learners from across the globe. The journey has been filled with learning, innovation, and a commitment to always putting students first. With each milestone, [Founder’s Name] and the team continue to push boundaries to improve the platform.
        </p>
      </Section>

      {/* Get in Touch Section */}
      <Section title="Get in Touch" imageSrc="/images/contact.jpg" reverse={true}>
        <p>
          Have questions or want to learn more? Reach out to [Founder’s Name] through our contact page. Your feedback is invaluable in helping us continue to improve and provide the best experience for our community.
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

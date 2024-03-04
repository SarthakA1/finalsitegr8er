import React from 'react';
import '/src/lib/css/codeofhonor.css'; // Import CSS file for styling

const CodeOfHonor: React.FC = () => {
    return (
        <div className="code-of-honor-container">
            {/* Top Row */}
            <div className="code-of-honor-row">
                {/* First Rule */}
                <div className="code-of-honor-rule">
                    <img src="image1.jpg" alt="Respect Copyright Laws and Promote Academic Integrity" />
                    <h2 className="rule-heading">Respect Copyright Laws and Promote Academic Integrity</h2>
                    <p className="rule-text">Users must refrain from posting any copyrighted material, including MYP past papers and content copyrighted by the International Baccalaureate or other organizations, to uphold the integrity of original work. Users are also always expected to provide authentic and original responses avoiding plagiarism.</p>
                </div>
                {/* Second Rule */}
                <div className="code-of-honor-rule">
                    <img src="image2.jpg" alt="Foster Collaborative Learning" />
                    <h2 className="rule-heading">Foster Collaborative Learning</h2>
                    <p className="rule-text">Encourage sharing knowledge and experiences responsibly while ensuring all users feel a sense of belonging. Avoid any racial slurs or political dialogue.</p>
                </div>
            </div>
            {/* Bottom Row */}
            <div className="code-of-honor-row">
                {/* Third Rule */}
                <div className="code-of-honor-rule">
                    <img src="image3.jpg" alt="Report Violations Promptly" />
                    <h2 className="rule-heading">Report Violations Promptly</h2>
                    <p className="rule-text">Users have a responsibility to promptly report any instances of copyright infringement or academic dishonesty to maintain the integrity of the platform.</p>
                </div>
                {/* Fourth Rule */}
                <div className="code-of-honor-rule">
                    <img src="image4.jpg" alt="Uphold Community Accountability" />
                    <h2 className="rule-heading">Uphold Community Accountability</h2>
                    <p className="rule-text">By adhering to this code of honor, users contribute to the creation of a supportive and ethical learning environment, fostering trust and credibility within the GR8ER community.</p>
                </div>
            </div>
        </div>
    );
}

export default CodeOfHonor;

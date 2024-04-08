import { Head } from 'next/document';
import React from 'react';

type codeofhonorProps = {
    
};

const codeofhonor: React.FC<codeofhonorProps> = () => {
    
    return  (
       
        <div className="code-of-honor-container">
             <Head>
       
       <title>Code of Honor</title>
     </Head>
          <h1 style={{ textAlign: 'center', fontSize: '1.5em', fontWeight: 'bold', marginBottom: '25px' }}>Code of Honor</h1> {/* Heading with increased font size and bold */}
          {/* Top Row */}
          <div className="code-of-honor-row">
              {/* First Rule */}
              <div className="code-of-honor-rule">
                  <div className="rule-content">
                      <h2 className="rule-heading blue-heading">Respect Copyright Laws and Promote Academic Integrity</h2>
                      <p className="rule-text">Users must refrain from posting any copyrighted material, including MYP past papers and content copyrighted by the International Baccalaureate or other organizations, to uphold the integrity of original work. Users are also always expected to provide authentic and original responses avoiding plagiarism.</p>
                  </div>
                  <img src="/images/copyrightlaws.png" className="rule-image" alt="Copyright Laws" />
              </div>
              {/* Second Rule */}
              <div className="code-of-honor-rule">
                  <div className="rule-content">
                      <h2 className="rule-heading green-heading">Foster Collaborative Learning</h2>
                      <p className="rule-text">Encourage sharing knowledge and experiences responsibly while ensuring all users feel a sense of belonging. Avoid any racial slurs or political dialogue.</p>
                  </div>
                  <img src="/images/collaboration.png" className="rule-image" alt="Collaboration" />
              </div>
          </div>
          {/* Bottom Row */}
          <div className="code-of-honor-row">
              {/* Third Rule */}
              <div className="code-of-honor-rule">
                  <div className="rule-content">
                      <h2 className="rule-heading orange-heading">Report Violations Promptly</h2>
                      <p className="rule-text">Users have a responsibility to promptly report any instances of copyright infringement or academic dishonesty to maintain the integrity of the platform.</p>
                  </div>
                  <img src="/images/report.png" className="rule-image" alt="Report Violations" />
              </div>
              {/* Fourth Rule */}
              <div className="code-of-honor-rule">
                  <div className="rule-content">
                      <h2 className="rule-heading red-heading">Uphold Community Accountability</h2>
                      <p className="rule-text">By adhering to this code of honor, users contribute to the creation of a supportive and ethical learning environment, fostering trust and credibility within the GR8ER community.</p>
                  </div>
                  <img src="/images/accountability.png" className="rule-image" alt="Community Accountability" />
              </div>
          </div>
          {/* Center line */}
          <div style={{textAlign: 'center', marginTop: '20px'}}>
              <p>Created by Sarthak Ahuja, a former MYP student who graduated MYP with 8 perfect 7s in 2023</p>
          </div>
      </div>
      );
}

export default codeofhonor;

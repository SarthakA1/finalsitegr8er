import React from 'react';

// Assuming styles are defined in a separate CSS file (style.css)
// Import styles here if needed

interface WelcomeProps {}

const Welcome: React.FC<WelcomeProps> = () => {
  return (
    <html lang="en">
      <head>
       
      
        <title>Welcome to GR8ER!</title>
        <link rel="stylesheet" href="welcome.css" />
        {/* Add any additional stylesheets here */}
      </head>
      <body style={{ overflow: 'hidden' }}>
        <main>
          <div className="big-wrapper light">
            <img src="Images/shape.png" alt="" className="shape" />

            <header>
              <div className="container">
                <div className="logo">
                  <img src="Images/The-logo.png" alt="Logo" />
                  <h3>GR8ER</h3>
                </div>

                <div className="links">
                  <ul>
                    <li>
                      <a
                        href="https://www.linkedin.com/company/gr8er/"
                        className="special"
                      >
                        <i className="fab fa-linkedin-in fa-2x"></i>
                      </a>
                    </li>
                    <li>
                      <a href="https://www.youtube.com/@GR8ERIB" className="special">
                        <i className="fab fa-youtube fa-2x"></i>
                      </a>
                    </li>
                    <li>
                      <a href="https://www.instagram.com/gr8er_/" className="special">
                        <i className="fab fa-instagram fa-2x"></i>
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="overlay"></div>

                <div className="hamburger-menu">
                  <div className="bar"></div>
                </div>
              </div>
            </header>

            <div className="showcase-area">
              <div className="container">
                <div className="left">
                  <div className="big-title">
                    <h1>The academic </h1>
                    <h1>network for IB MYP students</h1>
                  </div>
                  <p className="text">
                    At GR8ER, we revolutionize the MYP learning experience with
                    innovative personalization technology and a community-centric
                    approach.
                  </p>
                  <div className="cta">
                    <a href="https://www.gr8er.live/" className="btn">
                      Get started
                    </a>
                  </div>
                </div>

                <div className="right">
                  <img
                    src="Images/Screenshot 2024-06-28 at 10.47.10 AM.png"
                    alt="Person Image"
                    className="person"
                  />
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <h3>Used by students from:</h3>
              <img
                src="/Users/sarthakahuja/Downloads/GR8ER landing page/Images/Screenshot 2024-06-28 at 1.12.41 PM.png"
                style={{ maxWidth: '50%', height: 'auto', marginTop: 20 }}
              />
            </div>
          </div>
        </main>

        {/* Move script imports inside the component if using React for interactivity */}
      </body>
    </html>
  );
};

export default Welcome;
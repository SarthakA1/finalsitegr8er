// pages/index.tsx

import Head from 'next/head';

const Home = () => {
  return (
    <>
      <Head>
        <title>Welcome to GR8ER!</title>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="welcome.css" />
        <style>{`
          body {
            overflow: hidden; /* Prevent scrolling */
          }
        `}</style>
      </Head>

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
                  <li><a href="https://www.linkedin.com/company/gr8er/" className="special"><i className="fab fa-linkedin-in fa-2x"></i></a></li>
                  <li><a href="https://www.youtube.com/@GR8ERIB" className="special"><i className="fab fa-youtube fa-2x"></i></a></li>
                  <li><a href="https://www.instagram.com/gr8er_/" className="special"><i className="fab fa-instagram fa-2x"></i></a></li>
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
                  At GR8ER, we revolutionize the MYP learning experience with innovative
                  personalization technology and a community-centric approach.
                </p>
                <div className="cta">
                  <a href="https://www.gr8er.live/home" className="btn">Get started</a>
                </div>
              </div>

              <div className="right">
                <img src="Images/Screenshot 2024-06-28 at 10.47.10 AM.png" alt="Person Image" className="person" />
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3>Used by students from:</h3>
            <img src="/Users/sarthakahuja/Downloads/GR8ER landing page/Images/Screenshot 2024-06-28 at 1.12.41 PM.png" style={{ maxWidth: '50%', height: 'auto', marginTop: '20px' }} />
          </div>
        </div>
      </main>

      {/* JavaScript Files */}
      <script src="https://kit.fontawesome.com/a81368914c.js"></script>
      <script src="./app.js"></script>
    </>
  );
};

export default Home;

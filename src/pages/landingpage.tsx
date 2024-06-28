/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React from 'react';

const globalStyles = css`
  @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap");

  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  body {
    font-family: "Poppins", sans-serif;
    height: 1000px;
  }

  .stop-scrolling {
    height: 100%;
    overflow: hidden;
  }

  img {
    width: 100%;
  }

  a {
    text-decoration: none;
  }

  .light {
    --mainColor: #489ce4;
    --hoverColor: #489ce4;
    --backgroundColor: #ffffff;
    --darkOne: #312f3a;
    --darkTwo: #45424b;
    --lightOne: #919191;
    --lightTwo: #aaa;
  }

  .dark {
    --mainColor: #489ce4;
    --hoverColor: #489ce4;
    --backgroundColor: black;
    --darkOne: #f3f3f3;
    --darkTwo: #fff;
    --lightOne: #ccc;
    --lightTwo: #e7e3e3;
  }

  .special {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    padding: 8px;
    margin-right: 10px;
    color: black !important;
    background-color: white;
    border-radius: 4px;
    text-transform: capitalize;
    transition: 0.2s;
    border-spacing: 5px;
  }

  .usedby {
    height: 95px;
    width: 100%;
    max-width: 850px;
    margin: 0 auto;
    text-align: center;
    margin-top: 20px;
  }
`;

const styles = {
  bigWrapper: css`
    position: relative;
    padding: 1.7rem 0 2rem;
    width: 100%;
    min-height: 100vh;
    overflow: hidden;
    background-color: var(--backgroundColor);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `,
  container: css`
    position: relative;
    max-width: 81rem;
    width: 100%;
    margin: 0 auto;
    padding: 0 3rem;
    z-index: 1;
  `,
  backgroundShape: css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.1;
    z-index: 0;
    pointer-events: none;
    background: url('images/shape.png') no-repeat center center / cover;
  `,
  logo: css`
    display: flex;
    align-items: center;
    cursor: pointer;
    img {
      width: 90px;
      margin-right: 0.6rem;
      margin-top: -0.6rem;
    }
    h3 {
      color: var(--darkTwo);
      font-size: 1.55rem;
      line-height: 1.2;
      font-weight: 700;
      margin-bottom: 10px;
    }
  `,
  links: css`
    ul {
      display: flex;
      list-style: none;
      align-items: center;
      li {
        a {
          color: var(--lightTwo);
          margin-left: 4.5rem;
          display: inline-block;
          transition: 0.3s;
          &:hover {
            color: var(--hoverColor);
            transform: scale(1.05);
          }
        }
      }
    }
  `,
  header: css`
    position: relative;
    z-index: 70;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
  showcaseArea: css`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
    justify-content: center;
  `,
  bigTitle: css`
    font-size: 2rem;
    color: var(--darkOne);
    text-transform: capitalize;
    line-height: 1.4;
    margin-bottom: 1rem;
  `,
  text: css`
    color: var(--lightOne);
    font-size: 1.1rem;
    margin: 1.9rem 0 2.5rem;
    max-width: 600px;
    line-height: 2.3;
  `,
  btn: css`
    display: inline-block;
    padding: 0.9rem 1.9rem;
    color: #fff !important;
    background-color: var(--mainColor);
    border-radius: 16px;
    text-transform: capitalize;
    transition: 0.3s;
    &:hover {
      background-color: var(--hoverColor);
      transform: scale(1.05) !important;
    }
  `,
  person: css`
    width: 110%;
    transform: translate(10%, 15px);
    height: 425px;
  `,
};

const WelcomePage: React.FC = () => {
  return (
    <main css={globalStyles}>
      <div css={styles.bigWrapper} className="big-wrapper light">
        <div css={styles.backgroundShape} />
        <header css={styles.header} className="container">
          <div css={styles.logo} className="logo">
            <img src="images/The-logo.png" alt="Logo" />
            <h3>GR8ER</h3>
          </div>

          <div css={styles.links} className="links">
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
                <a
                  href="https://www.youtube.com/@GR8ERIB"
                  className="special"
                >
                  <i className="fab fa-youtube fa-2x"></i>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/gr8er_/"
                  className="special"
                >
                  <i className="fab fa-instagram fa-2x"></i>
                </a>
              </li>
            </ul>
          </div>
        </header>

        <div css={styles.showcaseArea} className="showcase-area container">
          <div className="left">
            <div css={styles.bigTitle} className="big-title">
              <h1>The academic</h1>
              <h1>network for IB MYP students</h1>
            </div>
            <p css={styles.text} className="text">
              At GR8ER, we revolutionize the MYP learning experience with
              innovative personalization technology and a community-centric
              approach.
            </p>
            <div className="cta">
              <a
                href="https://www.gr8er.live/home"
                css={styles.btn}
                className="btn"
              >
                Get started
              </a>
            </div>
          </div>

          <div className="right">
            <img
              src="images/Screenshot 2024-06-28 at 10.47.10 AM.png"
              alt="Person Image"
              css={styles.person}
              className="person"
            />
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h3>Used by students from:</h3>
          <img
            src="images/schoools.png"
            style={{ maxWidth: '50%', height: 'auto', marginTop: '20px', alignItems: 'center' }}
          />
        </div>
      </div>
    </main>
  );
};

export default WelcomePage;

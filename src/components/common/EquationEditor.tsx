import React, { useState, useEffect } from 'react';
//import {EditableMathField } from 'react-mathquill';
import TexSymbols from '../common/textSymbols';
import dynamic from 'next/dynamic';
import Head from 'next/head';

//addStyles();
//const EditableMathField = dynamic(() => import('react-mathquill') as any, { ssr: false });
const EditableMathField = dynamic(
  () => import("react-mathquill").then((mod) => mod.EditableMathField),
  { ssr: false }
);

const EquationEditor = ({onInputChange}:any) => {
  const [formula, setFormula] = useState('');

  function handleChange(mathField:any) {
    setFormula(mathField.latex());
    onInputChange('body', mathField.latex());
  }

  function handleInsertSymbol(symbol:any) {
    setFormula(oldFormula => oldFormula + symbol);
  }
  useEffect(() => {
    import("react-mathquill").then((mq) => {
      mq.addStyles();
    });
  }, []);
  return (
    <>
      <Head>
      <script src="https://styleguide.brainly.com/images/math-symbols-icons-2936684655.js"></script>
      </Head>
      {(typeof window !== 'undefined') &&
        <EditableMathField latex={formula} onChange={handleChange} />
      }
      <hr />
      <TexSymbols onClick={handleInsertSymbol} />
    </>
  );
};

export default EquationEditor;

import React, { useState, useEffect } from 'react';
//import { addStyles, EditableMathField } from 'react-mathquill';
import TexSymbols from '../common/textSymbols';
import dynamic from 'next/dynamic';
import Head from 'next/head';

//addStyles();
const EditableMathField = dynamic(
  () => import("react-mathquill").then((mod) => mod.EditableMathField),
  { ssr: false }
);

const EquationEditor = ({bodyValue}:any) => {
  useEffect(() => {
    import("react-mathquill").then((mq) => {
      mq.addStyles();
    });
  }, []);
  return (
    <>
      {typeof window !== 'undefined' && (
        <EditableMathField className="static_math_equation_text" latex={bodyValue}/>
      )}
    </>
  );
};

export default EquationEditor;

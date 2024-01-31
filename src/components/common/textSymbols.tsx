import React from 'react';

import {MathSymbol} from 'brainly-style-guide';

import {Symbols} from './Symbols';

export default function textSymbols({onClick}:any) {
  const buttonNodes = Symbols.map((symbol:any) => (
    <button type="button" key={symbol.icon} className="tex-button" onClick={() => onClick(symbol.data)}>
      <MathSymbol type={symbol.icon} />
    </button>
  ));

  return (
    <div style={{display: 'grid', gridAutoFlow: 'column',gridTemplateRows: 'auto auto', gridGap: 5}}>
      {buttonNodes}
    </div>
  )
}
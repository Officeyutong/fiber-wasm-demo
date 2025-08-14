import { StrictMode, useCallback, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import 'semantic-ui-css/semantic.min.css'
import type { InputOnChangeData } from 'semantic-ui-react'
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/github.css';
hljs.registerLanguage('json', json);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
export type onChangeType = ((event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => void);

export const useInputValue: (text?: string) => { value: string; onChange: onChangeType; set: (s: string) => void; } = (text: string = "") => {
    const [value, setValue] = useState(text);
    const onChange: onChangeType = useCallback((_, d) => {
        setValue(d.value);
    }, []);
    return { value, onChange, set: s => setValue(s) };
};


export function hexStringToUint8Array(hexString: string): Uint8Array {
  const cleanHex = hexString.startsWith('0x') ? hexString.slice(2) : hexString;
  
  const paddedHex = cleanHex.length % 2 === 0 ? cleanHex : '0' + cleanHex;
  
  if (!/^[0-9a-fA-F]*$/.test(paddedHex)) {
    throw new Error('Invalid hex string');
  }
  
  const bytes = new Uint8Array(paddedHex.length / 2);
  
  for (let i = 0; i < paddedHex.length; i += 2) {
    bytes[i / 2] = parseInt(paddedHex.substr(i, 2), 16);
  }
  
  return bytes;
}


export function uint8ArrayToHexString(uint8Array: Uint8Array, withPrefix: boolean = true): string {
  const hexString = Array.from(uint8Array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
  
  return withPrefix ? '0x' + hexString : hexString;
}

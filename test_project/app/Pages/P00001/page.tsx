"use client";

import { useState } from "react";

type InputProps = {
  id: string;
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
};

function Input( props : InputProps) {
  const { id, value, onChange, onEnter } = props;
  return (
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onEnter();
      }}
      placeholder="내용 입력 후 Enter"
    />
  );
}

type ControlsProps = {
  onAppendOne: () => void;
  onAppendText: () => void;
};

function Controls( props : ControlsProps ) {
  return (
    <>
      <button onClick={props.onAppendOne}>1 붙이기</button>
      <button onClick={props.onAppendText} style={{ marginLeft: 8 }}>
        내용 붙이기
      </button>
    </>
  );
}

type PageProps = {
  id: string;
  initialValue: string;
};

function Page( props : PageProps ) {
  const { id, initialValue } = props;
  const [text, setText] = useState(initialValue);
  const [result, setResult] = useState("");

  const appendOne = () => setResult((prev) => prev + "1");

  const appendText = () => {
    const v = text.trim();
    if (!v) return;
    setResult((prev) => prev + v);
    setText("");
  };

  return (
    <main style={{ padding: 24 }}>
      <Controls onAppendOne={appendOne} onAppendText={appendText} />
      <div style={{ marginTop: 12 }}>
        <Input id={id} value={text} onChange={setText} onEnter={appendText} />
      </div>
      <p style={{ marginTop: 12 }}>결과: {result || "(비어있음)"}</p>
    </main>
  );
}

export default function App() {
  return <Page id="content-input" initialValue="" />;
}
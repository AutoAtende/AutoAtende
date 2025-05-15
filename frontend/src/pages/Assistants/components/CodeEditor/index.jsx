// components/CodeEditor/index.jsx
import React from "react";
import { Box } from "@mui/material";
import Editor from "@monaco-editor/react";

export const CodeEditor = ({ 
  value, 
  onChange, 
  language = "javascript", 
  height = "300px",
  readOnly = false 
}) => {
  const handleEditorChange = (value) => {
    onChange(value);
  };

  return (
    <Box sx={{ border: "1px solid #ddd", borderRadius: 1 }}>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          readOnly,
          lineNumbers: "on",
          automaticLayout: true,
          tabSize: 2,
        }}
      />
    </Box>
  );
};

export default CodeEditor;
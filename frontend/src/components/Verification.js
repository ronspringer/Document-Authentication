import React, { useState } from 'react';
import AxiosInstance from './axios'

const Verification = () => {
  const [docId, setDocId] = useState('');
  const [file, setFile] = useState(null);
  const [useOcr, setUseOcr] = useState(false); // State to control OCR option
  const [verificationResult, setVerificationResult] = useState(null);

  const onVerify = () => {
    if (!docId || !file) {
      setVerificationResult('Please provide both the Document ID and the file.');
      return;
    }

    const formData = new FormData();
    formData.append('id', docId); // Append the document ID
    formData.append('document', file); // Append the uploaded file
    formData.append('use_ocr', useOcr ? 'true' : 'false'); // Append the use_ocr flag

    AxiosInstance.post('verify/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important for file uploads
      },
    })
      .then((response) => {
        setVerificationResult(response.data.message);
      })
      .catch((error) => {
        setVerificationResult('Verification failed: ' + (error.response?.data?.error || error.message));
      });
  };

  return (
    <div>
      <input
        type="text"
        value={docId}
        onChange={(e) => setDocId(e.target.value)}
        placeholder="Enter Document ID"
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        accept="application/pdf"
      />

      <label>
        Use OCR for Verification:
        <input
          type="checkbox"
          checked={useOcr}
          onChange={(e) => setUseOcr(e.target.checked)} // Toggle OCR option
        />
      </label>

      <button onClick={onVerify}>Verify Document</button>

      {verificationResult && <p>{verificationResult}</p>}
    </div>
  );
};

export default Verification;

// App.js
import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import UploadDocument from './components/UploadDocument';
import Verification from './components/Verification';
import DocumentDownloadComponent from './components/DocumentDownloadComponent';

const App = () => {
  
  return (
    <div>
      <h1>Document Authentication</h1>

        <div>
          <UploadDocument />
        </div>

      <h1>Verify Document</h1>
      <div>
          <Verification />
        </div>
      
      <div>
          <DocumentDownloadComponent />
      </div>
    </div>
  );
};

export default App;

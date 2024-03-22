import React from 'react';
import Web3Uploader from 'web3-uploader';
import './App.css';

function App() {
  const handleUploaded = (cid: any, ret: any) => {
    console.log(cid, 'handle uploaded:', ret)
  }

  const handleLoading = (val: boolean) => {
    console.log('handle loading:', val)
  }

  return (
    <div className="App">
      <Web3Uploader
        apiToken={process.env.WEB3_TOKEN}
        onUploaded={handleUploaded}
        onLoading={handleLoading}
      />
    </div>
  );
}

export default App;

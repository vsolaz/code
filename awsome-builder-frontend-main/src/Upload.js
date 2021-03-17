import { Storage } from "aws-amplify";
import { useState } from "react";
// import styled from "styled-components";

function Upload({ user }) {
  const [progress, setProgress] = useState(0);

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const res = await Storage.put(file.name, file, {
        customPrefix: {
          public: "",
        },
        progressCallback(progress) {
          setProgress(Math.round((progress.loaded * 100) / progress.total));
        },
      });
      console.log(res);
    } catch (err) {
      console.log("Error uploading file: ", err);
    }
  }

  return (
    <div>
      <h1>Upload Area</h1>
      <p>Upload a video to process it:</p>
      <input type="file" onChange={onChange} />
      {progress !== 0 ? <p>Uploaded: {progress}%</p> : null}
    </div>
  );
}

export default Upload;

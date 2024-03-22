// @ts-ignore
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js';
import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CIDString } from 'web3.storage/dist/src/lib/interface';
import './uploader.css';


interface Uploader {
  apiToken: string;
  onLoading: (isLoading: boolean) => void;
  onUploaded: (cid: CIDString | undefined, ret: Upload[]) => void;
  accept?: string | string[];
  maxFiles?: number;
  disabled?: boolean;
  canUpload?: boolean;
}

interface Upload {
  name: string;
  cid: string;
}

const Web3Uploader = ({ apiToken, accept, maxFiles = 0, onLoading, onUploaded, disabled = false, canUpload = true }: Uploader): JSX.Element => {
  const [files, setFiles] = useState<File[]>([]);
  const [storage, setStorage] = useState<Web3Storage>();

  useEffect(() => {
    setStorage(new Web3Storage({ token: apiToken }))
  }, [])

  useEffect(() => {
    if (files.length > 0 && canUpload && storage) {
      files.forEach(async (file: any) => {
        URL.revokeObjectURL(file.preview);
      })

      upload(files);
    }
  }, [files, canUpload, storage])

  const upload = async (fileList: File[]) => {
    // show the root cid as soon as it's ready
    const onRootCidReady = (cid: string) => {
      console.log('uploading files with cid:', cid)
    }

    // when each chunk is stored, update the percentage complete and display
    const totalSize = fileList.map(f => f.size).reduce((a, b) => a + b, 0)
    let uploaded = 0

    const onStoredChunk = (size: number) => {
      uploaded += size
      const pct = totalSize / uploaded
      console.log(`Uploading... ${pct.toFixed(2)}% complete`)
    }

    const rootCid = await storage?.put(fileList, { onRootCidReady, onStoredChunk });
    const res = rootCid && await storage?.get(rootCid)
    if (!res?.ok) {
      throw new Error(`failed to get ${rootCid} - [${res?.status}] ${res?.statusText}`)
    }

    const ret: Upload[] = []
    // unpack File objects from the response
    const files = await res.files()
    for (const file of files) {
      ret.push({ name: file.name, cid: file.cid });
    }
    onUploaded(rootCid, ret);
  }

  // @ts-ignore
  const uploadFileToFilecoin = (file: any) => {
    onLoading(true);
    const reader = new FileReader();
    reader.onabort = () => { throw Error(`File ${file.name} reading was aborted`) }
    reader.onerror = () => { throw Error(`File ${file.name} reading has failed`) }
    
    reader.onloadend = async () => {
      // setFileList(reader.result)
    }
    reader.readAsArrayBuffer(file);
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: accept,
    maxFiles: maxFiles,
    disabled,
    onDrop: (acceptedFiles: any) => {
      setFiles(acceptedFiles.map((file: File) => {
        return Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
      }));
    }
  });

  return (
    <section className="container">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
        {
          accept ? `<em>(Only ${accept} will be accepted)</em>` : ''
        }
        {
          maxFiles ? `<em>(${maxFiles} files are the maximum number of files you can drop here)</em>` : ''
        }
      </div>
    </section>
  );
};

export default Web3Uploader;

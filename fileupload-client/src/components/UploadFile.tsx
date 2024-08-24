import { Button, Checkbox, LoadingOverlay } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import React, { Dispatch, SetStateAction, useState } from "react";
import { FileType } from "../pages/Home";

type UploadFilePropsType = {
  files: FileType[];
  filteredFiles: FileType[];
  setFilteredFiles: Dispatch<SetStateAction<FileType[]>>;
  getFiles: () => void;
};

const UploadFile: React.FC<UploadFilePropsType> = ({
  files,
  filteredFiles,
  setFilteredFiles,
  getFiles,
}) => {
  const [inputFiles, setInputFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadFiles = async (e: React.FormEvent) => {
    const jwt = localStorage.getItem("jwt");
    e.preventDefault();
    const formData = new FormData();

    if (inputFiles) {
      setUploading(true);
      for (let i = 0; i < inputFiles.length; ++i) {
        formData.append("files", inputFiles[i]);
      }
      try {
        const response = await axios({
          method: "post",
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Access-Control-Allow-Origin": "*",
          },
          url:
            import.meta.env.VITE_BASE_URL +
            import.meta.env.VITE_API_VERSION +
            "/s3/upload",
          data: formData,
        });

        if (response.status === 200) {
          setUploading(false);
          showNotification({
            title: "Success",
            message: "successfully uploaded files",
            color: "white",
            style: { backgroundColor: "green" },
            position: "top-left",
            w: "20rem",
            styles: (theme) => ({
              title: { color: theme.white },
              description: { color: theme.white },
            }),
          });
          getFiles();
        }
      } catch (err) {
        setUploading(false);
        showNotification({
          title: "Error",
          message: "could not upload files",
          color: "white",
          style: { backgroundColor: "red" },
          position: "top-left",
          w: "20rem",
          styles: (theme) => ({
            title: { color: theme.white },
            description: { color: theme.white },
          }),
        });
      }
    } else {
      showNotification({
        title: "No Files",
        message: "please select at least one file",
        color: "white",
        style: { backgroundColor: "red" },
        position: "top-left",
        w: "20rem",
        styles: (theme) => ({
          title: { color: theme.white },
          description: { color: theme.white },
        }),
      });
    }
  };

  const filterFilesCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const ff = files.filter((f) => f.fileType === e.target.id);
      setFilteredFiles((prevFF) => [...prevFF, ...ff]);
    } else {
      const ff = filteredFiles.filter((f) => f.fileType !== e.target.id);
      setFilteredFiles(ff);
    }
  };

  return (
    <div className="file-uploader-container">
      <LoadingOverlay
        visible={uploading}
        zIndex={1000}
        overlayProps={{ radius: "lg", blur: 2 }}
      />
      <form className="file-uploader" onSubmit={uploadFiles}>
        <label htmlFor="files">Select your files</label>
        <input
          type="file"
          multiple
          id="files"
          accept="application/pdf, audio/*, video/*, image/*"
          onChange={(e) => setInputFiles(e.target.files)}
        />
        <Button type="submit" variant="light" size="md" mt={"lg"}>
          Upload
        </Button>
      </form>
      <Checkbox
        onChange={filterFilesCheckbox}
        id="pdfs"
        label="Show only pdf files"
        size="md"
        mt={"lg"}
      />
      <Checkbox
        onChange={filterFilesCheckbox}
        id="audios"
        label="Show only audio files"
        size="md"
        mt={"lg"}
      />
      <Checkbox
        onChange={filterFilesCheckbox}
        id="images"
        label="Show only image files"
        size="md"
        mt={"lg"}
      />
      <Checkbox
        onChange={filterFilesCheckbox}
        id="videos"
        label="Show only video files"
        size="md"
        mt={"lg"}
      />
    </div>
  );
};

export default UploadFile;

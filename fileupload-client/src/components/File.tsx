import { Button, Loader, Table, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import React, { useState } from "react";
import {
  FaFileAudio,
  FaFileImage,
  FaFilePdf,
  FaFileVideo,
} from "react-icons/fa";
import ViewFiles from "./ViewFiles";
import { FileType } from "../pages/Home";
import axios from "axios";
import { showNotification } from "@mantine/notifications";

type FilePropsType = {
  file: FileType;
  getFiles: () => void;
};

const File: React.FC<FilePropsType> = ({ file, getFiles }) => {
  const [downloading, setDownloading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  // const [downloadUrl, setDownloadUrl] = useState<string>("");
  const openDeleteModal = () => {
    modals.openConfirmModal({
      radius: "md",
      title: "Delete File",
      centered: true,
      children: (
        <Text>
          Are you sure you want to delete this file? This action cannot be
          undone
        </Text>
      ),
      labels: { confirm: "Delete File", cancel: "No don't delete it" },
      confirmProps: { color: "red" },
      // onCancel: () => console.log("Cancel"),
      onConfirm: () => deleteFile(),
    });
  };

  const openFileViewModal = () => {
    modals.open({
      size: "xl",
      radius: "md",
      title: `${file.fileName}`,
      centered: true,
      children: <ViewFiles file={file} />,
    });
  };

  const deleteFile = async () => {
    setDeleting(true);
    try {
      const jwt = localStorage.getItem("jwt");
      const response = await axios({
        method: "delete",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        url:
          import.meta.env.VITE_BASE_URL +
          import.meta.env.VITE_API_VERSION +
          `/delete-file?id=${file.id}&filename=${file.filePathInS3}`,
      });
      if (response.status === 200) {
        getFiles();
      }
    } catch (err) {
      showNotification({
        title: "Something went wrong",
        message: "please please try again later",
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
    setDeleting(false);
  };

  const downloadFile = async () => {
    setDownloading(true);
    try {
      const jwt = localStorage.getItem("jwt");
      const response = await axios({
        method: "get",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        responseType: "blob",
        url:
          import.meta.env.VITE_BASE_URL +
          import.meta.env.VITE_API_VERSION +
          `/download-file?filename=${file.filePathInS3}&id=${file.id}`,
        // url: "https://jsonplaceholder.typicode.com/todos/1",
      });

      console.log(response);

      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", file.fileName);

        // Append to the body and trigger download
        document.body.appendChild(link);
        link.click();

        // Clean up
        link?.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      showNotification({
        title: "Something went wrong",
        message: "please please try again later",
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
    setDownloading(false);
  };

  return (
    <>
      <Table.Tr>
        <Table.Td>
          {file.fileType === "pdfs" ? <FaFilePdf size={"1.5rem"} /> : null}
          {file.fileType === "audios" ? <FaFileAudio size={"1.5rem"} /> : null}
          {file.fileType === "videos" ? <FaFileVideo size={"1.5rem"} /> : null}
          {file.fileType === "images" ? <FaFileImage size={"1.5rem"} /> : null}
        </Table.Td>
        <Table.Td>{file.fileName}</Table.Td>
        <Table.Td>{new Date(file.uploadDate).toLocaleString()}</Table.Td>
        <Table.Td ta={"center"}>
          <Button onClick={openFileViewModal} size="md" mr={"1rem"}>
            View
          </Button>
          <Button onClick={downloadFile} size="md" mr={"1rem"}>
            {downloading ? (
              <>
                <Loader color="#fff" mr={"md"} size={25} />
              </>
            ) : (
              <>Download</>
            )}
          </Button>
          <Button onClick={openDeleteModal} size="md" mr={"1rem"}>
            {deleting ? (
              <>
                <Loader color="#fff" mr={"md"} size={25} />
              </>
            ) : (
              <>Delete</>
            )}
          </Button>
        </Table.Td>
      </Table.Tr>
    </>
  );
};

export default File;

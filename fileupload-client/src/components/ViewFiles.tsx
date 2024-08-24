import React, { useEffect, useState } from "react";
import { FileType } from "../pages/Home";
import axios from "axios";
import { Container, Loader } from "@mantine/core";
import { showNotification } from "@mantine/notifications";

type ViewFilesPropsType = {
  file: FileType;
};

const ViewFiles: React.FC<ViewFilesPropsType> = ({ file }) => {
  const [url, setUrl] = useState<string>("");
  const [loader, setLoader] = useState<boolean>(false);
  useEffect(() => {
    // console.log(file);
    setLoader(true);
    const getUrl = async () => {
      try {
        const jwt = localStorage.getItem("jwt");
        const response = await axios({
          method: "get",
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
          url:
            import.meta.env.VITE_BASE_URL +
            import.meta.env.VITE_API_VERSION +
            `/get-url?filename=${file.filePathInS3}`,
          // url: "https://jsonplaceholder.typicode.com/todos/1",
        });

        if (response.status === 200) {
          setUrl(response.data);
        }
      } catch (err) {
        showNotification({
          title: "Something went wrong",
          message: "please try again later",
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

      setLoader(false);
    };
    getUrl();
  }, []);
  return (
    <Container style={{ display: "flex", justifyContent: "center" }}>
      {loader ? (
        <Loader size={"lg"} m={"lg"} />
      ) : (
        <>
          {file.fileType === "pdfs" ? (
            <iframe
              style={{ height: "50rem", width: "50rem" }}
              src={url}
              title={file.fileName}
            ></iframe>
          ) : null}
          {file.fileType === "images" ? (
            <img
              style={{ height: "20rem", width: "20rem" }}
              src={url}
              alt="s3-image"
            />
          ) : null}
          {file.fileType === "audios" ? (
            <audio controls>
              <source src={url} type="audio/mp3"></source>
              Your browser does not support the audio tag.
            </audio>
          ) : null}
          {file.fileType === "videos" ? (
            <video style={{ height: "20rem", width: "20rem" }} controls>
              <source src={url} type="video/mp4"></source>
              Your browser does not support the audio tag.
            </video>
          ) : null}
        </>
      )}
    </Container>
  );
};

export default ViewFiles;

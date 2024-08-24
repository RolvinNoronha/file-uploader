import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadFile from "../components/UploadFile";
import Header from "../components/Header";
import AllFiles from "../components/AllFiles";
import { Button } from "@mantine/core";
import { showNotification } from "@mantine/notifications";

export type FileType = {
  id: number;
  fileName: string;
  fileType: string;
  uploadDate: string;
  filePathInS3: String;
  fileSize: number;
  userId: number;
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [filteredFiles, setFilteredFiles] = useState<FileType[]>([]);
  const [files, setFiles] = useState<FileType[]>([
    // {
    //   id: 1,
    //   fileName: "my resume",
    //   fileType: "pdf",
    //   filePathInS3: "/user/home",
    //   uploadDate: "3/10/2024",
    //   fileSize: 10,
    //   userId: 1,
    // },
    // {
    //   id: 2,
    //   fileName: "my audio",
    //   fileType: "audio",
    //   filePathInS3: "/user/home",
    //   uploadDate: "4/10/2024",
    //   fileSize: 10,
    //   userId: 1,
    // },
  ]);
  const getFiles = async () => {
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
          "/files",
      });

      if (response.status == 200) {
        setFiles(response.data.reverse());
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403 || err.response?.status == 401) {
          showNotification({
            title: "Session Expired",
            message: "please login again",
            color: "white",
            style: { backgroundColor: "red" },
            position: "top-left",
            w: "20rem",
            styles: (theme) => ({
              title: { color: theme.white },
              description: { color: theme.white },
            }),
          });
          navigate("/");
        } else {
          showNotification({
            title: "Error",
            message: "refresh and try again",
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
      }
    }
  };
  useEffect(() => {
    getFiles();
  }, []);

  const logout = async () => {
    try {
      const jwt = localStorage.getItem("jwt");
      const response = await axios({
        method: "post",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        url:
          import.meta.env.VITE_BASE_URL +
          import.meta.env.VITE_API_VERSION +
          "/logout",
      });

      if (response.status === 200) {
        localStorage.removeItem("jwt");
        showNotification({
          title: "Success",
          message: "successfully logged out",
          color: "white",
          style: { backgroundColor: "green" },
          position: "top-left",
          w: "20rem",
          styles: (theme) => ({
            title: { color: theme.white },
            description: { color: theme.white },
          }),
        });
        navigate("/");
      }
    } catch (err) {
      console.log(err);
      showNotification({
        title: "Error",
        message: "could not log you out",
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
  return (
    <>
      <Header />
      <div className="main-content">
        <nav className="navbar">
          <UploadFile
            files={files}
            filteredFiles={filteredFiles}
            setFilteredFiles={setFilteredFiles}
            getFiles={getFiles}
          />
          <Button size="md" variant="filled" color="red" onClick={logout}>
            Log Out
          </Button>
        </nav>
        <AllFiles
          setFiles={setFiles}
          files={files}
          setFilteredFiles={setFilteredFiles}
          filteredFiles={filteredFiles}
          getFiles={getFiles}
        />
      </div>
    </>
  );
};

export default Home;

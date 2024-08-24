import {
  Button,
  Flex,
  LoadingOverlay,
  Paper,
  PasswordInput,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import React, { Dispatch, SetStateAction, useState } from "react";
import { useNavigate } from "react-router-dom";

type LoginPropsType = {
  setLogin: Dispatch<SetStateAction<boolean>>;
};

const Login: React.FC<LoginPropsType> = ({ setLogin }) => {
  const navigate = useNavigate();
  const form = useForm({
    mode: "uncontrolled",
    validateInputOnBlur: true,
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length < 8 ? "Password must be atleast 8 characters" : null,
    },
  });
  const [loginForm, setLoginForm] = useState(false);

  const login = async (values: typeof form.values) => {
    setLoginForm(true);
    try {
      const response = await axios({
        method: "post",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        url:
          import.meta.env.VITE_BASE_URL +
          import.meta.env.VITE_API_VERSION +
          "/auth/login",
        data: JSON.stringify(values),
      });

      if (response.status === 200) {
        setLoginForm(false);
        localStorage.setItem("jwt", response.data.token);
        navigate("/home");
      }
    } catch (err) {
      setLoginForm(false);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          showNotification({
            title: "Error",
            message: "no username found",
            color: "white",
            style: { backgroundColor: "red" },
            position: "top-left",
            w: "20rem",
            styles: (theme) => ({
              title: { color: theme.white },
              description: { color: theme.white },
            }),
          });
        } else if (err.response?.status === 403) {
          showNotification({
            title: "Error",
            message: "wrong username or password",
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
  return (
    <Flex h={"80vh"} w={"100vw"} justify={"center"} align={"center"}>
      <Paper
        pos={"relative"}
        p={"xl"}
        h={350}
        w={700}
        bg={"gray.3"}
        shadow="lg"
        radius={"lg"}
      >
        <LoadingOverlay
          visible={loginForm}
          zIndex={1000}
          overlayProps={{ radius: "lg", blur: 2 }}
        />
        <form onSubmit={form.onSubmit(login)}>
          <TextInput
            mt="sm"
            label="Email"
            placeholder="Email"
            key={form.key("email")}
            variant="filled"
            withAsterisk
            {...form.getInputProps("email")}
          />
          <PasswordInput
            mt="sm"
            label="Password"
            placeholder="Password"
            key={form.key("password")}
            variant="filled"
            withAsterisk
            {...form.getInputProps("password")}
          />
          <Button type="submit" mt="sm">
            Submit
          </Button>
        </form>
        <Text mt={"md"} size="sm">
          Don't have an account{" "}
          <span
            style={{ color: "steelblue", cursor: "pointer" }}
            onClick={() => setLogin(false)}
          >
            Sign Up
          </span>
        </Text>
      </Paper>
    </Flex>
  );
};

export default Login;

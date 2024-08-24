import React, { useState } from "react";
import SignUp from "../components/SignUp";
import Login from "../components/Login";
import Header from "../components/Header";

const LoginSignUp: React.FC = () => {
  const [login, setLogin] = useState<boolean>(false);
  return (
    <>
      <Header />
      {login ? <Login setLogin={setLogin} /> : <SignUp setLogin={setLogin} />}
    </>
  );
};

export default LoginSignUp;

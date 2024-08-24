import React from "react";
import { FaFileUpload } from "react-icons/fa";

const Header: React.FC = () => {
  return (
    <header className="site-header">
      <div className="site-identity">
        <h1>
          <FaFileUpload size={"1.5rem"} />
          <a href="#">File Uploader</a>
        </h1>
      </div>
    </header>
  );
};

export default Header;

import React from "react";

const Header = (props) => {
  return (
    <div>
      {" "}
      header <br /> {props.name || "Nu esti logat ! "}
    </div>
  );
};

export default Header;

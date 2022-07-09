import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import headerLogo from "./../images/Vector.svg";
import group_8 from "./../images/Group_8.svg";
import closeIcon from "./../images/closeIcon.svg";

function Header(props) {
  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(min-width: 601px)").matches
  );
  const [isToggle, setIsToggle] = useState(false);
  const [isAddInfo, setIsAddInfo] = useState({
    display: "none",
    src: group_8,
  });

  // Начудил наверно с версткой.

  const headerInfo = (
    <div className="header__info">
      <span className="header__email">{props.email}</span>

      <Link
        className="header__link button-hover"
        onClick={props.signOut}
        to={props.link}
      >
        {props.infoLink}
      </Link>
    </div>
  );

  useEffect(() => {
    const handler = (e) => setIsMobile(e.matches);
    window.matchMedia("(min-width: 601px)").addEventListener("change", handler);
    return () =>
      window
        .matchMedia("(min-width: 601px)")
        .removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    isToggle
      ? setIsAddInfo({ display: "flex", src: closeIcon })
      : setIsAddInfo({ display: "none", src: group_8 });
  }, [isToggle]);

  const toggle = () => {
    setIsToggle(!isToggle);
  };

  return (
    <header className="header page__header">
      {!isMobile && (
        <div style={{ display: isAddInfo.display }}>{headerInfo}</div>
      )}
      <div className="header__desktop">
        <img className="header__logo" src={headerLogo} alt="Логотип" />
        {isMobile ? (
          <div>{headerInfo}</div>
        ) : !(props.infoLink === "Выйти") ? (
          <Link
            className="header__link button-hover"
            style={{ fontSize: "14px", lineHeight: "17px" }}
            onClick={props.signOut}
            to={props.link}
          >
            {props.infoLink}
          </Link>
        ) : (
          <img
            className="header__icon button-hover"
            onClick={toggle}
            src={`${isAddInfo.src}`}
            alt="Кнопка"
          />
        )}
      </div>
    </header>
  );
}

export default Header;

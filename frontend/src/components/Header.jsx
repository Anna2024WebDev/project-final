import React, { useCallback } from "react"; // Ensure useCallback is imported
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import playground from "../assets/PlaygroundFinder_white.png";
import playgroundImage from "../assets/playground.png";
import { routes } from "../utils/routes";
import { HamburgerMenu } from "./HamburgerMenu";
import { usePlaygroundStore } from "../stores/usePlaygroundStore";
import { shallow } from "zustand/shallow";
import { useEffect } from "react";

const HeaderContainer = styled.header`
  display: flex;
  justify-content: center; 
  align-items: center;
  padding: 15px 20px;
  height: 50px;
  background-color: #315a5c;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  margin-top: 35px;
  z-index: 1;
`;

const HeaderImg = styled.img`
  position: absolute;
  left: 20px;
  width: 15rem;
  height: auto;
  padding: 5px;

  @media (max-width: 1000px) {
    width: 18rem;
    left: unset;
    margin: 0 auto;
    display: block;
    padding: 5px 40px 0px 0px;
  }

  @media (max-width: 480px) {
    width: 15rem; 
  }
`;

const StyledImage = styled.img`
  position: absolute;
  right: 30px;
  width: 4rem;
  height: auto;
  padding: 5px;

  @media (max-width: 1000px) {
    display: none; /* Hide the image on smaller screens */
  }
`;

const Nav = styled.nav`
  display: flex;
  justify-content: center;

  @media (max-width: 1000px) {
    display: none; 
  }
`;

const NavList = styled.ul`
  display: flex;
  list-style: none;
  gap: 20px;
  margin: 0;
  padding: 0;

  @media (max-width: 1300px) {
    padding-left: 120px;
  }
`;

const StyledNavLink = styled(NavLink)`
  text-decoration: none;
  color: white;
  font-size: 20px; 
  font-weight: bold;
  font-family: "Poppins";
  &:hover {
    color: #E6FA54;
  }
`;

export const Header = () => {
  // Directly select setSearchQuery from the store using shallow
  const setSearchQuery = usePlaygroundStore((state) => state.setSearchQuery, shallow);

  useEffect(() => {
    setSearchQuery(""); // Clears search query on page reload
  }, [setSearchQuery]);

  const handleHomeClick = useCallback(() => {
    // Clear the persisted search query so that the homepage uses geolocation next time
    setSearchQuery("");
  }, [setSearchQuery]);

  return (
    <HeaderContainer>
      <HeaderImg src={playground} alt="Playground Finder Logo" />
      <StyledImage src={playgroundImage} alt="playground image" />
      <Nav>
        <NavList>
          <StyledNavLink
            to={routes.home}
            aria-label="Go to Home page"
            onClick={handleHomeClick}
          >
            Home
          </StyledNavLink>
          <StyledNavLink to={routes.login} aria-label="Go to Login page">
            Login
          </StyledNavLink>
          <StyledNavLink to={routes.profile} aria-label="Go to Profile">
            Profile
          </StyledNavLink>
          <StyledNavLink to={routes.activities} aria-label="Go to Activities">
            Activities
          </StyledNavLink>
          <StyledNavLink to={routes.about} aria-label="Go to about page">
            About
          </StyledNavLink>
        </NavList>
      </Nav>
      <HamburgerMenu />
    </HeaderContainer>
  );
};

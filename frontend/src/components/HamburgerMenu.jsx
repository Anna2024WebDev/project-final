import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { usePlaygroundStore } from "../stores/usePlaygroundStore";

const HamburgerIcon = styled.div`
  display: none; 

  @media (max-width: 1000px) {
    display: flex;
    position: absolute;
    top: 1.5rem;
    right: 1rem; 
    width: 30px;
    height: 25px;
    flex-direction: column;
    justify-content: space-between;
    cursor: pointer;

    div {
      width: 100%;
      height: 4px;
      background-color: ${({ $isOpen }) => ($isOpen ? "#E6FA54" : "white")};
      border-radius: 4px;
      transition: all 0.3s ease-in-out;
    }

    div:nth-child(1) {
      transform: ${({ $isOpen }) => ($isOpen ? "rotate(45deg) translate(7px, 7px)" : "none")};
    }
    
    div:nth-child(2) {
      opacity: ${({ $isOpen }) => ($isOpen ? "0" : "1")};
    }
    
    div:nth-child(3) {
      transform: ${({ $isOpen }) => ($isOpen ? "rotate(-45deg) translate(7px, -7px)" : "none")};
    }
  }
`;

// MenuBox for the actual menu
const MenuBox = styled.div` 
  position: fixed; 
  top: 0;
  right: 0;
  background-color: #315a5c;
  width: 100vw; 
  height: 100vh; 
  padding: 0rem 0.5rem;
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
  z-index: 1000;
  transition: all 0.3s ease-in-out;

  /* Center the menu content */
  ul {
    list-style: none;
    padding-top: 70px; 
    margin: 0;
    text-align: center; 
  }

  li {
    padding: 1rem 0;
    font-size: 1.5rem;

    @media (max-width: 768px) {
      font-size: 1.3rem; 
    }

    @media (max-width: 480px) {
      font-size: 1.2rem; 
    }
  }

  a { 
    color: white;
    text-decoration: none;
    font-weight: 300;
    font-family: "Poppins";
    &:hover {
      color: #E6FA54;
    }
  }

 
  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 4rem; 
    color: #E6FA54; 
    cursor: pointer;
    z-index: 1001; 
    display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
  }

  @media (min-width: 1001px) {
    display: none;
  }

  @media (min-width: 768px) {
    width: 14rem;
    height: 19rem;
  }
`;

export const HamburgerMenu = () => {
  const { isMenuOpen, toggleMenu, closeMenu } = usePlaygroundStore();

  // Handle menu close when an item is clicked
  const handleLinkClick = () => {
    closeMenu();
  };

  return (
    <>
      <HamburgerIcon onClick={toggleMenu} $isOpen={isMenuOpen}>
        <div></div>
        <div></div>
        <div></div>
      </HamburgerIcon>

      <MenuBox $isOpen={isMenuOpen}>
        {/* Close Button for the menu */}
        <div className="close-button" onClick={closeMenu}>
          &times; {/* Yellow "X" symbol for close */}
        </div>

        <ul>
          <li>
            <NavLink to="/" onClick={handleLinkClick} className={({ isActive }) => (isActive ? "active" : "")} aria-label="Go to Home page">Home</NavLink>
          </li>
          <li>
            <NavLink to="/login" onClick={handleLinkClick} className={({ isActive }) => (isActive ? "active" : "")} aria-label="Go to Login page">Login</NavLink>
          </li>
          <li>
            <NavLink to="/profile" onClick={handleLinkClick} className={({ isActive }) => (isActive ? "active" : "")} aria-label="Go to Profile">Profile</NavLink>
          </li>
          <li>
            <NavLink to="/activities" onClick={handleLinkClick} className={({ isActive }) => (isActive ? "active" : "")} aria-label="Go to Activities">Activities</NavLink>
          </li>
          <li>
            <NavLink to="/about" onClick={handleLinkClick} className={({ isActive }) => (isActive ? "active" : "")} aria-label="About PlayGroundFinder">About</NavLink>
          </li>
        </ul>
      </MenuBox>
    </>
  );
};

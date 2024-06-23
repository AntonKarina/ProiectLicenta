import React, { useContext, useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from './AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar = styled.div`
  background: transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
`;

const NavList = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: flex;
`;

const NavItem = styled.li`
  margin: 0 10px;
  position: relative;
`;

const NavLink = styled(Link)`
  color: black;
  text-decoration: none;
  padding: 8px 10px;
  transition: color 0.3s, border-bottom 0.3s;

  &:hover {
    color: #ff4081;
    border-bottom: 2px solid #ff4081;
  }

  ${props => props.active && `
    color: #ff4081;
    border-bottom: 2px solid #ff4081;
  `}
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
`;

const EmailDisplay = styled.span`
  color: black;
  margin-right: 10px;
  font-size: 14px;
`;

const MenuIcon = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
    cursor: pointer;
    font-size: 24px;
    color: black;
  }
`;

const DropdownMenu = styled.ul`
  display: ${props => (props.show ? 'block' : 'none')};
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  list-style: none;
  top: 40px;
  left: 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 200px;

  & > ${NavItem} {
    margin: 5px 0;
  }
`;

const Layout = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleAdminMenu = () => {
    setShowAdminMenu(!showAdminMenu);
  };

  const getIsActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <Navbar>
        <Link to="/" style={{ textDecoration: 'none', color: 'black', fontSize: '22px' }}></Link>
        <NavList className={isOpen ? 'open' : ''}>
          <NavItem><NavLink to="/home" active={getIsActive('/home')}>Home</NavLink></NavItem>
          <NavItem><NavLink to="/clubs" active={getIsActive('/clubs')}>Clubs</NavLink></NavItem>
          {isAuthenticated && user && (
            <>
              <NavItem><NavLink to="/profile" active={getIsActive('/profile')}>Profile</NavLink></NavItem>
              <NavItem><NavLink to="/groupmanagement" active={getIsActive('/groupmanagement')}>Management</NavLink></NavItem>
            </>
          )}
          <NavItem><NavLink to="/events" active={getIsActive('/events')}>Events</NavLink></NavItem>
          {isAuthenticated && user && (
            <NavItem><NavLink to="/paymentsummary" active={getIsActive('/paymentsummary')}>Payments</NavLink></NavItem>
          )}
          <NavItem><NavLink to="/publicschedule" active={getIsActive('/publicschedule')}>Schedule</NavLink></NavItem>
          <NavItem><NavLink to="/results" active={getIsActive('/results')}>Results</NavLink></NavItem>
          {isAuthenticated && user && user.role === 'admin' && (
            <NavItem>
              <NavLink as="span" onClick={toggleAdminMenu} active={showAdminMenu}>
                Admin
              </NavLink>
              <DropdownMenu show={showAdminMenu}>
                <NavItem><NavLink to="/add-event" active={getIsActive('/add-event')}>Add Event</NavLink></NavItem>
                <NavItem><NavLink to="/admin-competitions" active={getIsActive('/admin-competitions')}>Admin Schedule</NavLink></NavItem>
                <NavItem><NavLink to="/add-result/:competitionId" active={getIsActive('/add-result/:competitionId')}>Add Result</NavLink></NavItem>
              </DropdownMenu>
            </NavItem>
          )}
        </NavList>
        <RightSection>
          {isAuthenticated && user ? (
            <div>
              <EmailDisplay>{user.email}</EmailDisplay>
              <NavLink as="span" onClick={logout}>Log out</NavLink>
            </div>
          ) : (
            <NavLink to="/login">Log in</NavLink>
          )}
        </RightSection>
      </Navbar>
      <div style={{ paddingTop: '60px' }}>
        <Outlet />
      </div>
    </>
  );
};

export default Layout;

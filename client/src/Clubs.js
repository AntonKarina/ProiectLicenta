import React, { useState, useEffect } from 'react';
import axios from './axiosConfig';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const PageBackground = styled.div`
    background: #ffffff; /* Light background */
    min-height: 100vh;
    padding: 40px 0;
    text-align: center;
`;

const StyledContainer = styled(Container)`
    padding: 30px;
    max-width: 1200px;
    margin: auto;
`;

const StyledCard = styled(Card)`
    border: none;
    border-radius: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
    margin: 20px 0;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }
`;

const ProfilePic = styled.img`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    margin: 0 auto 15px auto;
    display: block;
`;

const SearchForm = styled(Form)`
    background: #ffffff; /* White background for the form */
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    margin-bottom: 30px;
`;

const Header = styled.h1`
    font-size: 2.5rem;
    font-weight: bold;
    color: #e84393;
    margin-bottom: 20px;
`;

const Subheader = styled.h2`
    font-size: 1.5rem;
    font-weight: normal;
    color: #e84393;
    margin-bottom: 40px;
`;

const Clubs = () => {
    const [clubs, setClubs] = useState([]);
    const [search, setSearch] = useState({
        club_name: '',
        trainer_name: ''
    });

    useEffect(() => {
        fetchClubs();
    }, [search]);

    const fetchClubs = () => {
        const params = new URLSearchParams(search).toString();
        axios.get(`/clubs?${params}`)
            .then(res => {
                setClubs(res.data.clubs);
            })
            .catch(err => {
                console.error('Error fetching clubs:', err);
            });
    };

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearch(prevState => ({ ...prevState, [name]: value }));
    };

    return (
        <PageBackground>
            <StyledContainer>
                <Header>Dance Clubs</Header>
                <Subheader>Hi, checkout the dance clubs!</Subheader>
                <SearchForm>
                    <Row>
                        <Col md={6} sm={12}>
                            <Form.Group controlId="formClubName">
                                <Form.Label>Search by Club Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="club_name"
                                    value={search.club_name}
                                    onChange={handleSearchChange}
                                    placeholder="Club Name"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6} sm={12}>
                            <Form.Group controlId="formTrainerName">
                                <Form.Label>Search by Trainer Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="trainer_name"
                                    value={search.trainer_name}
                                    onChange={handleSearchChange}
                                    placeholder="Trainer Name"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </SearchForm>
                <Row>
                    {clubs.map(club => (
                        <Col key={club.club_id} sm={12} md={6} lg={4} className="mb-4">
                            <Link to={`/clubs/${club.club_id}`} style={{ textDecoration: 'none' }}>
                                <StyledCard>
                                    <Card.Body>
                                        {club.club_profile_pic && (
                                            <ProfilePic
                                                src={`data:image/jpeg;base64,${club.club_profile_pic}`}
                                                alt={`${club.club_name} profile`}
                                            />
                                        )}
                                        <Card.Title>{club.club_name}</Card.Title>
                                        <Card.Text>
                                            Trainer: {club.trainer_name}
                                        </Card.Text>
                                    </Card.Body>
                                </StyledCard>
                            </Link>
                        </Col>
                    ))}
                </Row>
            </StyledContainer>
        </PageBackground>
    );
}

export default Clubs;

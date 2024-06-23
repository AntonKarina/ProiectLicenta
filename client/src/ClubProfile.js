import React, { useEffect, useState } from 'react';
import axios from './axiosConfig';
import { useParams } from 'react-router-dom';
import { Container, Card, ListGroup } from 'react-bootstrap';

const ClubProfile = () => {
    const { id } = useParams();
    const [club, setClub] = useState(null);

    useEffect(() => {
        axios.get(`/clubs/${id}`)
            .then(res => {
                setClub(res.data.club);
            })
            .catch(err => {
                console.error('Error fetching club:', err);
            });
    }, [id]);

    if (!club) {
        return <p>Loading...</p>;
    }

    return (
        <Container className="mt-4">
            <Card>
                <Card.Body>
                    {club.club_profile_pic && (
                        <img
                            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }}
                            src={`data:image/jpeg;base64,${club.club_profile_pic}`}
                            alt={`${club.club_name} profile`}
                        />
                    )}
                    <Card.Title>{club.club_name}</Card.Title>
                    <Card.Text>
                        Trainer: {club.trainer_name}
                    </Card.Text>
                </Card.Body>
            </Card>
            <Card className="mt-4">
                <Card.Body>
                    <Card.Title>Participants</Card.Title>
                    <ListGroup variant="flush">
                        {club.participants.map(participant => (
                            <ListGroup.Item key={participant.participant_id}>
                                {participant.first_name} {participant.last_name}, Age: {participant.age}, Gender: {participant.gender}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ClubProfile;

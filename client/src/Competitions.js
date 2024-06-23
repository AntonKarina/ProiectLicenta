import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';
import { Container, Accordion, ListGroup, Card } from 'react-bootstrap';

const Competitions = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetchCompetitionsWithParticipants();
    }, []);

    const fetchCompetitionsWithParticipants = () => {
        axiosInstance.get('/competitions-with-participants', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(res => {
            setEvents(res.data.events);
        })
        .catch(err => {
            console.error('Eroare la preluarea competițiilor și participanților:', err);
        });
    };

    return (
        <Container>
            <div className="sectionTitle">Competiții și Participanți</div>
            <Accordion defaultActiveKey="0">
                {events.map((event, eventIndex) => (
                    <Accordion.Item eventKey={`${eventIndex}`} key={event.event_id}>
                        <Accordion.Header>{event.event_name}</Accordion.Header>
                        <Accordion.Body>
                            <Accordion>
                                {Object.values(event.competitions).map((competition, compIndex) => (
                                    <Accordion.Item eventKey={`${eventIndex}-${compIndex}`} key={competition.competition_id}>
                                        <Accordion.Header>{competition.competition_name}</Accordion.Header>
                                        <Accordion.Body>
                                            <ListGroup>
                                                {competition.participants.map(participant => (
                                                    <ListGroup.Item key={participant.competition_participant_id}>
                                                        <Card>
                                                            <Card.Body>
                                                                <Card.Title>{participant.first_name} {participant.last_name}</Card.Title>
                                                                <Card.Text>
                                                                    <strong>Categorie de vârstă:</strong> {participant.age_category}<br />
                                                                    <strong>Tip:</strong> {participant.type === 'solo' ? 'Solo' : participant.type.charAt(0).toUpperCase() + participant.type.slice(1)}<br />
                                                                    <strong>Gen:</strong> {participant.gender}
                                                                </Card.Text>
                                                            </Card.Body>
                                                        </Card>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>
        </Container>
    );
};

export default Competitions;

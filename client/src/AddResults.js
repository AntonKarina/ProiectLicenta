import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Alert, Container, Card } from 'react-bootstrap';
import axios from './axiosConfig';
import { AuthContext } from './AuthContext';

const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        fontFamily: "'Roboto', sans-serif"
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#e83e8c',
        fontWeight: 'bold'
    },
    formGroup: {
        marginBottom: '20px'
    },
    card: {
        margin: '20px 0',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    },
    button: {
        display: 'block',
        margin: '20px auto',
        backgroundColor: '#343a40',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'background-color 0.3s, transform 0.2s'
    },
    buttonHover: {
        backgroundColor: '#23272b'
    },
    input: {
        marginBottom: '10px'
    }
};

function AddResults() {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [competitions, setCompetitions] = useState([]);
    const [selectedCompetitionId, setSelectedCompetitionId] = useState('');
    const [participants, setParticipants] = useState([]);
    const [groups, setGroups] = useState([]);
    const [results, setResults] = useState({});
    const [groupResults, setGroupResults] = useState({});
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get('/events');
            const completedEvents = response.data.events.filter(event => event.status === 'completed');
            setEvents(completedEvents);
            if (completedEvents.length > 0) {
                setSelectedEventId(completedEvents[0].event_id);
                fetchCompetitions(completedEvents[0].event_id);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            setError(`Failed to fetch events: ${error.response ? error.response.data.message : error.message}`);
        }
    };

    const fetchCompetitions = async (eventId) => {
        setSelectedEventId(eventId);
        try {
            const response = await axios.get(`/events/${eventId}/competitions`);
            setCompetitions(response.data.competitions);
            if (response.data.competitions.length > 0) {
                setSelectedCompetitionId(response.data.competitions[0].competition_id);
                fetchParticipantsAndGroups(response.data.competitions[0].competition_id);
            }
        } catch (error) {
            console.error('Error fetching competitions:', error);
            setError('Failed to fetch competitions');
        }
    };

    const fetchParticipantsAndGroups = async (competitionId) => {
        setSelectedCompetitionId(competitionId);
        try {
            const participantResponse = await axios.get(`/competitions/${competitionId}/participants`);
            const groupResponse = await axios.get(`/competitions/${competitionId}/groups`);
            console.log('Participants Response:', participantResponse.data.participants); // Debug log
            console.log('Groups Response:', groupResponse.data.groups); // Debug log

            setParticipants(participantResponse.data.participants);
            setGroups(groupResponse.data.groups);

            const initialResults = participantResponse.data.participants.reduce((acc, participant) => {
                acc[participant.participant_id] = { score: '', placement: '' };
                return acc;
            }, {});

            const initialGroupResults = groupResponse.data.groups.reduce((acc, group) => {
                acc[group.group_id] = { score: '', placement: '' };
                return acc;
            }, {});

            setResults(initialResults);
            setGroupResults(initialGroupResults);
        } catch (error) {
            console.error('Error fetching participants and groups:', error);
            setError('Failed to fetch participants and groups');
        }
    };

    const handleInputChange = (id, field, value, isGroup) => {
        if (isGroup) {
            setGroupResults(prev => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    [field]: value
                }
            }));
        } else {
            setResults(prev => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    [field]: value
                }
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/results', {
                competition_id: selectedCompetitionId,
                event_id: selectedEventId,
                results: Object.keys(results).map(participantId => ({
                    participant_id: participantId,
                    ...results[participantId]
                })),
                group_results: Object.keys(groupResults).map(groupId => ({
                    group_id: groupId,
                    ...groupResults[groupId]
                }))
            });
            if (response.status === 201) {
                alert('Results submitted successfully');
            }
        } catch (error) {
            console.error('Error submitting results:', error.response?.data?.error || 'Error occurred');
            setError('Failed to submit results. ' + (error.response?.data?.message || 'Please try again.'));
        }
    };

    return (
        <Container style={styles.container}>
            <h2 style={styles.title}>Add Results</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group style={styles.formGroup}>
                    <Form.Label>Event</Form.Label>
                    <Form.Control as="select" value={selectedEventId} onChange={e => fetchCompetitions(e.target.value)}>
                        {events.map(event => (
                            <option key={event.event_id} value={event.event_id}>{event.name}</option>
                        ))}
                    </Form.Control>
                </Form.Group>
                <Form.Group style={styles.formGroup}>
                    <Form.Label>Competition</Form.Label>
                    <Form.Control as="select" value={selectedCompetitionId} onChange={e => fetchParticipantsAndGroups(e.target.value)}>
                        {competitions.map(comp => (
                            <option key={comp.competition_id} value={comp.competition_id}>{comp.name}</option>
                        ))}
                    </Form.Control>
                </Form.Group>
                {participants.map(participant => (
                    <Card key={participant.participant_id} style={styles.card}>
                        <Card.Body>
                            <Card.Title>{participant.first_name} {participant.last_name}</Card.Title>
                            <Form.Group>
                                <Form.Control
                                    style={styles.input}
                                    type="number"
                                    placeholder="Score"
                                    value={results[participant.participant_id]?.score || ''}
                                    onChange={(e) => handleInputChange(participant.participant_id, 'score', e.target.value, false)}
                                />
                                <Form.Control
                                    style={styles.input}
                                    type="number"
                                    placeholder="Placement"
                                    value={results[participant.participant_id]?.placement || ''}
                                    onChange={(e) => handleInputChange(participant.participant_id, 'placement', e.target.value, false)}
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>
                ))}
                {groups.map(group => (
                    <Card key={group.group_id} style={styles.card}>
                        <Card.Body>
                            <Card.Title>{group.name}</Card.Title>
                            <Form.Group>
                                <Form.Control
                                    style={styles.input}
                                    type="number"
                                    placeholder="Score"
                                    value={groupResults[group.group_id]?.score || ''}
                                    onChange={(e) => handleInputChange(group.group_id, 'score', e.target.value, true)}
                                />
                                <Form.Control
                                    style={styles.input}
                                    type="number"
                                    placeholder="Placement"
                                    value={groupResults[group.group_id]?.placement || ''}
                                    onChange={(e) => handleInputChange(group.group_id, 'placement', e.target.value, true)}
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>
                ))}
                <Button 
                    style={{ 
                        ...styles.button, 
                        backgroundColor: '#343a40', 
                        ':hover': styles.buttonHover 
                    }} 
                    type="submit"
                >
                    Submit Results
                </Button>
            </Form>
        </Container>
    );
}

export default AddResults;

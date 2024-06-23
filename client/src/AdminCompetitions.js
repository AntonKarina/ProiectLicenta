import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from './axiosConfig';
import { AuthContext } from './AuthContext';
import { Container, Accordion, Card, Form, Button } from 'react-bootstrap';

const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        fontFamily: "'Roboto', sans-serif",
        maxWidth: '800px',
        margin: '20px auto'
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#ff4081',
        fontSize: '2em',
        fontWeight: 'bold'
    },
    formGroup: {
        marginBottom: '20px',
    },
    card: {
        margin: '20px 0',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    buttonCustom: {
        backgroundColor: '#343a40', // culoarea butonului Update Profile
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'background-color 0.3s, transform 0.2s',
        display: 'block',
        margin: '20px auto',
    },
    inputField: {
        marginBottom: '10px',
    },
    accordionHeader: {
        backgroundColor: '#e9ecef',
    },
    formLabel: {
        marginBottom: '5px',
    },
    participantGroupTitle: {
        fontSize: '1.2em',
        fontWeight: 'bold',
        color: '#2c3e50'
    },
    participantGroupText: {
        color: '#555'
    }
};

const AdminCompetitions = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [selectedCompetition, setSelectedCompetition] = useState('');
    const [competitions, setCompetitions] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [groups, setGroups] = useState([]);
    const [schedule, setSchedule] = useState({});
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get('/events');
            setEvents(response.data.events);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const fetchCompetitions = async (eventId) => {
        try {
            const response = await axios.get(`/events/${eventId}/competitions`);
            setCompetitions(response.data.competitions);
        } catch (error) {
            console.error('Error fetching competitions:', error);
        }
    };

    const fetchParticipants = async (competitionId) => {
        try {
            const response = await axios.get(`/competitions/${competitionId}/participants`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setParticipants(response.data.participants);
            fetchGroups(competitionId);
        } catch (err) {
            console.error('Error fetching participants:', err);
        }
    };

    const fetchGroups = async (competitionId) => {
        try {
            const response = await axios.get(`/competitions/${competitionId}/groups`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setGroups(response.data.groups);
            fetchSchedule(competitionId);
            fetchGroupSchedule(competitionId);
        } catch (err) {
            console.error('Error fetching groups:', err);
        }
    };

    const fetchSchedule = async (competitionId) => {
        try {
            const response = await axios.get(`/competitions/${competitionId}/schedule`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setSchedule(prev => ({ ...prev, ...response.data.schedule }));
        } catch (err) {
            console.error('Error fetching schedule:', err);
        }
    };

    const fetchGroupSchedule = async (competitionId) => {
        try {
            const response = await axios.get(`/competitions/${competitionId}/group_schedule`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setSchedule(prev => ({ ...prev, ...response.data.schedule }));
        } catch (err) {
            console.error('Error fetching group schedule:', err);
        }
    };

    const handleEventChange = (event) => {
        setSelectedEvent(event.target.value);
        fetchCompetitions(event.target.value);
    };

    const handleCompetitionChange = (event) => {
        setSelectedCompetition(event.target.value);
        fetchParticipants(event.target.value);
    };

    const handleScheduleChange = (id, time, type) => {
        setSchedule(prev => ({
            ...prev,
            [`${type}-${id}`]: time
        }));
    };

    const handleSaveSchedule = async () => {
        const soloSchedule = {};
        const groupSchedule = {};
        Object.keys(schedule).forEach(key => {
            const [type, id] = key.split('-');
            if (type === 'solo') {
                soloSchedule[id] = schedule[key];
            } else if (type === 'group') {
                groupSchedule[id] = schedule[key];
            }
        });

        try {
            await axios.post(`/competitions/${selectedCompetition}/schedule`, { schedule: soloSchedule }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('Solo schedule saved successfully');
            alert('Solo schedule saved successfully');
        } catch (error) {
            console.error('Error saving solo schedule:', error);
            alert('Failed to save solo schedule');
        }

        try {
            await axios.post(`/competitions/${selectedCompetition}/group_schedule`, { schedule: groupSchedule }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('Group schedule saved successfully');
            alert('Group schedule saved successfully');
        } catch (error) {
            console.error('Error saving group schedule:', error);
            alert('Failed to save group schedule');
        }
    };

    const generateSchedule = () => {
        const sortedParticipants = [...participants].sort((a, b) => {
            if (a.age_category !== b.age_category) {
                return a.age_category.localeCompare(b.age_category);
            } else if (a.type !== b.type) {
                return a.type.localeCompare(b.type);
            } else if (a.gender !== b.gender) {
                return a.gender.localeCompare(b.gender);
            } else {
                return a.last_name.localeCompare(b.last_name);
            }
        });

        const sortedGroups = [...groups].sort((a, b) => {
            if (a.age_category !== b.age_category) {
                return a.age_category.localeCompare(b.age_category);
            } else if (a.type !== b.type) {
                return a.type.localeCompare(b.type);
            } else {
                return a.name.localeCompare(b.name);
            }
        });

        const combinedSortedEntries = [...sortedParticipants, ...sortedGroups];

        const generatedSchedule = {};
        let currentTime = new Date();
        currentTime.setHours(9, 0, 0); // Start at 9:00 AM

        combinedSortedEntries.forEach((entry, index) => {
            const entryType = entry.participant_id ? 'solo' : 'group';
            const entryId = entry.participant_id || entry.group_id;
            generatedSchedule[`${entryType}-${entryId}`] = currentTime.toTimeString().slice(0, 5);
            currentTime.setMinutes(currentTime.getMinutes() + (entryType === 'solo' ? 3 : 5)); // Increment by 3 minutes for participants and 5 minutes for groups

            if ((index + 1) % 5 === 0) {
                currentTime.setMinutes(currentTime.getMinutes() + 10);
            }
        });

        setSchedule(generatedSchedule);
    };

    return (
        <Container style={styles.container}>
            <h2 style={styles.title}>Admin Competitions</h2>
            <Form.Group style={styles.formGroup}>
                <Form.Label>Select Event</Form.Label>
                <Form.Control as="select" value={selectedEvent} onChange={handleEventChange}>
                    <option value="">Select Event</option>
                    {events.map(event => (
                        <option key={event.event_id} value={event.event_id}>
                            {event.name}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>
            <Form.Group style={styles.formGroup}>
                <Form.Label>Select Competition</Form.Label>
                <Form.Control as="select" value={selectedCompetition} onChange={handleCompetitionChange}>
                    <option value="">Select Competition</option>
                    {competitions.map(comp => (
                        <option key={comp.competition_id} value={comp.competition_id}>
                            {comp.name}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>
            <Button style={styles.buttonCustom} onClick={generateSchedule} className="my-3">Generate Schedule</Button>
            {participants.length > 0 || groups.length > 0 ? (
                <div>
                    <h3 style={styles.participantGroupTitle}>Participants and Groups</h3>
                    <Accordion defaultActiveKey="0">
                        {participants.map(participant => (
                            <Accordion.Item eventKey={`participant-${participant.participant_id}`} key={`participant-${participant.participant_id}`}>
                                <Accordion.Header style={styles.accordionHeader}>{participant.first_name} {participant.last_name}</Accordion.Header>
                                <Accordion.Body>
                                    <Card style={styles.card}>
                                        <Card.Body>
                                            <Card.Title>{participant.first_name} {participant.last_name}</Card.Title>
                                            <Card.Text style={styles.participantGroupText}>
                                                <strong>Age Category:</strong> {participant.age_category}<br />
                                                <strong>Type:</strong> {participant.type}<br />
                                                <strong>Gender:</strong> {participant.gender}<br />
                                            </Card.Text>
                                            <Form.Group controlId={`schedule-${participant.participant_id}`} style={styles.formGroup}>
                                                <Form.Label style={styles.formLabel}>Schedule Time</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    value={schedule[`solo-${participant.participant_id}`] || ''}
                                                    onChange={(e) => handleScheduleChange(participant.participant_id, e.target.value, 'solo')}
                                                />
                                            </Form.Group>
                                        </Card.Body>
                                    </Card>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                        {groups.map(group => (
                            <Accordion.Item eventKey={`group-${group.group_id}`} key={`group-${group.group_id}`}>
                                <Accordion.Header style={styles.accordionHeader}>{group.name}</Accordion.Header>
                                <Accordion.Body>
                                    <Card style={styles.card}>
                                        <Card.Body>
                                            <Card.Title>{group.name}</Card.Title>
                                            <Card.Text style={styles.participantGroupText}>
                                                <strong>Age Category:</strong> {group.age_category}<br />
                                                <strong>Type:</strong> {group.type}<br />
                                            </Card.Text>
                                            <Form.Group controlId={`schedule-${group.group_id}`} style={styles.formGroup}>
                                                <Form.Label style={styles.formLabel}>Schedule Time</Form.Label>
                                                <Form.Control
                                                    type="time"
                                                    value={schedule[`group-${group.group_id}`] || ''}
                                                    onChange={(e) => handleScheduleChange(group.group_id, e.target.value, 'group')}
                                                />
                                            </Form.Group>
                                        </Card.Body>
                                    </Card>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                    <Button style={styles.buttonCustom} onClick={handleSaveSchedule} className="my-3">Save Schedule</Button>
                </div>
            ) : (
                <p>No participants or groups found for this competition.</p>
            )}
        </Container>
    );
};

export default AdminCompetitions;

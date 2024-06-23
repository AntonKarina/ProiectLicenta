import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, ListGroup } from 'react-bootstrap';

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    title: {
        fontSize: '2em',
        fontWeight: 'bold',
        color: '#e84393', // Changed to pink color
        marginBottom: '20px',
        textAlign: 'center'
    },
    subtitle: {
        fontSize: '1.5em',
        fontWeight: 'bold',
        color: '#555',
        margin: '20px 0 10px 0'
    },
    formGroup: {
        marginBottom: '20px'
    },
    label: {
        fontSize: '1.2em',
        color: '#333'
    },
    select: {
        padding: '10px',
        fontSize: '1.1em',
        borderRadius: '5px',
        border: '1px solid #ccc',
        backgroundColor: '#fff', // White background
        color: '#333', // Dark text color
        outline: 'none',
    },
    selectFocus: {
        outline: 'none',
        borderColor: '#ff69b4', // Pink border on focus
    },
    listGroup: {
        marginTop: '10px'
    },
    listItem: {
        fontSize: '1.1em',
        color: '#555',
        padding: '15px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '5px',
        marginBottom: '10px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    }
};

const PublicSchedule = () => {
    const [competitions, setCompetitions] = useState([]);
    const [selectedCompetition, setSelectedCompetition] = useState('');
    const [soloSchedule, setSoloSchedule] = useState([]);
    const [groupSchedule, setGroupSchedule] = useState([]);

    useEffect(() => {
        fetchCompetitions();
    }, []);

    const fetchCompetitions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/competitions', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setCompetitions(response.data.competitions);
        } catch (error) {
            console.error('Error fetching competitions:', error);
        }
    };

    const fetchScheduleAfterDeadline = async (competitionId) => {
        try {
            const response = await axios.get(`/public-schedule/${competitionId}`);
            setSoloSchedule(response.data.soloSchedule);
            setGroupSchedule(response.data.groupSchedule);
        } catch (error) {
            console.error('Error fetching schedule after deadline:', error);
        }
    };

    const handleCompetitionChange = (event) => {
        const competitionId = event.target.value;
        setSelectedCompetition(competitionId);
        fetchScheduleAfterDeadline(competitionId);
    };

    return (
        <Container style={styles.container}>
            <h2 style={styles.title}>Public Schedule</h2>
            <div style={styles.formGroup}>
                <label style={styles.label}>Select Competition</label>
                <Form.Control
                    as="select"
                    value={selectedCompetition}
                    onChange={handleCompetitionChange}
                    style={styles.select}
                    onFocus={(e) => e.target.style.borderColor = '#ff69b4'} // Pink border on focus
                    onBlur={(e) => e.target.style.borderColor = '#ccc'} // Reset border color on blur
                >
                    <option value="">Select Competition</option>
                    {competitions.map(comp => (
                        <option key={comp.competition_id} value={comp.competition_id}>
                            {comp.name}
                        </option>
                    ))}
                </Form.Control>
            </div>
            <h4 style={styles.subtitle}>Solo Participants</h4>
            {soloSchedule.length > 0 ? (
                <ListGroup style={styles.listGroup}>
                    {soloSchedule.map((entry, index) => (
                        <ListGroup.Item key={index} style={styles.listItem}>
                            {entry.first_name} {entry.last_name} - {entry.schedule_time}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <p>No solo schedule available after deadline.</p>
            )}
            <h4 style={styles.subtitle}>Groups</h4>
            {groupSchedule.length > 0 ? (
                <ListGroup style={styles.listGroup}>
                    {groupSchedule.map((entry, index) => (
                        <ListGroup.Item key={index} style={styles.listItem}>
                            {entry.group_name} - {entry.schedule_time}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <p>No group schedule available after deadline.</p>
            )}
        </Container>
    );
};

export default PublicSchedule;

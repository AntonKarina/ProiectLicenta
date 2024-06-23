import React, { useState } from 'react';
import axiosInstance from './axiosConfig';
import { Form, Button, Alert, Table } from 'react-bootstrap';

const styles = {
    addEventContainer: {
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
    },
    sectionTitle: {
        fontSize: '2em',
        fontWeight: 'bold',
        margin: '20px 0',
        backgroundColor: '#ff4081',
        color: 'white',
        padding: '10px',
        textAlign: 'center',
        borderRadius: '5px'
    },
    formLabel: {
        fontWeight: 'bold',
        color: '#555'
    },
    button: {
        backgroundColor: '#555',
        borderColor: '#555'
    },
    table: {
        marginTop: '20px'
    }
};

const AddEvent = () => {
    const [event, setEvent] = useState({
        name: '',
        date: '',
        location: '',
        google_maps_url: '',
        deadline: ''
    });
    const [message, setMessage] = useState('');
    const [variant, setVariant] = useState('');
    const [competitions, setCompetitions] = useState([]);
    const [newCompetition, setNewCompetition] = useState({ name: '', date: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEvent(prevState => ({ ...prevState, [name]: value }));
    };

    const handleCompetitionInputChange = (e) => {
        const { name, value } = e.target;
        setNewCompetition(prevState => ({ ...prevState, [name]: value }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!event.deadline) {
            setVariant('danger');
            setMessage('Deadline is required');
            return;
        }
        axiosInstance.post('/add-event', { ...event, competitions })
            .then(res => {
                if (res.data.Status === 'Success') {
                    setVariant('success');
                    setMessage('Event added successfully');
                } else {
                    setVariant('danger');
                    setMessage('Failed to add event');
                }
            })
            .catch(err => {
                console.error('Error:', err);
                setVariant('danger');
                setMessage('An error occurred while adding event');
            });
    };

    const handleAddCompetition = () => {
        if (newCompetition.name && newCompetition.date) {
            setCompetitions([...competitions, newCompetition]);
            setNewCompetition({ name: '', date: '' });
        } else {
            setMessage('Competition name and date are required');
            setVariant('danger');
        }
    };

    return (
        <div style={styles.addEventContainer}>
            <div style={styles.sectionTitle}>Add Event</div>
            <Form onSubmit={handleFormSubmit}>
                <Form.Group className='mb-3' controlId='formEventName'>
                    <Form.Label style={styles.formLabel}>Event Name</Form.Label>
                    <Form.Control 
                        type="text" 
                        name='name' 
                        value={event.name} 
                        onChange={handleInputChange} 
                        required 
                    />
                </Form.Group>
                <Form.Group className='mb-3' controlId='formEventDate'>
                    <Form.Label style={styles.formLabel}>Event Date</Form.Label>
                    <Form.Control 
                        type="date" 
                        name='date' 
                        value={event.date} 
                        onChange={handleInputChange} 
                        required 
                    />
                </Form.Group>
                <Form.Group className='mb-3' controlId='formEventLocation'>
                    <Form.Label style={styles.formLabel}>Location</Form.Label>
                    <Form.Control 
                        type="text" 
                        name='location' 
                        value={event.location} 
                        onChange={handleInputChange} 
                        required 
                    />
                </Form.Group>
                <Form.Group className='mb-3' controlId='formEventGoogleMapsURL'>
                    <Form.Label style={styles.formLabel}>Google Maps URL</Form.Label>
                    <Form.Control 
                        type="text" 
                        name='google_maps_url' 
                        value={event.google_maps_url} 
                        onChange={handleInputChange} 
                    />
                </Form.Group>
                <Form.Group className='mb-3' controlId='formEventDeadline'>
                    <Form.Label style={styles.formLabel}>Registration Deadline</Form.Label>
                    <Form.Control 
                        type="datetime-local" 
                        name='deadline' 
                        value={event.deadline} 
                        onChange={handleInputChange} 
                        required 
                    />
                </Form.Group>
                <Button variant='primary' type='submit' className='w-100 mb-3' style={styles.button}>Add Event</Button>
            </Form>
            <div style={styles.sectionTitle}>Add Competitions</div>
            <Table striped bordered hover style={styles.table}>
                <tbody>
                    {competitions.map((competition, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{competition.name}</td>
                            <td>{competition.date}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Form.Group className='mb-3' controlId='formCompetitionName'>
                <Form.Label style={styles.formLabel}>Competition Name</Form.Label>
                <Form.Control
                    type="text"
                    name='name'
                    value={newCompetition.name}
                    onChange={handleCompetitionInputChange}
                />
            </Form.Group>
            <Form.Group className='mb-3' controlId='formCompetitionDate'>
                <Form.Label style={styles.formLabel}>Competition Date</Form.Label>
                <Form.Control
                    type="date"
                    name='date'
                    value={newCompetition.date}
                    onChange={handleCompetitionInputChange}
                />
            </Form.Group>
            <Button variant='secondary' onClick={handleAddCompetition} className='w-100 mb-3' style={styles.button}>Add Competition</Button>
            {message && <Alert className='mt-3' variant={variant}>{message}</Alert>}
        </div>
    );
};

export default AddEvent;

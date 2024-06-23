import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';
import { Form, Button, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 20px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  max-width: 800px;
  margin: 0 auto;
`;

const SectionTitle = styled.div`
  font-size: 2em;
  font-weight: bold;
  margin: 20px 0;
  text-align: center;
  color: #ff0066;
`;

const StyledForm = styled(Form)`
  margin-bottom: 20px;
`;

const StyledButton = styled(Button)`
  background-color: #343a40;
  border-color: #343a40;
  &:hover {
    background-color: #23272b;
    border-color: #1d2124;
  }
`;

const CompetitionList = styled.ul`
  list-style-type: none;
  padding-left: 0;
`;

const CompetitionItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
`;

const CompetitionInfo = styled.div`
  flex: 1;
`;

const CompetitionActions = styled.div`
  display: flex;
  align-items: center;
`;

const EditEvent = () => {
    const { eventId } = useParams();
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
    const [competition, setCompetition] = useState({ name: '', date: '' });
    const [editingCompetition, setEditingCompetition] = useState(null);

    useEffect(() => {
        fetchEventDetails();
        fetchEventCompetitions();
    }, []);

    const fetchEventDetails = () => {
        axiosInstance.get(`/event/${eventId}`)
            .then(res => {
                if (res.data.Status === 'Success') {
                    const fetchedEvent = res.data.event;
                    fetchedEvent.date = new Date(fetchedEvent.date).toISOString().slice(0, 16);
                    fetchedEvent.deadline = new Date(fetchedEvent.deadline).toISOString().slice(0, 16);
                    setEvent(fetchedEvent);
                } else {
                    setVariant('danger');
                    setMessage('Failed to fetch event details');
                }
            })
            .catch(err => {
                console.error('Error:', err);
                setVariant('danger');
                setMessage('An error occurred while fetching event details');
            });
    };

    const fetchEventCompetitions = () => {
        axiosInstance.get(`/events/${eventId}/competitions`)
            .then(res => {
                if (res.data.Status === 'Success') {
                    setCompetitions(res.data.competitions);
                } else {
                    setVariant('danger');
                    setMessage('Failed to fetch competitions');
                }
            })
            .catch(err => {
                console.error('Error:', err);
                setVariant('danger');
                setMessage('An error occurred while fetching competitions');
            });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEvent(prevState => ({ ...prevState, [name]: value }));
    };

    const handleCompetitionInputChange = (e) => {
        const { name, value } = e.target;
        if (editingCompetition) {
            setEditingCompetition(prev => ({ ...prev, [name]: value }));
        } else {
            setCompetition(prev => ({ ...prev, [name]: value }));
        }
    };

    const addCompetition = () => {
        const compDate = new Date(competition.date);
        const now = new Date();

        if (competition.name.trim() === '' || isNaN(compDate.getTime())) {
            setVariant('danger');
            setMessage('Please enter a valid competition name and date');
            return;
        }

        if (compDate < now) {
            setVariant('danger');
            setMessage('Competition date must be in the future');
            return;
        }

        setCompetitions([...competitions, competition]);
        setCompetition({ name: '', date: '' });
        setMessage('');
    };

    const handleEditCompetition = (competition) => {
        setEditingCompetition(competition);
    };

    const handleUpdateCompetition = () => {
        axiosInstance.put(`/competitions/${editingCompetition.competition_id}`, editingCompetition)
            .then(res => {
                if (res.data.Status === 'Success') {
                    setCompetitions(prev => prev.map(comp => comp.competition_id === editingCompetition.competition_id ? editingCompetition : comp));
                    setEditingCompetition(null);
                    setVariant('success');
                    setMessage('Competition updated successfully');
                } else {
                    setVariant('danger');
                    setMessage('Failed to update competition');
                }
            })
            .catch(err => {
                console.error('Error:', err);
                setVariant('danger');
                setMessage('An error occurred while updating competition');
            });
    };

    const handleDeleteCompetition = async (competitionId) => {
        try {
            await axiosInstance.delete(`/competitions/${competitionId}`);
            setCompetitions(prev => prev.filter(comp => comp.competition_id !== competitionId));
            setVariant('success');
            setMessage('Competition deleted successfully');
        } catch (error) {
            console.error('Error:', error);
            setVariant('danger');
            setMessage('An error occurred while deleting competition');
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!event.deadline) {
            setVariant('danger');
            setMessage('Deadline is required');
            return;
        }
        axiosInstance.put(`/event/${eventId}`, event)
            .then(res => {
                if (res.data.Status === 'Success') {
                    const updatedCompetitions = competitions.map(comp => {
                        if (comp.competition_id) {
                            axiosInstance.put(`/competitions/${comp.competition_id}`, comp)
                                .catch(err => {
                                    console.error('Error updating competition:', err);
                                    setVariant('danger');
                                    setMessage('An error occurred while updating competitions');
                                });
                        } else {
                            axiosInstance.post(`/events/${eventId}/competitions`, comp)
                                .catch(err => {
                                    console.error('Error adding competition:', err);
                                    setVariant('danger');
                                    setMessage('An error occurred while adding competitions');
                                });
                        }
                        return comp;
                    });
                    setCompetitions(updatedCompetitions);
                    setVariant('success');
                    setMessage('Event updated successfully');
                } else {
                    setVariant('danger');
                    setMessage('Failed to update event');
                }
            })
            .catch(err => {
                console.error('Error:', err);
                setVariant('danger');
                setMessage('An error occurred while updating event');
            });
    };

    return (
        <PageContainer>
            <SectionTitle>Edit Event</SectionTitle>
            {message && <Alert variant={variant}>{message}</Alert>}
            <StyledForm onSubmit={handleFormSubmit}>
                <Form.Group controlId="formEventName">
                    <Form.Label>Event Name</Form.Label>
                    <Form.Control type="text" name="name" value={event.name} onChange={handleInputChange} required />
                </Form.Group>

                <Form.Group controlId="formEventDate">
                    <Form.Label>Event Date</Form.Label>
                    <Form.Control type="datetime-local" name="date" value={event.date} onChange={handleInputChange} required />
                </Form.Group>

                <Form.Group controlId="formEventLocation">
                    <Form.Label>Location</Form.Label>
                    <Form.Control type="text" name="location" value={event.location} onChange={handleInputChange} required />
                </Form.Group>

                <Form.Group controlId="formGoogleMapsUrl">
                    <Form.Label>Google Maps URL</Form.Label>
                    <Form.Control type="url" name="google_maps_url" value={event.google_maps_url} onChange={handleInputChange} required />
                </Form.Group>

                <Form.Group controlId="formRegistrationDeadline">
                    <Form.Label>Registration Deadline</Form.Label>
                    <Form.Control type="datetime-local" name="deadline" value={event.deadline} onChange={handleInputChange} required />
                </Form.Group>

                <StyledButton variant="primary" type="submit">Update Event</StyledButton>
            </StyledForm>

            <SectionTitle>Add Competitions</SectionTitle>
            <StyledForm>
                <Form.Group controlId="formCompetitionName">
                    <Form.Label>Competition Name</Form.Label>
                    <Form.Control type="text" name="name" value={competition.name} onChange={handleCompetitionInputChange} />
                </Form.Group>

                <Form.Group controlId="formCompetitionDate">
                    <Form.Label>Competition Date</Form.Label>
                    <Form.Control type="datetime-local" name="date" value={competition.date} onChange={handleCompetitionInputChange} />
                </Form.Group>

                <StyledButton variant="secondary" onClick={addCompetition}>Add Competition</StyledButton>
            </StyledForm>

            {editingCompetition && (
                <div>
                    <SectionTitle>Edit Competition</SectionTitle>
                    <StyledForm>
                        <Form.Group controlId="formEditCompetitionName">
                            <Form.Label>Competition Name</Form.Label>
                            <Form.Control type="text" name="name" value={editingCompetition.name} onChange={handleCompetitionInputChange} />
                        </Form.Group>

                        <Form.Group controlId="formEditCompetitionDate">
                            <Form.Label>Competition Date</Form.Label>
                            <Form.Control type="datetime-local" name="date" value={editingCompetition.date} onChange={handleCompetitionInputChange} />
                        </Form.Group>

                        <StyledButton onClick={handleUpdateCompetition}>Update Competition</StyledButton>
                    </StyledForm>
                </div>
            )}

            <SectionTitle>Competitions List</SectionTitle>
            <CompetitionList>
                {competitions.map((comp, index) => (
                    <CompetitionItem key={index}>
                        <CompetitionInfo>
                            {comp.name} - {new Date(comp.date).toLocaleString()}
                        </CompetitionInfo>
                        <CompetitionActions>
                            <StyledButton onClick={() => handleEditCompetition(comp)}>Edit</StyledButton>
                            <StyledButton variant="danger" onClick={() => handleDeleteCompetition(comp.competition_id)}>Delete</StyledButton>
                        </CompetitionActions>
                    </CompetitionItem>
                ))}
            </CompetitionList>
        </PageContainer>
    );
};

export default EditEvent;

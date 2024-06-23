import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from './axiosConfig';
import { AuthContext } from './AuthContext';

function Event() {
    const [events, setEvents] = useState([]);
    const [competitions, setCompetitions] = useState({});
    const [participantCounts, setParticipantCounts] = useState({});
    const [expandedEvent, setExpandedEvent] = useState(null);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('/events');
                setEvents(response.data.events);
                response.data.events.forEach(event => {
                    fetchCompetitions(event.event_id);
                });
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        const fetchCompetitions = async (eventId) => {
            try {
                const response = await axios.get(`/events/${eventId}/competitions`);
                setCompetitions(prev => ({
                    ...prev,
                    [eventId]: response.data.competitions
                }));
                response.data.competitions.forEach(competition => {
                    fetchParticipantCount(competition.competition_id);
                });
            } catch (error) {
                console.error('Error fetching competitions:', error);
            }
        };

        const fetchParticipantCount = async (competitionId) => {
            try {
                const response = await axios.get(`/competitions/${competitionId}/participants-count`);
                setParticipantCounts(prev => ({
                    ...prev,
                    [competitionId]: response.data
                }));
            } catch (error) {
                console.error('Error fetching participant count:', error);
            }
        };

        fetchEvents();
    }, []);

    const handleMarkAsCompleted = async (eventId) => {
        try {
            await axios.put(`/events/${eventId}/complete`);
            setEvents(events.map(event => event.event_id === eventId ? { ...event, status: 'completed' } : event));
        } catch (error) {
            console.error('Error marking event as completed:', error);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await axios.delete(`/events/${eventId}`);
            setEvents(events.filter(event => event.event_id !== eventId));
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const handleEdit = (eventId) => {
        navigate(`/edit-event/${eventId}`);
    };

    const toggleExpand = (eventId) => {
        setExpandedEvent(expandedEvent === eventId ? null : eventId);
    };

    const upcomingEvents = events.filter(event => event.status !== 'completed');
    const completedEvents = events.filter(event => event.status === 'completed');

    if (!user) {
        return <p>Loading...</p>;
    }

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: "'Roboto', sans-serif",
            color: '#2d3436',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        },
        title: {
            color: '#e84393',
            marginBottom: '20px',
            fontSize: '2.5em',
            fontWeight: 'bold',
            textAlign: 'center'
        },
        eventList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        eventCard: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #dfe6e9',
            borderRadius: '10px',
            padding: '20px',
            backgroundColor: '#f5f6fa',
            boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            cursor: 'pointer'
        },
        button: {
            marginRight: '10px',
            backgroundColor: '#e84393',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'background-color 0.3s, transform 0.2s'
        },
        link: {
            color: '#e84393',
            textDecoration: 'none'
        },
        competitionsList: {
            paddingLeft: '20px',
            listStyleType: 'none',
            display: expandedEvent ? 'block' : 'none'
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Upcoming Events</h2>
            <div style={styles.eventList}>
                {upcomingEvents.length > 0 ? (
                    upcomingEvents.map(event => (
                        <div key={event.event_id} style={styles.eventCard} onClick={() => toggleExpand(event.event_id)}>
                            <div>
                                <h3>{event.name}</h3>
                                <p>Date: {new Date(event.date).toLocaleString()}</p>
                                <p>Location: {event.location}</p>
                                <p>Registration Deadline: {new Date(event.deadline).toLocaleString()}</p>
                                <a style={styles.link} href={event.google_maps_url} target="_blank" rel="noopener noreferrer">View on Google Maps</a>
                                {expandedEvent === event.event_id && (
                                    <>
                                        <h4>Competitions</h4>
                                        {competitions[event.event_id] ? (
                                            <ul style={styles.competitionsList}>
                                                {competitions[event.event_id].map(comp => (
                                                    <li key={comp.competition_id}>
                                                        {comp.name} - {new Date(comp.date).toLocaleString()}
                                                        <p>Number of Solo Participants: {participantCounts[comp.competition_id]?.total_solo_participants ?? 'Loading...'}</p>
                                                        <p>Number of Duos: {participantCounts[comp.competition_id]?.duos_count ?? 'Loading...'}</p>
                                                        <p>Number of Trios: {participantCounts[comp.competition_id]?.trios_count ?? 'Loading...'}</p>
                                                        <p>Number of Groups: {participantCounts[comp.competition_id]?.groups_count ?? 'Loading...'}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : <p>No competitions found</p>}
                                    </>
                                )}
                            </div>
                            {user.role === 'admin' && expandedEvent === event.event_id && (
                                <div>
                                    <button style={styles.button} onClick={() => handleEdit(event.event_id)}>Edit</button>
                                    <button style={styles.button} onClick={() => handleDeleteEvent(event.event_id)}>Delete</button>
                                    <button style={styles.button} onClick={() => handleMarkAsCompleted(event.event_id)}>Mark as Completed</button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No upcoming events found</p>
                )}
            </div>
            <h2 style={styles.title}>Completed Events</h2>
            <div style={styles.eventList}>
                {completedEvents.length > 0 ? (
                    completedEvents.map(event => (
                        <div key={event.event_id} style={styles.eventCard} onClick={() => toggleExpand(event.event_id)}>
                            <div>
                                <h3>{event.name}</h3>
                                <p>Date: {new Date(event.date).toLocaleString()}</p>
                                <p>Location: {event.location}</p>
                                <a style={styles.link} href={event.google_maps_url} target="_blank" rel="noopener noreferrer">View on Google Maps</a>
                                {expandedEvent === event.event_id && (
                                    <>
                                        <h4>Competitions</h4>
                                        {competitions[event.event_id] ? (
                                            <ul style={styles.competitionsList}>
                                                {competitions[event.event_id].map(comp => (
                                                    <li key={comp.competition_id}>
                                                        {comp.name} - {new Date(comp.date).toLocaleString()}
                                                        <p>Number of Solo Participants: {participantCounts[comp.competition_id]?.total_solo_participants ?? 'Loading...'}</p>
                                                        <p>Number of Duos: {participantCounts[comp.competition_id]?.duos_count ?? 'Loading...'}</p>
                                                        <p>Number of Trios: {participantCounts[comp.competition_id]?.trios_count ?? 'Loading...'}</p>
                                                        <p>Number of Groups: {participantCounts[comp.competition_id]?.groups_count ?? 'Loading...'}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : <p>No competitions found</p>}
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No completed events found</p>
                )}
            </div>
        </div>
    );
}

export default Event;

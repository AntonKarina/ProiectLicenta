import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from './axiosConfig';
import AuthContext from './AuthContext';

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
    eventCard: {
        border: '1px solid #ccc',
        borderRadius: '10px',
        padding: '20px',
        margin: '20px 0',
        backgroundColor: '#fff',
        boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
    },
    competitionCard: {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        margin: '12px 0',
        backgroundColor: '#f9f9f9',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        position: 'relative'
    },
    sectionTitle: {
        fontSize: '2em',
        fontWeight: 'bold',
        color: '#e83e8c',
        marginBottom: '20px'
    },
    participantInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
    },
    participantDetail: {
        fontSize: '1.1em',
        color: '#333',
        flex: '1'
    },
    participantScorePlacement: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '150px',
        fontSize: '1.1em',
        color: '#333'
    },
    inputField: {
        marginBottom: '8px',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ddd'
    },
    actionButton: {
        padding: '10px 20px',
        margin: '5px',
        borderRadius: '5px',
        cursor: 'pointer',
        color: '#fff'
    },
    editButton: {
        backgroundColor: '#777'
    },
    deleteButton: {
        backgroundColor: '#999'
    },
    saveButton: {
        backgroundColor: '#ff1493'
    },
    awardsSection: {
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        marginTop: '20px'
    },
    awardsTitle: {
        fontSize: '1.5em',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#333'
    },
    awardDetail: {
        marginBottom: '10px',
        fontSize: '1.1em'
    },
    error: {
        color: 'red',
        marginBottom: '20px'
    }
};

const Results = () => {
    const { competitionId } = useParams();
    const [results, setResults] = useState([]);
    const [awards, setAwards] = useState({});
    const [editParticipant, setEditParticipant] = useState(null);
    const [updatedScore, setUpdatedScore] = useState('');
    const [updatedPlacement, setUpdatedPlacement] = useState('');
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchResults();
    }, [competitionId]);

    const fetchResults = async () => {
        try {
            const response = await axiosInstance.get('/api/results', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                params: {
                    competitionId,
                }
            });
            console.log('Results fetched:', response.data);
            if (response.data.Status === 'Success') {
                setResults(response.data.results);
                fetchAllAwards(response.data.results);
            } else {
                setError('Failed to fetch results.');
            }
        } catch (error) {
            console.error('Error fetching results:', error);
            setError('An error occurred while fetching results.');
        }
    };

    const fetchAwards = async (competitionId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found');
                return;
            }

            const response = await axiosInstance.get('/api/awards', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    competitionId,
                }
            });
            console.log(`Awards fetched for competition ${competitionId}:`, response.data);
            if (response.data.Status === 'Success') {
                console.log(`Awards data for competition ${competitionId}:`, response.data.awards);
                setAwards(prevAwards => ({
                    ...prevAwards,
                    [competitionId]: response.data.awards
                }));
            } else {
                setError(`Failed to fetch awards for competition ${competitionId}.`);
            }
        } catch (error) {
            console.error(`Error fetching awards for competition ${competitionId}:`, error);
            setError(`An error occurred while fetching awards for competition ${competitionId}.`);
        }
    };

    const fetchAllAwards = async (results) => {
        for (const event of Object.values(results)) {
            for (const competition of Object.values(event.competitions)) {
                await fetchAwards(competition.competition_id);
            }
        }
    };

    const handleSaveClick = async (resultId) => {
        try {
            const response = await axiosInstance.put(`/api/results/${resultId}`, {
                score: updatedScore,
                placement: updatedPlacement,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            console.log('Result updated:', response.data);
            if (response.data.Status === 'Success') {
                fetchResults();
                setEditParticipant(null);
                setUpdatedScore('');
                setUpdatedPlacement('');
            } else {
                setError('Failed to update result.');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred while updating the result.');
        }
    };

    const handleDeleteClick = async (resultId) => {
        try {
            const response = await axiosInstance.delete(`/api/results/${resultId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            console.log('Result deleted:', response.data);
            if (response.data.Status === 'Success') {
                fetchResults();
            } else {
                setError('Failed to delete result.');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred while deleting the result.');
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.sectionTitle}>All Results</h2>
            {error && <p style={styles.error}>{error}</p>}
            {Object.keys(results).length > 0 ? (
                Object.values(results).map(event => (
                    <div key={event.event_id} style={styles.eventCard}>
                        <h3>{event.event_name}</h3>
                        {Object.values(event.competitions).map(competition => (
                            <div key={competition.competition_id} style={styles.competitionCard}>
                                <h4>{competition.competition_name}</h4>
                                {competition.participants.map(participant => (
                                    <div key={`${participant.participant_id}-${competition.competition_id}`} style={styles.participantInfo}>
                                        <span style={styles.participantDetail}>Participant: {participant.first_name} {participant.last_name}</span>
                                        <div style={styles.participantScorePlacement}>
                                            <span>Score: {participant.score}</span>
                                            <span>Placement: {participant.placement}</span>
                                        </div>
                                        {user && user.role === 'admin' && (
                                            <div>
                                                {editParticipant === participant.participant_id ? (
                                                    <>
                                                        <input
                                                            type="number"
                                                            style={styles.inputField}
                                                            value={updatedScore}
                                                            onChange={(e) => setUpdatedScore(e.target.value)}
                                                        />
                                                        <input
                                                            type="number"
                                                            style={styles.inputField}
                                                            value={updatedPlacement}
                                                            onChange={(e) => setUpdatedPlacement(e.target.value)}
                                                        />
                                                        <button
                                                            style={{ ...styles.actionButton, ...styles.saveButton }}
                                                            onClick={() => handleSaveClick(participant.result_id)}
                                                        >
                                                            Save
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            style={{ ...styles.actionButton, ...styles.editButton }}
                                                            onClick={() => {
                                                                setEditParticipant(participant.participant_id);
                                                                setUpdatedScore(participant.score);
                                                                setUpdatedPlacement(participant.placement);
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            style={{ ...styles.actionButton, ...styles.deleteButton }}
                                                            onClick={() => handleDeleteClick(participant.result_id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {competition.groups.map(group => (
                                    <div key={`${group.group_id}-${competition.competition_id}`} style={styles.participantInfo}>
                                        <span style={styles.participantDetail}>Group: {group.group_name}</span>
                                        <div style={styles.participantScorePlacement}>
                                            <span>Score: {group.score}</span>
                                            <span>Placement: {group.placement}</span>
                                        </div>
                                        {user && user.role === 'admin' && (
                                            <div>
                                                {editParticipant === group.group_id ? (
                                                    <>
                                                        <input
                                                            type="number"
                                                            style={styles.inputField}
                                                            value={updatedScore}
                                                            onChange={(e) => setUpdatedScore(e.target.value)}
                                                        />
                                                        <input
                                                            type="number"
                                                            style={styles.inputField}
                                                            value={updatedPlacement}
                                                            onChange={(e) => setUpdatedPlacement(e.target.value)}
                                                        />
                                                        <button
                                                            style={{ ...styles.actionButton, ...styles.saveButton }}
                                                            onClick={() => handleSaveClick(group.result_id)}
                                                        >
                                                            Save
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            style={{ ...styles.actionButton, ...styles.editButton }}
                                                            onClick={() => {
                                                                setEditParticipant(group.group_id);
                                                                setUpdatedScore(group.score);
                                                                setUpdatedPlacement(group.placement);
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            style={{ ...styles.actionButton, ...styles.deleteButton }}
                                                            onClick={() => handleDeleteClick(group.result_id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {awards[competition.competition_id] && (
                                    <div style={styles.awardsSection}>
                                        <h4 style={styles.awardsTitle}>Awards Summary</h4>
                                        {Object.entries(awards[competition.competition_id]).map(([clubName, awardCounts]) => (
                                            <div key={clubName} style={styles.awardDetail}>
                                                <strong>{clubName}</strong>:
                                                <span> Medals: {awardCounts.medals} </span>
                                                <span> Cups: {awardCounts.cups}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))
            ) : (
                <p>No results found.</p>
            )}
        </div>
    );
};

export default Results;

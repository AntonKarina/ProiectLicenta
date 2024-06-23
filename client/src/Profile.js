import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from './axiosConfig';
import { Form, Button, Alert, Image, Modal, Container, Row, Col, Collapse } from 'react-bootstrap';
import styled from 'styled-components';

const PageBackground = styled.div`
    background: #f5f5f5; /* Light grey background */
    min-height: 100vh;
    padding: 40px 0;
    text-align: center;
`;

const StyledContainer = styled(Container)`
    padding: 30px;
    max-width: 1200px;
    margin: auto;
    background: rgba(255, 255, 255, 0.9);  /* White background with some transparency */
    border-radius: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ProfileHeader = styled.h1`
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 20px;
    color: #333;
`;

const ProfileImageWrapper = styled.div`
    position: relative;
    display: inline-block;
    margin-bottom: 20px;
`;

const ProfileImage = styled(Image)`
    width: 200px;
    height: 200px;
    border-radius: 50%;
    object-fit: cover;
    display: block;
`;

const ProfilePicPlaceholder = styled.div`
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background-color: #d3d3d3;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;

const EditButton = styled(Button)`
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: 5px;
    padding: 5px 10px;
    &:hover {
        background-color: #555;
    }
`;

const SectionTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: bold;
    margin: 20px 0;
    color: #333;
    text-align: left;
`;

const ParticipantListItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #ddd;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 10px;
`;

const TrainerCard = styled.div`
    display: flex;
    align-items: center;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 10px;
    margin-bottom: 10px;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
`;

const TrainerImage = styled(Image)`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 10px;
`;

const CustomButton = styled(Button)`
    background-color: #333 !important;
    border-color: #333 !important;
    color: white !important;
    width: 100%;
    margin-top: 20px;
    font-weight: bold;
    &:hover {
        background-color: #555 !important;
        border-color: #555 !important;
    }
`;

const EditParticipantButton = styled(Button)`
    background-color: #555;
    border-color: #555;
    color: white;
    &:hover {
        background-color: #777;
        border-color: #777;
    }
`;

const DeleteParticipantButton = styled(Button)`
    background-color: #999;
    border-color: #999;
    color: white;
    &:hover {
        background-color: #bbb;
        border-color: #bbb;
    }
`;

const Profile = () => {
    const [profile, setProfile] = useState({ club_name: '', trainer_name: '' });
    const [message, setMessage] = useState('');
    const [variant, setVariant] = useState('');
    const [participants, setParticipants] = useState([]);
    const [newParticipant, setNewParticipant] = useState({ first_name: '', last_name: '', age: '', gender: 'Male' });
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [clubProfilePic, setClubProfilePic] = useState(null);
    const [trainerProfilePic, setTrainerProfilePic] = useState(null);
    const [openProfile, setOpenProfile] = useState(false);
    const [openParticipant, setOpenParticipant] = useState(false);

    const clubProfilePicInputRef = useRef(null);
    const trainerProfilePicInputRef = useRef(null);

    useEffect(() => {
        fetchProfile();
        fetchParticipants();
        fetchProfilePics();
    }, []);

    const fetchProfile = () => {
        axiosInstance.get('/profile')
            .then(res => {
                if (res.data.Status === 'Success') {
                    setProfile(res.data.profile);
                } else {
                    setVariant('danger');
                    setMessage('Failed to fetch profile');
                }
            })
            .catch(err => {
                console.error('Error:', err);
                setVariant('danger');
                setMessage('An error occurred while fetching profile');
            });
    };

    const fetchParticipants = () => {
        axiosInstance.get('/participants')
            .then(res => {
                if (res.data.Status === 'Success') {
                    setParticipants(res.data.participants);
                } else {
                    setVariant('danger');
                    setMessage('Failed to fetch participants');
                }
            })
            .catch(err => {
                console.error('Error:', err);
                setVariant('danger');
                setMessage('An error occurred while fetching participants');
            });
    };

    const fetchProfilePics = () => {
        axiosInstance.get('/profile-pic/club', { responseType: 'blob' })
            .then(response => {
                setClubProfilePic(URL.createObjectURL(response.data));
            })
            .catch(err => {
                console.error('Error fetching club profile pic:', err);
            });

        axiosInstance.get('/profile-pic/trainer', { responseType: 'blob' })
            .then(response => {
                setTrainerProfilePic(URL.createObjectURL(response.data));
            })
            .catch(err => {
                console.error('Error fetching trainer profile pic:', err);
            });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prevState => ({ ...prevState, [name]: value }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        axiosInstance.post('/profile', profile)
            .then(res => {
                if (res.data.Status === 'Success') {
                    setVariant('success');
                    setMessage('Profile updated successfully');
                } else {
                    setVariant('danger');
                    setMessage('Failed to update profile');
                }
            })
            .catch(err => {
                console.error('Error:', err);
                setVariant('danger');
                setMessage('An error occurred while updating profile');
            });
    };

    const handleProfilePicUpload = async (e, type) => {
        const formData = new FormData();
        formData.append('profile_pic', e.target.files[0]);

        try {
            const response = await axiosInstance.post(`/upload/${type}-profile-pic`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert(response.data.message);
            fetchProfilePics();
        } catch (error) {
            console.error('Error uploading profile pic:', error);
            setVariant('danger');
            setMessage('Error uploading profile pic');
        }
    };

    const handleClubProfilePicClick = () => {
        clubProfilePicInputRef.current.click();
    };

    const handleTrainerProfilePicClick = () => {
        trainerProfilePicInputRef.current.click();
    };

    const handleNewParticipantChange = (e) => {
        const { name, value } = e.target;
        setNewParticipant(prevState => ({ ...prevState, [name]: value }));
    };

    const handleNewParticipantSubmit = (e) => {
        e.preventDefault();
        axiosInstance.post('/participants', newParticipant)
            .then(res => {
                if (res.data.Status === 'Success') {
                    setVariant('success');
                    setMessage('Participant added successfully');
                    fetchParticipants();
                } else {
                    setVariant('danger');
                    setMessage('Failed to add participant');
                }
            })
            .catch(err => {
                console.error('Error:', err);
                setVariant('danger');
                setMessage('An error occurred while adding participant');
            });
    };

    const handleEditParticipantClick = (participant) => {
        setSelectedParticipant(participant);
        setShowEditModal(true);
    };

    const handleEditParticipantChange = (e) => {
        const { name, value } = e.target;
        setSelectedParticipant(prevState => ({ ...prevState, [name]: value }));
    };

    const handleEditParticipantSubmit = (e) => {
        e.preventDefault();
        axiosInstance.put(`/participants/${selectedParticipant.participant_id}`, selectedParticipant)
            .then(res => {
                if (res.data.Status === 'Success') {
                    setVariant('success');
                    setMessage('Participant updated successfully');
                    setShowEditModal(false);
                    fetchParticipants();
                    setNewParticipant({ first_name: '', last_name: '', age: '', gender: 'Male' });
                } else {
                    setVariant('danger');
                    setMessage('Failed to update participant');
                }
            })
            .catch(err => {
                console.error('Error:', err);
                setVariant('danger');
                setMessage('An error occurred while updating participant');
            });
    };

    const handleDeleteParticipantClick = (participantId) => {
        axiosInstance.delete(`/participants/${participantId}`)
            .then(res => {
                if (res.data.Status === 'Success') {
                    setVariant('success');
                    setMessage('Participant deleted successfully');
                    fetchParticipants();
                } else {
                    setVariant('danger');
                    setMessage('Failed to delete participant');
                }
            })
            .catch(err => {
                console.error('Error:', err);
                setVariant('danger');
                setMessage('An error occurred while deleting participant');
            });
    };

    return (
        <PageBackground>
            <StyledContainer>
                <ProfileHeader>{profile.club_name}</ProfileHeader>
                <ProfileImageWrapper>
                    {clubProfilePic ? (
                        <ProfileImage src={clubProfilePic} />
                    ) : (
                        <ProfilePicPlaceholder onClick={handleClubProfilePicClick}>
                            <span>Upload Club Pic</span>
                        </ProfilePicPlaceholder>
                    )}
                    <EditButton size="sm" onClick={handleClubProfilePicClick}>Edit</EditButton>
                    <Form.Control
                        type="file"
                        ref={clubProfilePicInputRef}
                        style={{ display: 'none' }}
                        onChange={(e) => handleProfilePicUpload(e, 'club')}
                    />
                </ProfileImageWrapper>
                <CustomButton
                    onClick={() => setOpenProfile(!openProfile)}
                    aria-controls="collapse-profile-form"
                    aria-expanded={openProfile}
                >
                    Update Profile
                </CustomButton>
                <Collapse in={openProfile}>
                    <div id="collapse-profile-form">
                        <Form onSubmit={handleFormSubmit}>
                            <Row className="mt-4">
                                <Col md={6} className="text-center">
                                    <Form.Group className='mb-3' controlId='formClubName'>
                                        <Form.Label><strong>Club Name</strong></Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            name='club_name' 
                                            value={profile.club_name} 
                                            onChange={handleInputChange} 
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6} className="text-center">
                                    <Form.Group className='mb-3' controlId='formTrainerName'>
                                        <Form.Label><strong>Trainer Name</strong></Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            name='trainer_name' 
                                            value={profile.trainer_name} 
                                            onChange={handleInputChange} 
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <CustomButton variant='primary' type='submit' className='w-100 mt-3'><strong>Update Profile</strong></CustomButton>
                            {message && <Alert className='mt-3' variant={variant}>{message}</Alert>}
                        </Form>
                    </div>
                </Collapse>
                
                <SectionTitle>Trainer</SectionTitle>
                <Row className="mt-4">
                    <Col md={12}>
                        <TrainerCard>
                            <TrainerImage src={trainerProfilePic} />
                            <div>
                                <h5>{profile.trainer_name}</h5>
                            </div>
                            <EditButton 
                                variant="secondary" 
                                size="sm" 
                                onClick={handleTrainerProfilePicClick}
                                style={{ position: 'absolute', top: '10px', right: '10px' }}
                            >
                                Edit
                            </EditButton>
                            <Form.Control
                                type="file"
                                ref={trainerProfilePicInputRef}
                                style={{ display: 'none' }}
                                onChange={(e) => handleProfilePicUpload(e, 'trainer')}
                            />
                        </TrainerCard>
                    </Col>
                </Row>

                <SectionTitle>Participants</SectionTitle>
                <div>
                    {participants.map(participant => (
                        <ParticipantListItem key={participant.participant_id}>
                            <span>{participant.first_name} {participant.last_name}, Age: {participant.age}, Gender: {participant.gender}</span>
                            <ActionButtons>
                                <EditParticipantButton size='sm' onClick={() => handleEditParticipantClick(participant)}>Edit</EditParticipantButton>
                                <DeleteParticipantButton size='sm' onClick={() => handleDeleteParticipantClick(participant.participant_id)}>Delete</DeleteParticipantButton>
                            </ActionButtons>
                        </ParticipantListItem>
                    ))}
                </div>
                <CustomButton
                    onClick={() => setOpenParticipant(!openParticipant)}
                    aria-controls="collapse-participant-form"
                    aria-expanded={openParticipant}
                >
                    Add New Participant
                </CustomButton>
                <Collapse in={openParticipant}>
                    <div id="collapse-participant-form">
                        <Form onSubmit={handleNewParticipantSubmit}>
                            <Form.Group className='mb-3' controlId='formFirstName'>
                                <Form.Label><strong>First Name</strong></Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name='first_name' 
                                    value={newParticipant.first_name} 
                                    onChange={handleNewParticipantChange} 
                                    required
                                />
                            </Form.Group>
                            <Form.Group className='mb-3' controlId='formLastName'>
                                <Form.Label><strong>Last Name</strong></Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name='last_name' 
                                    value={newParticipant.last_name} 
                                    onChange={handleNewParticipantChange} 
                                    required
                                />
                            </Form.Group>
                            <Form.Group className='mb-3' controlId='formAge'>
                                <Form.Label><strong>Age</strong></Form.Label>
                                <Form.Control 
                                    type="number" 
                                    name='age' 
                                    value={newParticipant.age} 
                                    onChange={handleNewParticipantChange} 
                                    required
                                />
                            </Form.Group>
                            <Form.Group className='mb-3' controlId='formGender'>
                                <Form.Label><strong>Gender</strong></Form.Label>
                                <Form.Control 
                                    as="select" 
                                    name='gender' 
                                    value={newParticipant.gender} 
                                    onChange={handleNewParticipantChange} 
                                    required
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </Form.Control>
                            </Form.Group>
                            <CustomButton variant='primary' type='submit' className='w-100 mt-3'><strong>Add Participant</strong></CustomButton>
                        </Form>
                    </div>
                </Collapse>
                {message && <Alert className='mt-3' variant={variant}>{message}</Alert>}

                <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Participant</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleEditParticipantSubmit}>
                            <Form.Group className='mb-3' controlId='formEditFirstName'>
                                <Form.Label><strong>First Name</strong></Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name='first_name' 
                                    value={selectedParticipant?.first_name || ''} 
                                    onChange={handleEditParticipantChange} 
                                    required
                                />
                            </Form.Group>
                            <Form.Group className='mb-3' controlId='formEditLastName'>
                                <Form.Label><strong>Last Name</strong></Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name='last_name' 
                                    value={selectedParticipant?.last_name || ''} 
                                    onChange={handleEditParticipantChange} 
                                    required
                                />
                            </Form.Group>
                            <Form.Group className='mb-3' controlId='formEditAge'>
                                <Form.Label><strong>Age</strong></Form.Label>
                                <Form.Control 
                                    type="number" 
                                    name='age' 
                                    value={selectedParticipant?.age || ''} 
                                    onChange={handleEditParticipantChange} 
                                    required
                                />
                            </Form.Group>
                            <Form.Group className='mb-3' controlId='formEditGender'>
                                <Form.Label><strong>Gender</strong></Form.Label>
                                <Form.Control 
                                    as="select" 
                                    name='gender' 
                                    value={selectedParticipant?.gender || ''} 
                                    onChange={handleEditParticipantChange} 
                                    required
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </Form.Control>
                            </Form.Group>
                            <CustomButton variant='primary' type='submit' className='w-100 mt-3'><strong>Update Participant</strong></CustomButton>
                        </Form>
                    </Modal.Body>
                </Modal>
            </StyledContainer>
        </PageBackground>
    );
};

export default Profile;

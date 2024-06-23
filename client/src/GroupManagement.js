import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';
import { Container, Form, Button, Accordion, ListGroup } from 'react-bootstrap';
import styled from 'styled-components';


const PageContainer = styled.div`
  padding: 20px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  max-width: 800px; /* Adjust this value to match the width of the Events page */
  margin: 0 auto; /* Center the container */
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

const AccordionHeader = styled(Accordion.Header)`
  color: #ff69b4;
  background-color: #ffffff;
  box-shadow: inset 0 -1px 0 rgb(0 0 0 / 13%);
  &:hover {
    color: #ffffff;
    background-color: #ffffff; /* This ensures the background color remains white on hover */
  }
`;

const AccordionBody = styled(Accordion.Body)`
  background-color: #f8f9fa;
`;

const AccordionItem = styled(Accordion.Item)`
  border: none;
`;
const GroupManagement = () => {
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');
  const [participants, setParticipants] = useState([]);
  const [events, setEvents] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [filteredCompetitions, setFilteredCompetitions] = useState([]);
  const [participantsWithCompetitions, setParticipantsWithCompetitions] = useState({});
  const [group, setGroup] = useState({ name: '', num_participants: 0, age_category: '', type: '' });
  const [groupId, setGroupId] = useState('');
  const [groups, setGroups] = useState([]);
  const [duos, setDuos] = useState([]);
  const [trios, setTrios] = useState([]);
  const [participantId, setParticipantId] = useState('');
  const [competitionEntry, setCompetitionEntry] = useState({
    competitionId: '',
    ageCategory: '',
    type: 'solo',
    gender: 'Male',
    participantId: '',
    groupId: '',
    musicFile: null
  });
  const [selectedEvent, setSelectedEvent] = useState('');
  const [groupsWithCompetitions, setGroupsWithCompetitions] = useState({});

  useEffect(() => {
    fetchEvents();
    fetchGroups();
    fetchParticipants();
    fetchParticipantsWithCompetitions();
    fetchGroupsWithCompetitions();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      setFilteredCompetitions(competitions.filter(c => c.event_id === parseInt(selectedEvent)));
    } else {
      setFilteredCompetitions([]);
    }
  }, [selectedEvent, competitions]);

  const groupBy = (array, key) => {
    return array.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
      return result;
    }, {});
  };

  const fetchEvents = () => {
    axiosInstance.get('/events', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        setEvents(res.data.events);
      })
      .catch(err => {
        console.error('Error retrieving events:', err);
        setVariant('danger');
        setMessage('Error retrieving events');
      });
  };

  const fetchGroups = () => {
    axiosInstance.get('/groups', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        const allGroups = res.data.groups;
        setGroups(allGroups.filter(group => group.num_participants >= 4));
        setDuos(allGroups.filter(group => group.num_participants === 2));
        setTrios(allGroups.filter(group => group.num_participants === 3));
      })
      .catch(err => {
        console.error('Error retrieving groups:', err);
        setVariant('danger');
        setMessage('Error retrieving groups');
      });
  };

  const fetchParticipants = () => {
    axiosInstance.get('/participants', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        if (res.data.Status === 'Success') {
          setParticipants(res.data.participants);
        } else {
          setVariant('danger');
          setMessage('Cannot get the participants');
        }
      })
      .catch(err => {
        console.error('Eroare:', err);
        setVariant('danger');
        setMessage('Error retrieving participants');
      });
  };

  const fetchParticipantsWithCompetitions = () => {
    axiosInstance.get('/participants-with-competitions', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        const groupedParticipants = groupBy(res.data.participants, 'participant_id');
        setParticipantsWithCompetitions(groupedParticipants);
      })
      .catch(err => {
        console.error('Error retrieving participants with competitions:', err);
        setVariant('danger');
        setMessage('Error retrieving participants with competitions');
      });
  };

  const fetchGroupsWithCompetitions = () => {
    axiosInstance.get('/groups-with-competitions', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        const groupedGroups = groupBy(res.data.groupsWithCompetitions, 'group_id');
        setGroupsWithCompetitions(groupedGroups);
      })
      .catch(err => {
        console.error('Error retrieving groups with competitions:', err);
        setVariant('danger');
        setMessage('Error retrieving groups with competitions');
      });
  };

  const fetchCompetitions = (eventId) => {
    axiosInstance.get(`/competitions?eventId=${eventId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        setCompetitions(res.data.competitions);
      })
      .catch(err => {
        console.error('Error retrieving competitions:', err);
        setVariant('danger');
        setMessage('Error retrieving competitions');
      });
  };

  const handleGroupInputChange = (e) => {
    const { name, value } = e.target;
    setGroup(prevState => ({ ...prevState, [name]: value }));
  };

  const handleCompetitionEntryChange = (e) => {
    const { name, value } = e.target;
    setCompetitionEntry(prevState => ({ ...prevState, [name]: value }));
  };

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    setCompetitionEntry(prevState => ({ ...prevState, competitionId: '', ageCategory: '', type: 'solo', gender: 'Male', participantId: '', groupId: '' }));
    fetchCompetitions(eventId);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCompetitionEntry(prevState => ({ ...prevState, musicFile: file }));
  };

  const handleGroupSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('User is not authenticated');
      return;
    }

    console.log('Submitting group data:', group);
    console.log('Token:', token);

    // Validate the group type and number of participants
    if (group.type === 'Duo' && !(group.num_participants > 1 && group.num_participants < 3)) {
      alert('A duo must have exactly 2 participants');
      return;
    }

    if (group.type === 'Trio' && !(group.num_participants > 2 && group.num_participants < 4)) {
      alert('A trio must have exactly 3 participants');
      return;
    }

    if (group.type === 'Grup' && group.num_participants < 4) {
      alert('A group must have more than 4 participants');
      return;
    }

    // Submit the form data to the server
    try {
      const response = await axiosInstance.post('/groups', group, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Server response:', response.data);
      alert('Group created successfully');
      fetchGroups();
    } catch (error) {
      console.error('Error during group creation:', error.response ? error.response.data : error.message);
      alert('Creating group error');
    }
  };

  const handleParticipantToGroupSubmit = async (e) => {
    e.preventDefault();

    const selectedParticipant = participants.find(p => p.participant_id === parseInt(participantId));
    const groupDetails = groups.concat(duos, trios).find(g => g.group_id === parseInt(groupId));

    if (selectedParticipant && groupDetails) {
      const age = selectedParticipant.age;
      const ageCategory = groupDetails.age_category;
      let valid = false;

      switch (ageCategory) {
        case 'under 10 years':
          valid = age < 10;
          break;
        case 'between 10 and 20 years':
          valid = age >= 10 && age <= 20;
          break;
        case 'between 20 and 30 years':
          valid = age >= 20 && age <= 30;
          break;
        case '30+ years':
          valid = age > 30;
          break;
        default:
          valid = false;
      }

      if (!valid) {
        alert(`The participant does not fit into the age category ${ageCategory}.`);
        return;
      }
    }

    try {
      if (groupDetails && groupDetails.num_participants === 2) {
        const participantCountRes = await axiosInstance.get(`/groups/${groupId}/participants-count`);
        const participantCount = participantCountRes.data.participant_count;
        if (participantCount >= 2) {
          alert('Duo already has 2 participants');
          return;
        }
      } else if (groupDetails && groupDetails.num_participants === 3) {
        const participantCountRes = await axiosInstance.get(`/groups/${groupId}/participants-count`);
        const participantCount = participantCountRes.data.participant_count;
        if (participantCount >= 3) {
          alert('Trio already has 3 participants');
          return;
        }
      }
      await axiosInstance.post(`/groups/${groupId}/participants`, { participantId }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('Participant added successfully to the group');
      fetchGroups();
    } catch (error) {
      console.error('Error adding participant to group:', error);
      alert('Error adding participant to group');
    }
  };

  const handleCompetitionEntrySubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting competition entry:', competitionEntry);

    const selectedParticipant = participants.find(p => p.participant_id === parseInt(competitionEntry.participantId));
    if (selectedParticipant) {
      const age = selectedParticipant.age;
      const ageCategory = competitionEntry.ageCategory;
      let valid = false;

      switch (ageCategory) {
        case 'under 10 years':
          valid = age < 10;
          break;
        case 'between 10 and 20 years':
          valid = age >= 10 && age <= 20;
          break;
        case 'between 20 and 30 years':
          valid = age >= 20 && age <= 30;
          break;
        case '30+ years':
          valid = age > 30;
          break;
        default:
          valid = false;
      }

      if (!valid) {
        alert(`The participant does not fit into the age category ${ageCategory}.`);
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append('competitionId', competitionEntry.competitionId);
      formData.append('ageCategory', competitionEntry.ageCategory);
      formData.append('type', competitionEntry.type);
      formData.append('gender', competitionEntry.gender);

      if (competitionEntry.type === 'solo') {
        formData.append('participantId', competitionEntry.participantId);
      } else {
        formData.append('groupId', competitionEntry.groupId);
      }

      formData.append('musicFile', competitionEntry.musicFile);

      // Log the FormData content
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}, ${pair[1]}`);
      }

      console.log('Sending competition entry data:', formData);

      const response = await axiosInstance.post('/competition-entries', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Competition entry submitted successfully:', response.data);
      alert('Competition entry submitted successfully');

      // Reset competition entry form state
      setCompetitionEntry({
        competitionId: '',
        ageCategory: '',
        type: 'solo',
        gender: 'Male',
        participantId: '',
        groupId: '',
        musicFile: null
      });

    } catch (error) {
      console.error('Error during competition entry submission:', error.response ? error.response.data : error.message);
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert('Participant registration failed');
      }
    }
  };
  return (
    <PageContainer>
      <SectionTitle>Participants Management</SectionTitle>
      <Accordion defaultActiveKey="0">
        <AccordionItem eventKey="0">
          <AccordionHeader>Create Group</AccordionHeader>
          <AccordionBody>
            <StyledForm onSubmit={handleGroupSubmit}>
              <Form.Group controlId="name">
                <Form.Label><strong>Group name</strong></Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={group.name}
                  onChange={handleGroupInputChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="num_participants" className="mt-2">
                <Form.Label><strong>Number of participants</strong></Form.Label>
                <Form.Control
                  type="number"
                  name="num_participants"
                  value={group.num_participants}
                  onChange={handleGroupInputChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="age_category" className="mt-2">
                <Form.Label><strong>Age category</strong></Form.Label>
                <Form.Control
                  as="select"
                  name="age_category"
                  value={group.age_category}
                  onChange={handleGroupInputChange}
                  required
                >
                  <option value="">Select age category </option>
                  <option value="under 10 years">under 10 years</option>
                  <option value="between 10 and 20 years">between 10 and 20 years</option>
                  <option value="between 20 and 30 years">between 20 and 30 years</option>
                  <option value="30+ years">30+ years</option>
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="type" className="mt-2">
                <Form.Label><strong>Type</strong></Form.Label>
                <Form.Control
                  as="select"
                  name="type"
                  value={group.type}
                  onChange={handleGroupInputChange}
                  required
                >
                  <option value="">Select type</option>
                  <option value="Duo">Duo</option>
                  <option value="Trio">Trio</option>
                  <option value="Grup">Grup</option>
                </Form.Control>
              </Form.Group>
              <StyledButton type="submit" className="mt-2 w-100">
                Create Group
              </StyledButton>
            </StyledForm>
          </AccordionBody>
        </AccordionItem>
        <AccordionItem eventKey="1">
          <AccordionHeader>Add participant to group</AccordionHeader>
          <AccordionBody>
            <StyledForm onSubmit={handleParticipantToGroupSubmit}>
              <Form.Group controlId="groupId" className="mt-2">
                <Form.Label><strong>Select group</strong></Form.Label>
                <Form.Control
                  as="select"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  required
                >
                  <option value="">Select group</option>
                  {groups.concat(duos, trios).map((group, index) => (
                    <option key={`group-${group.group_id}-${index}`} value={group.group_id}>
                      {group.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="participantId" className="mt-2">
                <Form.Label><strong>Select participant</strong></Form.Label>
                <Form.Control
                  as="select"
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  required
                >
                  <option value="">Select participant</option>
                  {participants.map(participant => (
                    <option key={participant.participant_id} value={participant.participant_id}>
                      {participant.first_name} {participant.last_name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <StyledButton type="submit" className="mt-2 w-100">
                Add participant to group
              </StyledButton>
            </StyledForm>
          </AccordionBody>
        </AccordionItem>
        <AccordionItem eventKey="2">
          <AccordionHeader>Registration for competition</AccordionHeader>
          <AccordionBody>
            <StyledForm onSubmit={handleCompetitionEntrySubmit}>
              <Form.Group controlId="eventId" className="mt-2">
                <Form.Label><strong>Select event</strong></Form.Label>
                <Form.Control
                  as="select"
                  name="eventId"
                  value={selectedEvent}
                  onChange={handleEventChange}
                  required
                >
                  <option value="">Select event</option>
                  {events.map(event => (
                    <option key={event.event_id} value={event.event_id}>
                      {event.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="competitionId" className="mt-2">
                <Form.Label><strong>Select competition</strong></Form.Label>
                <Form.Control
                  as="select"
                  name="competitionId"
                  value={competitionEntry.competitionId}
                  onChange={handleCompetitionEntryChange}
                  required
                >
                  <option value="">Select competition</option>
                  {filteredCompetitions.map(competition => (
                    <option key={competition.competition_id} value={competition.competition_id}>
                      {competition.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="ageCategory" className="mt-2">
                <Form.Label><strong>Age category</strong></Form.Label>
                <Form.Control
                  as="select"
                  name="ageCategory"
                  value={competitionEntry.ageCategory}
                  onChange={handleCompetitionEntryChange}
                  required
                >
                  <option value="">Select age category</option>
                  <option value="under 10 years">under 10 years</option>
                  <option value="between 10 and 20 years">between 10 and 20 years</option>
                  <option value="between 20 and 30 years">between 20 and 30 years</option>
                  <option value="30+ years">30+ years</option>
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="type" className="mt-2">
                <Form.Label><strong>Type</strong></Form.Label>
                <Form.Control
                  as="select"
                  name="type"
                  value={competitionEntry.type}
                  onChange={handleCompetitionEntryChange}
                  required
                >
                  <option value="solo">Solo</option>
                  <option value="duo">Duo</option>
                  <option value="trio">Trio</option>
                  <option value="group">Group</option>
                </Form.Control>
              </Form.Group>
              {competitionEntry.type === 'solo' && (
                <>
                  <Form.Group controlId="participantId" className="mt-2">
                    <Form.Label><strong>Select participant</strong></Form.Label>
                    <Form.Control
                      as="select"
                      name="participantId"
                      value={competitionEntry.participantId}
                      onChange={handleCompetitionEntryChange}
                      required
                    >
                      <option value="">Select participant</option>
                      {participants.map(participant => (
                        <option key={participant.participant_id} value={participant.participant_id}>
                          {participant.first_name} {participant.last_name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                  <Form.Group controlId="gender" className="mt-2">
                    <Form.Label><strong>Gender</strong></Form.Label>
                    <Form.Control
                      as="select"
                      name="gender"
                      value={competitionEntry.gender}
                      onChange={handleCompetitionEntryChange}
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </Form.Control>
                  </Form.Group>
                  <Form.Group controlId="musicFile" className="mt-2">
                    <Form.Label><strong>Upload music</strong></Form.Label>
                    <Form.Control
                      type="file"
                      name="musicFile"
                      accept=".mp3"
                      onChange={handleFileChange}
                      required
                    />
                  </Form.Group>
                </>
              )}
              {competitionEntry.type !== 'solo' && (
                <>
                  <Form.Group controlId="groupId" className="mt-2">
                    <Form.Label><strong>Select {competitionEntry.type}</strong></Form.Label>
                    <Form.Control
                      as="select"
                      name="groupId"
                      value={competitionEntry.groupId}
                      onChange={handleCompetitionEntryChange}
                      required
                    >
                      <option value="">Select {competitionEntry.type}</option>
                      {competitionEntry.type === 'duo' && duos.map(duo => (
                        <option key={duo.group_id} value={duo.group_id}>
                          {duo.name}
                        </option>
                      ))}
                      {competitionEntry.type === 'trio' && trios.map(trio => (
                        <option key={trio.group_id} value={trio.group_id}>
                          {trio.name}
                        </option>
                      ))}
                      {competitionEntry.type === 'group' && groups.map(group => (
                        <option key={group.group_id} value={group.group_id}>
                          {group.name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                  <Form.Group controlId="musicFile" className="mt-2">
                    <Form.Label><strong>Upload music</strong></Form.Label>
                    <Form.Control
                      type="file"
                      name="musicFile"
                      accept=".mp3"
                      onChange={handleFileChange}
                      required
                    />
                  </Form.Group>
                </>
              )}
              <StyledButton type="submit" className="mt-2 w-100">
                Register
              </StyledButton>
            </StyledForm>
          </AccordionBody>
        </AccordionItem>
        <AccordionItem eventKey="3">
          <AccordionHeader>Participants registered in competitions</AccordionHeader>
          <AccordionBody>
            <Accordion>
              {Object.keys(participantsWithCompetitions).map(participantId => {
                const participantCompetitions = participantsWithCompetitions[participantId];
                const { first_name, last_name } = participantCompetitions[0];
                return (
                  <AccordionItem eventKey={`participant-${participantId}`} key={`participant-${participantId}`}>
                    <AccordionHeader>{first_name} {last_name}</AccordionHeader>
                    <AccordionBody>
                      <ListGroup>
                        {participantCompetitions.map(comp => (
                          <ListGroup.Item key={comp.competition_id}>
                            Competition: {comp.competition_name}<br/>
                            {comp.music_file ? (
                              <div>
                              <span>Music: </span>
                              <audio controls>
                                <source src={`/${comp.music_file}`} type="audio/mpeg" />
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                            ) : (
                              <span>Music: not uploaded yet</span>
                            )}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </AccordionBody>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </AccordionBody>
        </AccordionItem>
        <AccordionItem eventKey="4">
          <AccordionHeader>Groups registered in competitions</AccordionHeader>
          <AccordionBody>
            <Accordion>
              {Object.keys(groupsWithCompetitions).map(groupId => {
                const groupCompetitions = groupsWithCompetitions[groupId];
                const { group_name } = groupCompetitions[0];
                return (
                  <AccordionItem eventKey={`group-${groupId}`} key={`group-${groupId}`}>
                    <AccordionHeader>{group_name}</AccordionHeader>
                    <AccordionBody>
                      <ListGroup>
                        {groupCompetitions.map(comp => (
                          <ListGroup.Item key={comp.competition_id}>
                            Competition: {comp.competition_name}<br/>
                            {comp.music_file ? (
                              <span>Music: <a href={`/${comp.music_file}`} target="_blank" rel="noopener noreferrer">{comp.music_file.split('/').pop()}</a></span>
                            ) : (
                              <span>Music: not uploaded yet</span>
                            )}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </AccordionBody>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </AccordionBody>
        </AccordionItem>
        <AccordionItem eventKey="5">
          <AccordionHeader>Groups and Participants</AccordionHeader>
          <AccordionBody>
            <h5>Groups</h5>
            <Accordion>
              {groups.map(group => (
                <AccordionItem eventKey={`group-${group.group_id}`} key={`group-${group.group_id}`}>
                  <AccordionHeader>{group.name}</AccordionHeader>
                  <AccordionBody>
                    <ListGroup>
                      {group.participants && group.participants.map(participant => (
                        <ListGroup.Item key={`participant-${participant.participant_id}`}>
                          {participant.first_name} {participant.last_name}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </AccordionBody>
                </AccordionItem>
              ))}
            </Accordion>
            <h5>Duos</h5>
            <Accordion>
              {duos.map(duo => (
                <AccordionItem eventKey={`duo-${duo.group_id}`} key={`duo-${duo.group_id}`}>
                  <AccordionHeader>{duo.name}</AccordionHeader>
                  <AccordionBody>
                    <ListGroup>
                      {duo.participants && duo.participants.map(participant => (
                        <ListGroup.Item key={`participant-${participant.participant_id}`}>
                          {participant.first_name} {participant.last_name}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </AccordionBody>
                </AccordionItem>
              ))}
            </Accordion>
            <h5>Trios</h5>
            <Accordion>
              {trios.map(trio => (
                <AccordionItem eventKey={`trio-${trio.group_id}`} key={`trio-${trio.group_id}`}>
                  <AccordionHeader>{trio.name}</AccordionHeader>
                  <AccordionBody>
                    <ListGroup>
                      {trio.participants && trio.participants.map(participant => (
                        <ListGroup.Item key={`participant-${participant.participant_id}`}>
                          {participant.first_name} {participant.last_name}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </AccordionBody>
                </AccordionItem>
              ))}
            </Accordion>
          </AccordionBody>
        </AccordionItem>
      </Accordion>
    </PageContainer>
  );
};

export default GroupManagement;

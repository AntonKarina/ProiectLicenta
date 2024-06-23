import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosConfig';

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
    title: {
        fontSize: '2em',  // Larger font size for the page title
        fontWeight: 'bold',
        color: '#e84393',  // Changed to pink color
        marginBottom: '10px',
        textAlign: 'center'
    },
    competitionTitle: {
        fontSize: '1.5em',  // Slightly smaller font size for competition titles
        fontWeight: '600',
        color: '#333',
        marginBottom: '5px'
    },
    details: {
        fontSize: '1.1em',
        color: '#666',
        lineHeight: '1.5'
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        position: 'absolute',
        right: '20px',
        bottom: '20px'
    },
    payButton: {
        padding: '10px 20px',
        backgroundColor: '#343a40',  // Changed to match "Update Profile" button
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        position: 'absolute',
        right: '20px',
        bottom: '20px',
        '&:hover': {
            backgroundColor: '#23272b',  // Darker color on hover
            borderColor: '#1d2124'
        }
    },
    accepted: {
        color: '#28a745',
        fontWeight: 'bold',
        fontSize: '1em',
        position: 'absolute',
        right: '20px',
        bottom: '20px'
    },
    total: {
        fontSize: '1.5em',
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'right',
        marginTop: '20px'
    },
    error: {
        color: 'red',
        marginTop: '20px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '16px'
    },
    input: {
        marginBottom: '8px',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ddd'
    }
};

const PaymentSummary = () => {
    const [summary, setSummary] = useState([]);
    const [error, setError] = useState('');
    const [paymentDetails, setPaymentDetails] = useState({});
    const [showPaymentForm, setShowPaymentForm] = useState(null);

    useEffect(() => {
        fetchPaymentSummary();
    }, []);

    useEffect(() => {
        console.log('showPaymentForm state updated:', showPaymentForm); // Debugging log
    }, [showPaymentForm]);

    const fetchPaymentSummary = async () => {
        try {
            const response = await axiosInstance.get('/api/payment-summary');
            console.log('Payment summary fetched:', response.data); // Debugging log
            if (response.data.Status === 'Success') {
                setSummary(response.data.summary);
                console.log('Summary data:', response.data.summary); // Log summary data
            } else {
                setError('Failed to fetch payment summary.');
            }
        } catch (error) {
            console.error('Error fetching payment summary:', error);
            setError('An error occurred while fetching payment summary.');
        }
    };

    const handlePayClick = (competitionId, participantId) => {
        console.log('handlePayClick called with:', competitionId, participantId); // Debugging log
        setShowPaymentForm({ competitionId, participantId });
    };

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        setPaymentDetails({ ...paymentDetails, [name]: value });
    };

    const handlePaymentSubmit = async () => {
        const { competitionId, participantId } = showPaymentForm;
        const payload = {
            ...paymentDetails,
            competitionId,
            participantId,
        };

        // Log the payload to debug
        console.log('Submitting payment with payload:', payload); // Debugging log

        try {
            const response = await axiosInstance.post('/api/payment', payload);
            if (response.data.Status === 'Success') {
                setSummary(summary.map(item => {
                    if (item.competitionId === competitionId && item.participantId === participantId) {
                        return { ...item, accepted: true };
                    }
                    return item;
                }));
                setShowPaymentForm(null);
            } else {
                alert('Payment failed. Please try again.');
            }
        } catch (error) {
            console.error('Error processing payment:', error.response?.data || error);
            alert('Payment failed. Please try again.');
        }
    };

    const calculateTotal = () => {
        return summary.reduce((total, item) => total + item.price, 0);
    };

    const groupByEvent = (summary) => {
        return summary.reduce((acc, item) => {
            if (!acc[item.eventName]) {
                acc[item.eventName] = [];
            }
            acc[item.eventName].push(item);
            return acc;
        }, {});
    };

    const groupedSummary = groupByEvent(summary);

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Payment Summary</h2>
            {error && <p style={styles.error}>{error}</p>}
            {Object.keys(groupedSummary).map((eventName, index) => (
                <div key={index} style={styles.eventCard}>
                    <div style={styles.competitionTitle}>{eventName}</div> {/* Adjusted this title style */}
                    {groupedSummary[eventName].map((comp, idx) => (
                        <div key={idx} style={styles.competitionCard}>
                            <div style={styles.competitionTitle}>{comp.competitionName} - {comp.type}</div>
                            <div style={styles.details}>
                                Participant: {comp.name} <br />
                                Price: {comp.price} EUR
                            </div>
                            {comp.accepted ? (
                                <div style={styles.accepted}>Payment Accepted</div>
                            ) : (
                                <button
                                    style={styles.payButton}
                                    onClick={() => {
                                        console.log('Pay button clicked for:', comp.competitionId, comp.participantId); // Debugging log
                                        handlePayClick(comp.competitionId, comp.participantId);
                                    }}
                                >
                                    Pay
                                </button>
                            )}
                            {showPaymentForm && showPaymentForm.competitionId === comp.competitionId && showPaymentForm.participantId === comp.participantId && (
                                <div style={styles.form}>
                                    <input
                                        style={styles.input}
                                        type="text"
                                        name="cardNumber"
                                        placeholder="Card Number"
                                        onChange={handlePaymentChange}
                                    />
                                    <input
                                        style={styles.input}
                                        type="text"
                                        name="cardName"
                                        placeholder="Card Name"
                                        onChange={handlePaymentChange}
                                    />
                                    <input
                                        style={styles.input}
                                        type="text"
                                        name="expiryDate"
                                        placeholder="Expiry Date"
                                        onChange={handlePaymentChange}
                                    />
                                    <input
                                        style={styles.input}
                                        type="text"
                                        name="cvv"
                                        placeholder="CVV"
                                        onChange={handlePaymentChange}
                                    />
                                    <button
                                        style={styles.payButton}
                                        onClick={handlePaymentSubmit}
                                    >
                                        Submit Payment
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ))}
            <div style={styles.total}>Total: {calculateTotal()} EUR</div>
        </div>
    );
};

export default PaymentSummary;

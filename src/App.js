import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css'; // Styling file

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  const [pinCode, setPinCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/form-fields`)
      .then(res => setFields(res.data))
      .catch(err => setStatus('Error fetching form data.'));
  }, []);

  useEffect(() => {
    if (pinCode.length === 6) {
      axios.get(`https://api.postalpincode.in/pincode/${pinCode}`)
        .then(res => {
          if (res.data && res.data[0].Status === 'Success') {
            const postOffice = res.data[0].PostOffice[0];
            setCity(postOffice.District);
            setState(postOffice.State);
          } else {
            setCity('');
            setState('');
            setStatus('Error: Invalid PIN code.');
          }
        })
        .catch(err => {
          setCity('');
          setState('');
          setStatus('Error: Could not fetch PIN code data.');
        });
    }
  }, [pinCode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handlePinCodeChange = (e) => {
    setPinCode(e.target.value);
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    const aadhaar = formData.aadhaarNumber;
    if (!aadhaar || !/^[0-9]{12}$/.test(aadhaar)) {
      setStatus('Error: Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    setStatus('');
    setCurrentStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pan = formData.panNumber;
    if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      setStatus('Error: Please enter a valid PAN number.');
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_URL}/api/submit`, { ...formData, city, state });
      setStatus('Form submitted successfully!');
      console.log(res.data);
    } catch (err) {
      setStatus('Error submitting form.');
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 flex items-center justify-center">
      <div className="container">
        <h1 className="text-center">Udyam Registration Form</h1>
        
        <div className="progress-bar">
          <div className={`step-circle ${currentStep >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line"></div>
          <div className={`step-circle ${currentStep >= 2 ? 'active' : ''}`}>2</div>
        </div>

        {status && (
          <p className={status.includes('Error') ? "status-message error" : "status-message"}>
            {status}
          </p>
        )}

        {currentStep === 1 && (
          <form onSubmit={handleNextStep} className="form-container">
            {fields.filter(f => f.name === 'aadhaarNumber' || f.name === 'nameAsPerAadhaar').map((field, index) => (
              <div className="form-field" key={index}>
                <label className="form-label">{field.label || 'No Label'}</label>
                <input
                  name={field.name}
                  placeholder={field.placeholder}
                  type="text"
                  className="form-input"
                  onChange={handleChange}
                />
              </div>
            ))}
            
            <div className="form-field">
              <label className="form-label">PIN Code</label>
              <input
                name="pinCode"
                placeholder="PIN Code"
                type="text"
                className="form-input"
                onChange={handlePinCodeChange}
                value={pinCode}
              />
            </div>
            <div className="form-field">
              <label className="form-label">City</label>
              <input
                name="city"
                placeholder="City"
                type="text"
                className="form-input"
                value={city}
                readOnly
              />
            </div>
            <div className="form-field">
              <label className="form-label">State</label>
              <input
                name="state"
                placeholder="State"
                type="text"
                className="form-input"
                value={state}
                readOnly
              />
            </div>
            
            <button className="form-button" type="submit">Next</button>
          </form>
        )}

        {currentStep === 2 && (
          <form onSubmit={handleSubmit} className="form-container">
            {fields.filter(f => f.name === 'panNumber').map((field, index) => (
              <div className="form-field" key={index}>
                <label className="form-label">{field.label || 'No Label'}</label>
                <input
                  name={field.name}
                  placeholder={field.placeholder}
                  type="text"
                  className="form-input"
                  onChange={handleChange}
                />
              </div>
            ))}
            <button className="form-button" type="submit">Submit</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;
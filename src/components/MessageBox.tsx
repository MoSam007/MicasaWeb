import React, { useState } from 'react';

const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here, you would usually send the form data to your server or API
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Message:', message);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-amber-300 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
        {submitted ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Thank you for submitting!</h2>
            <p className="text-gray-600">We appreciate your feedback.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl text-center font-bold mb-6 text-gray-800">Contact us!</h2>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                Message
              </label>
              <textarea
                id="message"
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-rose-800 text-white py-2 px-4 rounded-md hover:bg-rose-600  transition duration-300"
            >
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactForm;

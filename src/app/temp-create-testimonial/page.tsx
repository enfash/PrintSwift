'use client';

import { db } from '@/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { useState } from 'react';

export default function TempCreateTestimonialPage() {
  const [message, setMessage] = useState('');

  const handleCreateTestimonial = async () => {
    try {
      const docRef = await addDoc(collection(db, 'testimonials'), {
        author: 'Sample Author',
        testimonial: 'This is a sample testimonial created to initialize the collection.',
        visible: false,
        createdAt: new Date(),
      });
      setMessage(`Successfully created testimonial with ID: ${docRef.id}`);
      console.log('Document written with ID: ', docRef.id);
    } catch (error) {
      console.error('Error adding document: ', error);
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('An unknown error occurred.');
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Temporary Testimonial Creator</h1>
      <p>
        Click the button below to create the first sample testimonial. This will initialize the 'testimonials' collection in your database.
      </p>
      <p>
        You must be logged in as an administrator for this to work.
      </p>
      <button onClick={handleCreateTestimonial} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Create Sample Testimonial
      </button>
      {message && <p style={{ marginTop: '20px' }}>{message}</p>}
    </div>
  );
}

// src/ContactForm.tsx
import React, { useState, useEffect, useRef } from 'react'
import './App.css' // Importing styles
import axios from 'axios'
import Modal from './Modal' // Assuming you have a Modal component

declare function gtag(...args: any[]): void

// Define type/interface for form data
interface FormData {
  li_fat_id: string
  lastName: string
  firstName: string
  email: string
  hashEmail: string
  title: string
  company: string
  countryCode: string
  currency: string
  value: string
  acxiomId: string
  oracleMoatId: string
}

const initialFormData: FormData = {
  li_fat_id: '123456',
  lastName: 'John',
  firstName: 'Doe',
  email: 'john.doe@example.com',
  hashEmail: '836f82db99121b3481011f16b49dfa5fbc714a0d1b1b9f784a1ebbbf5b39577f',
  title: 'Engineer',
  company: 'Acme Inc',
  countryCode: 'US',
  currency: 'USD',
  value: '50.0',
  acxiomId: '12345678',
  oracleMoatId: '12345678',
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState(initialFormData)
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isAnalyticsExecuted = useRef(false)

  useEffect(() => {
    const fetchData = async () => {
      // Grab the li_fat_id from URL or 1st party cookie
      const li_fat_id =
        (typeof window !== 'undefined' &&
          new URLSearchParams(window.location.search).get('li_fat_id')) ||
        (typeof document !== 'undefined' && getCookie('li_fat_id')) ||
        ''

      if (li_fat_id && !isAnalyticsExecuted.current) {
        setFormData((prevData) => ({ ...prevData, li_fat_id }))

        // Identify the user with their li_fat_id
        // window.analytics.identify(null, {
        //   li_fat_id: li_fat_id,
        // })

        // Track the Page view event
        // window.analytics.track('Page View')

        isAnalyticsExecuted.current = true
      }
    }

    fetchData()
  }, []) // Empty dependency array ensures it runs only once

  // Begin Cookie routine
  // getcookie function
  function getCookie(name: string): string | undefined {
    if (typeof document !== 'undefined') {
      let matches = document.cookie.match(
        new RegExp(
          '(?:^|; )' +
            name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') +
            '=([^;]*)'
        )
      )
      return matches ? decodeURIComponent(matches[1]) : undefined
    }
    return undefined
  }
  // End Cookie routine

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Hash email before submission
      const hashedEmail = await hashData(formData.email)
      setFormData((prevData) => ({
        ...prevData,
        hashEmail: hashedEmail,
      }))
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/submit-google-form`,
        formData
      )

      gtag('set', 'user_data', {
        linkedinFirstPartyId: formData.li_fat_id,
        sha256_email_address: hashedEmail,
        address: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          country: formData.countryCode,
        },
        jobTitle: formData.title,
        companyName: formData.company,
      })

      console.log('Form submitted successfully')
      setSubmissionStatus('success')
      setIsModalOpen(true)
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmissionStatus('error')
      setIsModalOpen(true)
    }
  }

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [e.target.name]: e.target.value,
  //   })) // Using functional update
  // }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Update form data
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))

    // Calculate hash for email if the email field is changing
    if (name === 'email') {
      const hashedEmail = await hashData(value)
      setFormData((prevData) => ({
        ...prevData,
        hashEmail: hashedEmail,
      }))
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleResetForm = () => {
    setFormData(initialFormData)
  }

  // Begin SHA-256 hashing function
  const hashData = async (value) => {
    const encoder = new TextEncoder()
    const buffer = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(value.toLowerCase())
    )
    const hashArray = Array.from(new Uint8Array(buffer))
    return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
  }
  // End SHA-256 hashing function

  return (
    <>
      <div className='App'>
        <form className='centered-form' onSubmit={handleSubmit}>
          <h1 className='form-title'>LinkedIn Online CAPI Demo</h1>

          <label>
            li_fat_id:
            <span className='red-text'>{formData.li_fat_id}</span>
          </label>

          <label>
            Last Name:
            <input
              type='text'
              name='lastName'
              value={formData.lastName}
              onChange={handleChange}
            />
          </label>

          <label>
            First Name:
            <input
              type='text'
              name='firstName'
              value={formData.firstName}
              onChange={handleChange}
            />
          </label>

          <label>
            Email:
            <input
              type='text'
              name='email'
              id='email'
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type='hidden'
              name='hashEmail'
              id='hashEmail'
              value={formData.hashEmail || ''}
              onChange={handleChange}
            />
          </label>

          <label>
            Title:
            <input
              type='text'
              name='title'
              value={formData.title}
              onChange={handleChange}
            />
          </label>

          <label>
            Company:
            <input
              type='text'
              name='company'
              value={formData.company}
              onChange={handleChange}
            />
          </label>

          <label>
            Country Code:
            <input
              type='text'
              name='countryCode'
              value={formData.countryCode}
              onChange={handleChange}
            />
          </label>

          <label>
            Currency:
            <input
              type='text'
              name='currency'
              value={formData.currency}
              onChange={handleChange}
            />
          </label>

          <label>
            Value:
            <input
              type='text'
              name='value'
              value={formData.value}
              onChange={handleChange}
            />
          </label>

          <label>
            Acxiom ID:
            <input
              type='text'
              name='acxiomId'
              value={formData.acxiomId}
              onChange={handleChange}
            />
          </label>

          <label>
            Oracle Moat ID:
            <input
              type='text'
              name='oracleMoatId'
              value={formData.oracleMoatId}
              onChange={handleChange}
            />
          </label>

          <button type='submit'>Submit</button>
          <button type='button' onClick={handleResetForm}>
            Reset Form
          </button>

          <p>
            All leads are submitted in this{' '}
            <a
              href='https://docs.google.com/spreadsheets/d/1gi1EyeuoF9YxLkhAhNi3qb3x05Rm6i6GVIv0q030vso/edit?usp=sharing'
              target='_blank'
              rel='noopener noreferrer'
            >
              Sheet
            </a>
          </p>
        </form>

        {/* Modal Component */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          message={
            submissionStatus === 'success'
              ? 'Form submitted successfully.'
              : submissionStatus === 'error'
              ? 'Error submitting form.'
              : null
          }
        />
      </div>
    </>
  )
}

export default ContactForm

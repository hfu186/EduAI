# EduSpace - Intelligent Learning Management System

**EduSpace** is a next-generation Learning Management System (LMS) designed specifically for IT education. The platform goes beyond traditional course management by integrating AI to provide personalized learning experiences through a **RAG** architecture.

---

## AI-Powered Features

- **AI Virtual Tutor:** A 24/7 virtual assistant that provides instant academic support. It utilizes the **Llama-3.1-8b-instant** model combined with internal course data (PDFs, lectures) to deliver high-precision answers, effectively preventing AI hallucinations.
- **AI Quiz Generator:** Automatically generates Multiple-Choice Questions (MCQs) directly from PDF documents. This helps instructors save up to 80% of time on assessment design and allows students to perform instant self-evaluations.
- **Online Payment:** Integrated with the **PayOS** payment gateway (supporting QR Codes and Bank Transfers), enabling seamless enrollment in specialized premium courses.
- **Progress Analytics:** Visualizes learning journeys and academic performance through interactive dashboards.

---

## Core LMS Functionalities

- **Instructor Studio:** A dedicated workspace for educators to create courses, upload multimedia content (Videos, Slides, PDFs), and manage student enrollments.
- **Interactive Learning:**
  - **Multimedia Player:** Seamlessly study through video lectures and integrated slide viewers.
  - **Assignment Management:** Submit tasks, track deadlines, and receive feedback from instructors.
- **Secure Payments:** Fully integrated with the **PayOS** gateway, supporting VietQR and Bank Transfers for seamless course purchases.
- **Multi-Role System:** Secure access control for **Students**, **Instructors**, and **Administrators** to ensure a streamlined educational workflow.
- **Certification:** Automated generation of completion certificates upon fulfilling course requirements.

## Tech Stack

### Frontend

- **Framework:** React.js (v18.2.0) powered by **Vite**
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion

### Backend

- **Runtime:** Node.js & Express.js
- **Database:** MongoDB (NoSQL) with **Vector Search** capabilities
- **AI Engine:**
  - **Inference:**
  - **Embedding:** 
- **Payment Gateway:** PayOS API


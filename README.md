# 🎓 EduSpace - Intelligent Learning Management System

**EduSpace** is a next-generation Learning Management System (LMS) designed specifically for IT education. The platform goes beyond traditional course management by integrating AI to provide personalized learning experiences through a **RAG** architecture.

---

## 🌟 AI-Powered Features

* **🤖 AI Virtual Tutor:** A 24/7 virtual assistant that provides instant academic support. It utilizes the **Llama-3.1-8b-instant** model combined with internal course data (PDFs, lectures) to deliver high-precision answers, effectively preventing AI hallucinations.
* **📝 AI Quiz Generator:** Automatically generates Multiple-Choice Questions (MCQs) directly from PDF documents. This helps instructors save up to 80% of time on assessment design and allows students to perform instant self-evaluations.
* **💳 Online Payment:** Integrated with the **PayOS** payment gateway (supporting QR Codes and Bank Transfers), enabling seamless enrollment in specialized premium courses.
* **📊 Progress Analytics:** Visualizes learning journeys and academic performance through interactive dashboards.

---
## 📚 Core LMS Functionalities

* **👨‍🏫 Instructor Studio:** A dedicated workspace for educators to create courses, upload multimedia content (Videos, Slides, PDFs), and manage student enrollments.
* **📖 Interactive Learning:** * **Multimedia Player:** Seamlessly study through video lectures and integrated slide viewers.
    * **Assignment Management:** Submit tasks, track deadlines, and receive feedback from instructors.
* **💳 Secure Payments:** Fully integrated with the **PayOS** gateway, supporting VietQR and Bank Transfers for seamless course purchases.
* **👥 Multi-Role System:** Secure access control for **Students**, **Instructors**, and **Administrators** to ensure a streamlined educational workflow.
* **📑 Certification:** Automated generation of completion certificates upon fulfilling course requirements.
## 🛠 Tech Stack

### Frontend
* **Framework:** React.js (v18.2.0) powered by **Vite**
* **State Management:** Redux Toolkit
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion

### Backend
* **Runtime:** Node.js & Express.js
* **Database:** MongoDB (NoSQL) with **Vector Search** capabilities
* **AI Engine:** * **Inference:** Llama-3.1-8b-instant (via Groq/Ollama)
    * **Embedding:** `models/gemini-embedding-001`
* **Payment Gateway:** PayOS API

## 🚀 Installation and Setup

### Prerequisites
* Node.js (v18 or higher)
* MongoDB Atlas or Local MongoDB instance
* API Keys: Google Gemini, Groq (for Llama 3.1), and PayOS credentials.

### Step-by-Step Guide

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/eduspace-lms.git](https://github.com/yourusername/eduspace-lms.git)
    cd eduspace-lms
    ```

2.  **Backend Configuration:**
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in the `server` directory:
    ```env
    DATABASE_URL=mongodb://127.0.0.1:27017/yourdbname
    PORT=5000
    MAIL_HOST=smtp.gmail.com
    MAIL_USER="example@example.com"
    MAIL_PASS="examplepassword"
    JWT_SECRET="example"
    PAYOS_CLIENT_ID="example"
    PAYOS_API_KEY="example"
    PAYOS_CHECKSUM_KEY="example"
    GROQ_API_KEY="example"
    GOOGLE_API_KEY="example"
    PINECONE_API_KEY="example"
    PINECONE_INDEX="example"
    CLIENT_URL=http://localhost:5173
    ```

3.  **Frontend Configuration:**
    ```bash
    cd ../client
    npm install
    ```

4.  **Run the application:**
    From the root directory, execute:
    ```bash
    npm run dev
    ```
    *The application will be accessible at: `http://localhost:5173`*


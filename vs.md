# Local Development Setup Guide for VS Code

This guide will walk you through setting up and running the project on your local machine using Visual-Studio Code.

## Prerequisites

1.  **Node.js**: Ensure you have Node.js version 20 or later installed. You can download it from [nodejs.org](https://nodejs.org/).
2.  **VS Code**: Download and install from [code.visualstudio.com](https://code.visualstudio.com/).
3.  **Firebase CLI**: You'll need this to run the local Firebase emulators. Install it globally by running:
    ```bash
    npm install -g firebase-tools
    ```

## Step 1: Clone the Repository

Clone your project from GitHub to your local machine and open the folder in VS Code.

```bash
git clone <your-github-repo-url>
cd <your-project-folder>
code .
```

## Step 2: Install Dependencies

Open the integrated terminal in VS Code (`Ctrl+`` ` `` or `View > Terminal`) and run the following command to install all the necessary packages:

```bash
npm install
```

## Step 3: Configure Firebase

Your application is connected to a Firebase project for its database, authentication, and file storage.

### A. Set Up Your Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new Firebase project or use the existing one (`studio-2356612765-c90c9`).
3.  In your project's **Project Settings**, find your web app's configuration object. It will look something like this:
    ```javascript
    const firebaseConfig = {
      apiKey: "AIza...",
      authDomain: "...",
      projectId: "...",
      storageBucket: "...",
      messagingSenderId: "...",
      appId: "..."
    };
    ```

### B. Create an Environment File

1.  In the root of your project, create a new file named `.env.local`.
2.  Copy your Firebase configuration into this file, formatting it as environment variables prefixed with `NEXT_PUBLIC_`:

    ```.env.local
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
    NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
    ```

    _Note: The application's `src/firebase/config.ts` file is configured to read from these environment variables._

### C. Set Up Firestore and Storage

1.  **Firestore**: In the Firebase Console, go to the **Firestore Database** section and create a database. Start in **test mode** for now to allow easy access during development. The security rules are already defined in `firestore.rules`.
2.  **Storage**: Go to the **Storage** section and click "Get Started". Again, start in **test mode**. The security rules for storage are in `storage.rules`.

## Step 4: Set Up Genkit (for AI Features)

The AI-powered "Design Option Search" uses Genkit.

1.  Create a Google AI API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Add this key to your `.env.local` file:
    ```.env.local
    GEMINI_API_KEY="your-google-ai-api-key"
    ```

## Step 5: Run the Application

You need to run two separate processes in two different terminals within VS Code.

### Terminal 1: Run the Next.js App

This command starts your web application.

```bash
npm run dev
```

Your app will be available at `http://localhost:9002`.

### Terminal 2: Run the Genkit AI Service

This command starts the local server that handles the AI prompts.

```bash
npm run genkit:dev
```

This service runs in the background and is called by your Next.js app when you use the AI search feature.

---

You are now fully set up! You can edit the code in VS Code, and the changes will be reflected live on your local development server.

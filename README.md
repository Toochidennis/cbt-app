# cbt-app
Below is an example of a comprehensive documentation template written in Markdown. You can adjust and expand this documentation as needed to cover all aspects of your app.

---

# LinkSkool Documentation

## Overview

LinkSkool is a computer-based test (CBT) application that enables users to take exams in a secure, streamlined environment. The application guides the user from a home page through subject selection to the actual exam, ensuring the proper activation of the app before the exam begins.

## Table of Contents

- [Overview](#overview)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Application Workflow](#application-workflow)
  - [Home Page](#home-page)
  - [Subject Selection Screen](#subject-selection-screen)
  - [Exam Screen](#exam-screen)
  - [Activation Process](#activation-process)
- [Database and Data Management](#database-and-data-management)
- [IPC and Preload Script](#ipc-and-preload-script)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Troubleshooting](#troubleshooting)
- [Development Notes](#development-notes)

## System Requirements

- **Operating System:** Windows (packaged as an .exe via electron-builder)
- **Dependencies:** Node.js, Electron, better‑sqlite3, and other packages as defined in the `package.json`.
- **Hardware:** Standard PC hardware capable of running a desktop application.

## Installation

1. **Download the Installer:**  
   Users can download the installer (EXE) from the official LinkSkool website or distribution channel.

2. **Installation Process:**  
   Run the installer and follow the on-screen prompts. The installer packages all necessary files, including the database, icons, and activation modules.

3. **First Run:**  
   On first launch, the application checks for activation. If the app is not activated, a window will prompt for an activation code.

## Application Workflow

### Home Page

- **Purpose:**  
  The Home Page is the landing screen where users select the type of exam they wish to take.
  
- **Features:**
  - Display exam types.
  - Navigation to the subject selection screen upon exam type selection.
  - Clear, user-friendly interface.

- **User Interaction:**  
  Users click on the desired exam type to proceed to the subject selection screen.

### Subject Selection Screen

- **Purpose:**  
  This screen allows the user to tailor the exam to their needs.

- **Features:**
  - **Subject Selection:**  
    Choose from available subjects.
  - **Year Selection:**  
    Select the exam year to filter questions accordingly.
  - **Time Configuration:**  
    Choose the duration for the exam.
  - **Navigation:**  
    A button to confirm selections and proceed to the exam screen.

- **User Interaction:**  
  Users make selections using the mouse or keyboard and click the confirmation button to navigate to the exam screen.

### Exam Screen

- **Purpose:**  
  The exam screen is where the user takes the test. It provides the question interface, timer, and navigation controls.

- **Features:**
  - **Timer:**  
    A countdown timer displaying remaining time.
  - **Question Navigation:**  
    Tabs allow switching between subjects (if multiple subjects are selected) while preserving progress.
  - **Question Display:**  
    Each question is displayed with multiple-choice options.
  - **Navigation Buttons:**  
    "Next" and "Previous" buttons (as well as keyboard shortcuts like arrow keys) allow navigation through questions.
  - **Activation Check:**  
    The exam screen will only be accessible if the application is activated.

- **User Interaction:**  
  Users select answers using mouse clicks or keyboard shortcuts, navigate through questions, and submit their exam when finished.

### Activation Process

- **Purpose:**  
  Ensures that the application is properly licensed before use.

- **Workflow:**
  1. **Activation Prompt:**  
     When the user attempts to take an exam, the application checks the activation status.
  2. **Activation Modal:**  
     If not activated, a modal appears requesting an activation code.
  3. **Code Validation:**  
     The user enters the code. If correct, the state is saved (using better‑sqlite3 or a file/other storage method), and the exam can be accessed.
  4. **Reactivation:**  
     Once activated, the activation window will not appear on subsequent launches.

- **User Interaction:**  
  The activation modal appears and requires the user to enter the code. An alert confirms success or failure.

## Database and Data Management

- **Database Engine:**  
  LinkSkool uses [better‑sqlite3](https://github.com/JoshuaWise/better-sqlite3) to manage exam questions, activation status, and exam summaries.
  
- **Data Location:**  
  The database file is stored in the user’s data directory (e.g., using Electron’s `app.getPath('userData')`), ensuring that it’s writable and not located within the asar archive.

- **Seeding:**  
  On first run, if the database is empty, the application seeds it with questions from a specified folder.

## IPC and Preload Script
## Overview
- **IPC (Inter-Process Communication):**
    IPC is used in Electron to securely communicate between the main process (which has full access to Node.js APIs) and the renderer process (which renders the user interface). This ensures that sensitive operations, such as file system access and database operations, are handled securely.

- **Preload Script:**
    The preload script runs in an isolated context and exposes safe APIs to the renderer process using Electron’s `contextBridge`. This allows the renderer to perform actions (like checking activation state or saving data) without directly accessing Node.js modules.

## Keyboard Shortcuts

To improve navigation, LinkSkool supports several keyboard shortcuts:

- **Arrow Left:** Previous question.
- **Arrow Right:** Next question.
- **P:** Previous question.
- **N:** Next question.
- **1-9:** Select corresponding option (based on index).
- **S:** Submit exam.

## Troubleshooting

- **Database Errors:**  
  If errors occur related to database file access, ensure that the app’s data directory is writable and not inside the asar archive.
  
- **Activation Issues:**  
  If the activation modal fails to work properly after multiple attempts, try restarting the application. Persistent issues should be reported to support.

- **Missing Modules:**  
  Ensure that all required dependencies (especially better‑sqlite3) are installed and correctly included in the production build. If modules are missing, check that they’re listed in `dependencies` rather than `devDependencies`.

## Development Notes

- **Packaging:**  
  The app is packaged using electron-builder, with configuration details specified in package.json. Icons and signing details are included for production distribution.
  
- **Code Structure:**  
  - **Main Process:**  
    Manages window creation, activation, and database access.
  - **Renderer Process:**  
    Manages user interface, navigation, and activation UI.
  - **Preload Scripts:**  
    Securely expose Node.js APIs to the renderer process.
  
- **Future Enhancements:**  
  Consider adding more detailed logging, improved error handling, and enhanced UI elements based on user feedback.

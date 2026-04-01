# FUNCTIONAL REQUIREMENTS

## a) Functional Requirements

### i) User Authentication and Authorization:
Allows users to register and log in using secure credentials. Passwords are hashed using bcrypt algorithm before storage. Providing JWT-based authentication with HTTP-only cookies for session management, ensuring tokens expire after 7 days for security.

### ii) Real-Time Messaging:
Users are able to send and receive text and image messages instantly through WebSocket connections powered by Socket.IO. All messages persist in MongoDB database, maintaining complete conversation history across sessions and devices.

### iii) User Discovery and Online Presence:
Enabling users to view all registered contacts with real-time online/offline status indicators. Online users are marked with status dots that update automatically when users connect or disconnect through Socket.IO connections.

### iv) Media File Sharing:
Allowing users to upload and share images directly within conversations. Integrating Cloudinary cloud storage for handling image uploads, automatic optimization, and CDN delivery for fast loading times.

### v) Comprehensive Notification System:
The application implements multi-layered notifications including in-app toast messages, browser push notifications, audio alerts, and unread message badges. Notifications only trigger for messages from users not currently in the active chat window.

### vi) Theme Customization and Responsive Design:
Users can select from 29+ theme options including light, dark, and colorful variants. The application is fully responsive, providing seamless experience across mobile devices, tablets, and desktop screens using TailwindCSS and DaisyUI components.

### vii) Profile Management:
Users are able to view and update their profile information including profile picture uploads. Images are stored in Cloudinary and profile changes reflect immediately across all active sessions.

### viii) Message History and Conversation Management:
Opening any conversation loads complete message history with chronological ordering and proper sender differentiation. The system maintains conversation state with efficient indexed database queries for fast retrieval.

### ix) Error Handling and Security:
Implementing comprehensive input validation on both client and server sides. Security measures include CORS configuration, input sanitization, authentication middleware protecting sensitive endpoints, and HTTPS transmission in production environments.

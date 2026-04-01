# PLANTUML DIAGRAMS FOR REAL-TIME CHAT APPLICATION

## 1. System Architecture Diagram

```plantuml
@startuml
!define RECTANGLE class

skinparam rectangle {
    BackgroundColor LightBlue
    BorderColor Black
}

rectangle "Client Browser" as Client {
    rectangle "React Application" as React {
        rectangle "Components" as Components
        rectangle "Zustand Store" as Store
        rectangle "Socket.IO Client" as SocketClient
    }
}

rectangle "Backend Server" as Backend {
    rectangle "Express.js" as Express {
        rectangle "REST API" as API
        rectangle "Auth Middleware" as AuthMid
    }
    rectangle "Socket.IO Server" as SocketServer
}

rectangle "MongoDB Database" as MongoDB {
    rectangle "Users Collection" as Users
    rectangle "Messages Collection" as Messages
}

rectangle "Cloudinary" as Cloud {
    rectangle "Image Storage" as Storage
    rectangle "CDN Delivery" as CDN
}

Client -down-> Backend : HTTP/HTTPS\nWebSocket
Backend -down-> MongoDB : Database Queries
Backend -down-> Cloud : Image Upload
Cloud -up-> Client : Image URLs

@enduml
```

## 2. User Authentication Flow

```plantuml
@startuml
actor User
participant "React Frontend" as Frontend
participant "Express Backend" as Backend
participant "MongoDB" as DB
database "JWT Token" as JWT

User -> Frontend : Enter credentials
Frontend -> Backend : POST /api/auth/signup or /login
Backend -> Backend : Validate input
Backend -> DB : Check if user exists
alt User Registration
    Backend -> Backend : Hash password (bcrypt)
    Backend -> DB : Create user document
    DB -> Backend : User created
else User Login
    DB -> Backend : User found
    Backend -> Backend : Compare password hash
end
Backend -> JWT : Generate JWT token
Backend -> Frontend : Set HTTP-only cookie\nReturn user data
Frontend -> Frontend : Update auth state
Frontend -> User : Redirect to home page

@enduml
```

## 3. Real-Time Messaging Flow

```plantuml
@startuml
actor "User A" as UserA
participant "React App A" as AppA
participant "Socket.IO Client A" as SocketA
participant "Socket.IO Server" as Server
participant "MongoDB" as DB
participant "Socket.IO Client B" as SocketB
participant "React App B" as AppB
actor "User B" as UserB

UserA -> AppA : Type and send message
AppA -> SocketA : Emit 'sendMessage' event
SocketA -> Server : WebSocket message
Server -> DB : Store message in database
DB -> Server : Message saved
Server -> Server : Find User B's socket ID
Server -> SocketB : Emit 'newMessage' event
SocketB -> AppB : Receive message
AppB -> AppB : Update chat state
AppB -> UserB : Display message instantly
AppB -> AppB : Show notification\n(if not active chat)

@enduml
```

## 4. User Registration Use Case

```plantuml
@startuml
left to right direction
actor User as U

rectangle "Chat Application" {
    usecase "Register Account" as UC1
    usecase "Enter Email" as UC2
    usecase "Enter Full Name" as UC3
    usecase "Enter Password" as UC4
    usecase "Validate Input" as UC5
    usecase "Hash Password" as UC6
    usecase "Store User in DB" as UC7
    usecase "Generate JWT Token" as UC8
    usecase "Login Automatically" as UC9
}

U --> UC1
UC1 ..> UC2 : include
UC1 ..> UC3 : include
UC1 ..> UC4 : include
UC1 ..> UC5 : include
UC5 ..> UC6 : include
UC6 ..> UC7 : include
UC7 ..> UC8 : include
UC8 ..> UC9 : include

@enduml
```

## 5. Messaging Use Case Diagram

```plantuml
@startuml
left to right direction
actor User as U

rectangle "Real-Time Chat System" {
    usecase "Send Text Message" as UC1
    usecase "Send Image Message" as UC2
    usecase "Receive Message" as UC3
    usecase "View Conversation History" as UC4
    usecase "Select User to Chat" as UC5
    usecase "Get Notification" as UC6
    usecase "View Online Status" as UC7
    usecase "Upload Image to Cloud" as UC8
}

U --> UC1
U --> UC2
U --> UC3
U --> UC4
U --> UC5
U --> UC6
U --> UC7
UC2 ..> UC8 : include

@enduml
```

## 6. Database Entity Relationship Diagram

```plantuml
@startuml
entity "User" as user {
    * _id : ObjectId <<PK>>
    --
    * email : String <<unique>>
    * fullName : String
    * password : String (hashed)
    profilePic : String (URL)
    createdAt : Date
    updatedAt : Date
}

entity "Message" as message {
    * _id : ObjectId <<PK>>
    --
    * senderId : ObjectId <<FK>>
    * receiverId : ObjectId <<FK>>
    text : String
    image : String (URL)
    createdAt : Date
    updatedAt : Date
}

user ||--o{ message : "sends"
user ||--o{ message : "receives"

@enduml
```

## 7. Component Hierarchy Diagram

```plantuml
@startuml
package "React Application" {
    [App.jsx] as App
    
    package "Pages" {
        [HomePage] as Home
        [LoginPage] as Login
        [SignUpPage] as Signup
        [ProfilePage] as Profile
        [SettingsPage] as Settings
    }
    
    package "Components" {
        [Navbar] as Nav
        [Sidebar] as Side
        [ChatContainer] as Chat
        [ChatHeader] as Header
        [MessageInput] as Input
        [MessageNotification] as Notif
        [AuthImagePattern] as Auth
    }
    
    package "Store" {
        [useAuthStore] as AuthStore
        [useChatStore] as ChatStore
        [useThemeStore] as ThemeStore
    }
}

App --> Nav
App --> Home
App --> Login
App --> Signup
App --> Profile
App --> Settings

Home --> Side
Home --> Chat

Chat --> Header
Chat --> Input

Login --> Auth
Signup --> Auth

Home --> AuthStore
Home --> ChatStore
Settings --> ThemeStore

@enduml
```

## 8. Sequence Diagram - Send Message with Image

```plantuml
@startuml
actor User
participant "React UI" as UI
participant "MessageInput" as Input
participant "Cloudinary" as Cloud
participant "Backend API" as API
participant "MongoDB" as DB
participant "Socket.IO" as Socket
participant "Receiver" as Receiver

User -> UI : Select image file
UI -> Input : Handle file selection
Input -> Input : Convert to base64
User -> UI : Click send button
Input -> API : POST /api/messages/send/:id\n{text, image}
API -> Cloud : Upload image
Cloud -> API : Return image URL
API -> DB : Store message with image URL
DB -> API : Message saved
API -> Socket : Emit 'newMessage' event
Socket -> Receiver : Deliver message
API -> Input : Return success response
Input -> UI : Update chat UI
UI -> User : Display sent message

@enduml
```

## 9. Activity Diagram - User Login Process

```plantuml
@startuml
start
:User opens application;
:Navigate to Login page;
:Enter email and password;

if (Input valid?) then (yes)
    :Submit login form;
    :Send POST request to /api/auth/login;
    
    if (User exists?) then (yes)
        if (Password correct?) then (yes)
            :Generate JWT token;
            :Set HTTP-only cookie;
            :Return user data;
            :Store auth state in Zustand;
            :Establish Socket.IO connection;
            :Redirect to HomePage;
            :Load user list and messages;
            stop
        else (no)
            :Show "Invalid password" error;
        endif
    else (no)
        :Show "User not found" error;
    endif
else (no)
    :Show validation errors;
endif

:User remains on login page;
stop

@enduml
```

## 10. State Diagram - Message Status

```plantuml
@startuml
[*] --> Composing : User typing

Composing --> Sending : Click send button
Sending --> Uploading : Has image
Uploading --> Storing : Image uploaded
Sending --> Storing : No image

Storing --> Delivered : Saved to DB
Delivered --> Displayed : Socket.IO emit
Displayed --> Notified : Receiver not in chat
Displayed --> Read : Receiver in active chat

Read --> [*]
Notified --> Read : Receiver opens chat
Read --> [*]

@enduml
```

## 11. Deployment Diagram

```plantuml
@startuml
node "Client Device" {
    component "Web Browser" {
        [React App]
        [Socket.IO Client]
    }
}

node "Cloud Server" {
    component "Node.js Runtime" {
        [Express.js API]
        [Socket.IO Server]
    }
}

database "MongoDB Atlas" {
    [Users Collection]
    [Messages Collection]
}

cloud "Cloudinary CDN" {
    [Image Storage]
}

[React App] --> [Express.js API] : HTTPS
[Socket.IO Client] --> [Socket.IO Server] : WebSocket
[Express.js API] --> [Users Collection]
[Express.js API] --> [Messages Collection]
[Express.js API] --> [Image Storage]
[Image Storage] --> [React App] : Image URLs

@enduml
```

## 12. Class Diagram - Backend Models

```plantuml
@startuml
class User {
    - _id: ObjectId
    - email: String
    - fullName: String
    - password: String
    - profilePic: String
    - createdAt: Date
    - updatedAt: Date
    --
    + save(): Promise<User>
    + findById(id): Promise<User>
    + findOne(query): Promise<User>
}

class Message {
    - _id: ObjectId
    - senderId: ObjectId
    - receiverId: ObjectId
    - text: String
    - image: String
    - createdAt: Date
    - updatedAt: Date
    --
    + save(): Promise<Message>
    + find(query): Promise<Message[]>
    + findById(id): Promise<Message>
}

class AuthController {
    + signup(req, res): void
    + login(req, res): void
    + logout(req, res): void
    + updateProfile(req, res): void
    + checkAuth(req, res): void
}

class MessageController {
    + getUsersForSidebar(req, res): void
    + getMessages(req, res): void
    + sendMessage(req, res): void
}

class SocketHandler {
    - onlineUsers: Map
    + handleConnection(socket): void
    + handleDisconnect(socket): void
    + sendMessage(data): void
    + getOnlineUsers(): Array
}

AuthController --> User : uses
MessageController --> Message : uses
MessageController --> User : uses
SocketHandler --> Message : uses

@enduml
```

## 13. Activity Diagram - Real-Time Notification Flow

```plantuml
@startuml
start
:New message received via Socket.IO;

if (Message from current active chat?) then (yes)
    :Display message in chat container;
    :Auto-scroll to latest message;
    stop
else (no)
    :Display toast notification;
    :Play notification sound;
    :Increment unread badge counter;
    
    if (Browser notification permission granted?) then (yes)
        :Show browser push notification;
    endif
    
    :Update message list in Zustand store;
    
    if (User clicks notification?) then (yes)
        :Open conversation;
        :Clear unread badge;
        stop
    else (no)
        :Notification auto-dismissed;
        :Badge remains until chat opened;
        stop
    endif
endif

@enduml
```

---

## How to Use These Diagrams:

1. **Copy the PlantUML code** from each section
2. **Paste into PlantUML online editor**: http://www.plantuml.com/plantuml/uml/
3. **Or use VS Code extension**: "PlantUML" by jebbs
4. **Export as PNG/SVG** for your documentation

Each diagram visualizes different aspects of your Real-Time Chat Application and can be included in your project report!

---

**END OF PLANTUML DIAGRAMS**

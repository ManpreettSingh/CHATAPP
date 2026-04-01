# DATA FLOW DIAGRAMS - PLANTUML CODE
## Real-Time Chat Application (Proper DFD Notation)

---

## Level 0 DFD (Context Diagram)

```plantuml
@startuml
skinparam component {
    BackgroundColor White
    BorderColor Black
}

' External Entities (Squares)
rectangle "User" as User #LightGreen

' Central Process (Circle)
circle "0\n\nReal-Time\nChat\nApplication" as System #LightBlue

' Data Flows
User -right-> System : Login Credentials
User -right-> System : Messages
User -right-> System : Images
User -right-> System : Profile Updates
System -left-> User : Authentication Token
System -left-> User : Received Messages
System -left-> User : Notifications
System -left-> User : User List

@enduml
```

---

## Level 1 DFD (Major Processes)

```plantuml
@startuml
skinparam component {
    BackgroundColor White
    BorderColor Black
}

' External Entity
rectangle "User" as User #LightGreen

' Processes (Circles)
circle "1.0\n\nUser\nAuthentication" as P1 #LightBlue
circle "2.0\n\nMessage\nManagement" as P2 #LightBlue
circle "3.0\n\nUser\nManagement" as P3 #LightBlue
circle "4.0\n\nNotification\nSystem" as P4 #LightBlue
circle "5.0\n\nMedia\nManagement" as P5 #LightBlue

' Data Stores (Open Rectangles with parallel lines)
storage "D1" as D1 #LightYellow {
    [User Database]
}
storage "D2" as D2 #LightYellow {
    [Message Database]
}
storage "D3" as D3 #LightYellow {
    [Cloudinary Storage]
}

' Data Flows
User --> P1 : Credentials
P1 --> User : JWT Token
P1 --> D1 : Store User
D1 --> P1 : User Data

User --> P2 : Send Message
P2 --> D2 : Save Message
D2 --> P2 : Message History
P2 --> User : Messages

User --> P3 : Request Users
P3 --> D1 : Query Users
D1 --> P3 : User List
P3 --> User : Users & Status

User --> P5 : Upload Image
P5 --> D3 : Store Image
D3 --> P5 : Image URL
P5 --> P2 : Image URL

P2 --> P4 : New Message Event
P4 --> User : Notifications

@enduml
```

---

## Level 2 DFD - Authentication Process (1.0)

```plantuml
@startuml
skinparam component {
    BackgroundColor White
    BorderColor Black
}

' External Entity
rectangle "User" as User #LightGreen

' Sub-processes (Circles)
circle "1.1\n\nValidate\nInput" as P11 #LightBlue
circle "1.2\n\nHash\nPassword" as P12 #LightBlue
circle "1.3\n\nVerify\nCredentials" as P13 #LightBlue
circle "1.4\n\nGenerate\nJWT Token" as P14 #LightBlue

' Data Store
storage "D1" as D1 #LightYellow {
    [User Database]
}

' Signup Flow
User --> P11 : Email, Name, Password
P11 --> P12 : Valid Input
P12 --> D1 : Hashed Password
P12 --> P14 : User Created
P14 --> User : JWT Token

' Login Flow
User --> P13 : Login Credentials
P13 --> D1 : Query User
D1 --> P13 : User Data
P13 --> P14 : Verified User
P14 --> User : JWT Token & User Info

@enduml
```

---

## Level 2 DFD - Message Management (2.0)

```plantuml
@startuml
skinparam component {
    BackgroundColor White
    BorderColor Black
}

' External Entities
rectangle "Sender" as Sender #LightGreen
rectangle "Receiver" as Receiver #LightGreen

' Sub-processes (Circles)
circle "2.1\n\nValidate\nMessage" as P21 #LightBlue
circle "2.2\n\nStore\nMessage" as P22 #LightBlue
circle "2.3\n\nRetrieve\nConversation" as P23 #LightBlue
circle "2.4\n\nDeliver\nReal-Time" as P24 #LightBlue

' Data Stores
storage "D2" as D2 #LightYellow {
    [Message Database]
}
storage "D4" as D4 #LightYellow {
    [Socket Sessions]
}

' Send Message Flow
Sender --> P21 : Message Text/Image
P21 --> P22 : Valid Message
P22 --> D2 : Save Message
P22 --> P24 : Message Data
P24 --> D4 : Get Receiver Socket
D4 --> P24 : Socket ID
P24 --> Receiver : Instant Message

' Retrieve Messages Flow
Sender --> P23 : Request History
P23 --> D2 : Query Messages
D2 --> P23 : Conversation
P23 --> Sender : Message List

Receiver --> P23 : Open Chat
P23 --> D2 : Get Messages
D2 --> P23 : Messages
P23 --> Receiver : Conversation

@enduml
```

---

## Level 2 DFD - User Management (3.0)

```plantuml
@startuml
skinparam component {
    BackgroundColor White
    BorderColor Black
}

' External Entity
rectangle "User" as User #LightGreen

' Sub-processes (Circles)
circle "3.1\n\nFetch\nUser List" as P31 #LightBlue
circle "3.2\n\nTrack\nOnline Status" as P32 #LightBlue
circle "3.3\n\nUpdate\nProfile" as P33 #LightBlue

' Data Stores
storage "D1" as D1 #LightYellow {
    [User Database]
}
storage "D4" as D4 #LightYellow {
    [Socket Sessions]
}

' User List Flow
User --> P31 : Request Users
P31 --> D1 : Query All Users
D1 --> P31 : User Data
P31 --> User : User List

' Online Status Flow
User --> P32 : Connect/Disconnect
P32 --> D4 : Update Status
D4 --> P32 : Online Users
P32 --> User : Status Updates

' Profile Update Flow
User --> P33 : Update Profile
P33 --> D1 : Save Changes
D1 --> P33 : Updated Data
P33 --> User : Confirmation

@enduml
```

---

## Level 2 DFD - Notification System (4.0)

```plantuml
@startuml
skinparam component {
    BackgroundColor White
    BorderColor Black
}

' External Entity
rectangle "User" as User #LightGreen

' Sub-processes (Circles)
circle "4.1\n\nCheck\nUser Status" as P41 #LightBlue
circle "4.2\n\nSend Toast\nNotification" as P42 #LightBlue
circle "4.3\n\nSend Browser\nNotification" as P43 #LightBlue
circle "4.4\n\nPlay Audio\nAlert" as P44 #LightBlue
circle "4.5\n\nUpdate\nBadge" as P45 #LightBlue

' Data Store
storage "D4" as D4 #LightYellow {
    [Socket Sessions]
}

' Notification Flow
P41 --> D4 : Check Active Chat
D4 --> P41 : User Status
P41 --> P42 : Not Active
P41 --> P43 : Not Active
P41 --> P44 : Not Active
P41 --> P45 : Increment Count

P42 --> User : Toast Message
P43 --> User : Browser Notification
P44 --> User : Sound Alert
P45 --> User : Badge Counter

@enduml
```

---

## Level 2 DFD - Media Management (5.0)

```plantuml
@startuml
skinparam component {
    BackgroundColor White
    BorderColor Black
}

' External Entity
rectangle "User" as User #LightGreen

' Sub-processes (Circles)
circle "5.1\n\nValidate\nImage" as P51 #LightBlue
circle "5.2\n\nConvert to\nBase64" as P52 #LightBlue
circle "5.3\n\nUpload to\nCloudinary" as P53 #LightBlue
circle "5.4\n\nReturn\nImage URL" as P54 #LightBlue

' Data Stores
storage "D3" as D3 #LightYellow {
    [Cloudinary Storage]
}

' Image Upload Flow
User --> P51 : Select Image
P51 --> P52 : Valid Image
P52 --> P53 : Base64 Data
P53 --> D3 : Store Image
D3 --> P53 : Stored Successfully
P53 --> P54 : Image URL
P54 --> User : CDN URL

@enduml
```

---

## Complete Level 1 DFD (All Processes with Data Stores)

```plantuml
@startuml
title Level 1 DFD - Real-Time Chat Application

skinparam component {
    BackgroundColor White
    BorderColor Black
}

' External Entities
rectangle "User A" as UserA #LightGreen
rectangle "User B" as UserB #LightGreen

' Main Processes
circle "1.0\n\nUser\nAuthentication" as P1 #LightBlue
circle "2.0\n\nMessage\nManagement" as P2 #LightBlue
circle "3.0\n\nUser\nManagement" as P3 #LightBlue
circle "4.0\n\nNotification\nSystem" as P4 #LightBlue
circle "5.0\n\nMedia\nManagement" as P5 #LightBlue

' Data Stores
storage "D1" as D1 #LightYellow {
    [User Database]
}
storage "D2" as D2 #LightYellow {
    [Message Database]
}
storage "D3" as D3 #LightYellow {
    [Cloudinary Storage]
}
storage "D4" as D4 #LightYellow {
    [Socket Sessions]
}

' Authentication Flows
UserA --> P1 : Login/Signup
P1 <--> D1 : User Data
P1 --> UserA : JWT Token

' User Management Flows
UserA --> P3 : Request User List
P3 <--> D1 : Query Users
P3 --> UserA : User List & Status
P3 <--> D4 : Online Status

' Media Management Flows
UserA --> P5 : Upload Image
P5 --> D3 : Store Image
D3 --> P5 : Image URL
P5 --> P2 : Image URL

' Messaging Flows
UserA --> P2 : Send Message
P2 --> D2 : Store Message
D2 --> P2 : Message Data
P2 --> D4 : Get Receiver Socket
P2 --> UserB : Deliver Message

' Notification Flows
P2 --> P4 : New Message Event
P4 --> D4 : Check Status
P4 --> UserB : Notifications

' Retrieve Messages
UserB --> P2 : Get Conversation
P2 <--> D2 : Query Messages
P2 --> UserB : Message History

@enduml
```

---

## How to Use:

1. **Copy any PlantUML code block** from above
2. **Paste into PlantUML editor**: http://www.plantuml.com/plantuml/uml/
3. **Generate the diagram** as PNG or SVG
4. **Add to your PDF/Document**

## DFD Levels Explained:

- **Level 0 (Context)**: Shows the system as a single process with external entities
- **Level 1**: Breaks down into major processes (Authentication, Messaging, User Management, etc.)
- **Level 2**: Details each major process into sub-processes
- **Complete DFD**: Shows all processes and data flows in one comprehensive diagram

---

**END OF DATA FLOW DIAGRAMS**

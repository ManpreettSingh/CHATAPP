# MongoDB Implementation (Short Note)

This project is a chat app. I am using MongoDB to store users and messages in a flexible way.

## 1. Introduction to MongoDB
- MongoDB is a NoSQL database.
- It stores data as JSON-like documents.
- This is good for chat apps because message data can grow and change easily.
- Main collections in my project:
  - `users`
  - `messages`

## 2. CRUD Operations
I use basic CRUD in backend APIs:
- **Create**: save new users and new messages.
- **Read**: load chat messages between two users.
- **Update**: update profile photo and message status fields.
- **Delete**: can be added as soft delete (for message/conversation history).

## 3. Nested Documents
I can store related fields in one document using nesting.
Example:
- In `users`: `settings.notifications.email`, `settings.theme`
- In `messages`: `delivery.sentAt`, `delivery.readAt`

This keeps related data together and makes reads faster for app screens.

## 4. Update Operators
I use MongoDB update operators for efficient updates:
- `$set` -> update specific fields (profile/settings)
- `$inc` -> increase unread count
- `$push` -> add item in array (reaction/edit history)
- `$pull` -> remove item from array
- `$addToSet` -> add unique value only (avoid duplicates)

These operators avoid rewriting full documents.

## 5. Arrays in MongoDB
Arrays help store repeating values.
Examples:
- In user document: `blockedUsers[]`, `deviceTokens[]`
- In message document: `reactions[]`, `attachments[]`

Useful queries:
- `$elemMatch` for matching objects inside arrays
- `$in` for checking multiple values

## 6. Indexing
Indexing improves speed for large chat data.

Indexes added in this project:

**`message.model.js`**
```js
// Compound index: speeds up fetching messages between two users sorted by time
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

// Text index: enables full-text search on message content
messageSchema.index({ text: "text" });
```

**`user.model.js`**
```js
// Text index: enables searching users by name in the sidebar
userSchema.index({ fullName: "text" });
```

Without indexes, MongoDB scans many documents. With indexes, query time is much faster.

## 7. Aggregation (Implemented)
Aggregation creates summary reports from many message documents using a pipeline of stages.

### API Endpoint
```
GET /api/messages/stats/:userId?days=7
```
Returns analytics for a conversation over the last N days (default 7).

### Pipeline used in `getChatStats` controller

```js
Message.aggregate([
    // Stage 1: $match – filter messages for this conversation in the date range
    { $match: { $or: [...], createdAt: { $gte: since } } },

    // Stage 2: $facet – run multiple sub-pipelines in one query
    {
        $facet: {
            // Sub-pipeline A: messages grouped by sender (who sent more)
            senderSplit: [
                { $group: { _id: "$senderId", totalMessages: { $sum: 1 }, ... } }
            ],
            // Sub-pipeline B: daily message count trend, sorted by date
            dailyTrend: [
                { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ],
            // Sub-pipeline C: grand totals
            totals: [
                { $group: { _id: null, totalMessages: { $sum: 1 }, textMessages: { $sum: ... }, imageMessages: { $sum: ... } } }
            ]
        }
    }
])
```

**Stages used:**
- `$match` → filter by conversation participants and date range
- `$group` → count total, text, and image messages per sender and per day
- `$sort` → sort daily data chronologically
- `$facet` → return multiple reports (senderSplit, dailyTrend, totals) in one query

**Why aggregation is useful:**
- Gives analytics, not just raw CRUD data.
- Faster and cleaner than doing multiple queries + loops in Node.js.
- Demonstrates data engineering concepts (pipeline, grouping, faceting) in a real project.

## 8. Text Search (Implemented)
Using the text index on `messages.text`, users can search for keywords in a conversation.

### API Endpoint
```
GET /api/messages/search/:userId?q=keyword
```

### Query used in `searchMessages` controller
```js
Message.find({
    $and: [
        { $or: [{ senderId: myId, receiverId: otherUserId }, ...] },
        { $text: { $search: q } }
    ]
}).sort({ createdAt: -1 })
```

This feature demonstrates:
- Text search query with `$text` / `$search`
- Text indexing in action
- Real-world MongoDB query optimization

## Conclusion
This project is not only a chat app UI. It demonstrates core MongoDB concepts:
- document model
- CRUD
- nested documents
- update operators
- arrays
- indexing (compound + text) for query optimization
- aggregation pipeline for chat analytics
- full-text search using text indexes


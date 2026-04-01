import React from 'react';
import { MessageCircle, X } from 'lucide-react';

const MessageNotification = ({ sender, message, onClose, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="flex items-start gap-3 p-4 bg-base-200 rounded-lg shadow-lg border border-base-300 cursor-pointer hover:bg-base-300 transition-all max-w-sm"
    >
      <div className="avatar">
        <div className="w-10 h-10 rounded-full border">
          <img src={sender.profilePic || "/avatar.png"} alt={sender.fullName} />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-sm truncate">{sender.fullName}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="btn btn-ghost btn-xs btn-circle"
          >
            <X size={14} />
          </button>
        </div>
        <p className="text-xs text-base-content/70 truncate mt-1">
          {message.text ? message.text : message.image ? "📷 Sent an image" : "New message"}
        </p>
      </div>
      
      <div className="text-primary">
        <MessageCircle size={20} />
      </div>
    </div>
  );
};

export default MessageNotification;

import { format, isToday, isYesterday, isSameYear, parseISO } from "date-fns";
import uuid from "react-native-uuid"
import { CHAT_MESSAGE_PROXY } from "../config/apiUrls";
import { socketConstants, socketMessageTypes, stringConstants } from "../constants/StringConstants";

export const getFormattedDividerDate = (dateString) => {
    const date = parseISO(dateString);
    const today = new Date();
  
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
  
    return isSameYear(today, date)
      ? format(date, "EEEE, d MMM ")
      : format(date, "EEEE, d MMM yyyy");
  };

  export const setupDynamicPlaceholder = (
    placeholders,
    updatePlaceholder,
    intervalTime = 3000,
    isLoading = false,
    reply = false
  ) => {
    // If loading, set static placeholder and don't start interval
    if (isLoading || reply) {
      updatePlaceholder("Type here");
      return () => {}; // Return empty cleanup function
    }
  
    // Handle case where placeholders might be undefined or empty
    if (!placeholders || placeholders.length === 0) {
      updatePlaceholder("Type here");
      return () => {};
    }
  
    // Normal dynamic placeholder logic
    let index = 0;
    updatePlaceholder(placeholders[index]?.name || "Type here");
    index++;
  
    const interval = setInterval(() => {
      updatePlaceholder(placeholders[index]?.name || "Type here");
      index = (index + 1) % placeholders.length;
    }, intervalTime);
  
    return () => clearInterval(interval);
  };

  export const extractUrl = (text) =>{
    const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex) || [];
  
  // Remove trailing punctuation like period, comma, etc.
  return matches.map(url => url.replace(/[.,!?;]$/, ''));
  }

  export function splitMarkdownIntoTableAndText(markdown) {
    if (typeof markdown !== 'string') {
     return { tablePart: '', textPart: '' }
   }
    const lines = markdown?.trim().split('\n');
    const tableLines = [];
    const textLines = [];
  
    let inTable = false;
  
    for (const line of lines) {
      if (line.trim().startsWith('|')) {
        tableLines.push(line);
        inTable = true;
      } else if (inTable && line.trim() === '') {
        // End of table section when an empty line is encountered after table lines
        inTable = false;
      } else if (inTable && !line.trim().startsWith('|')) {
        // Edge case: Table not well-formed; stop table block
        inTable = false;
        textLines.push(line);
      } else {
        textLines.push(line);
      }
    }
    return {
      tablePart: tableLines?.join('\n').trim(),
      textPart: textLines?.join('\n').trim()
    };
  }
   export const generateUniqueId = () => {
    return uuid.v4();
  };
  
    export const formatBotMessage = (data) => {
  return {
    messageId: data?.messageId,
    messageTo: stringConstants.user,
    dateTime: new Date().toISOString(),
    activity: null,
    replyId: null,
    conversationEnded: data?.conversationEnded,
    message: {
      text: data.entry?.message?.text,
      table: data.entry?.message?.table,
      botOption: data.entry?.message?.botOption,
      options: data.entry?.message?.options,
    },
    media: data?.entry?.message?.media,
  };
};

export const formatUserMessage = (text, reconfigApiResponse, messageType,replyMessageId = null,replyIndex=0) => {
  const messageId = generateUniqueId();
  return {
     message: {
      messageId,
      messageTo: stringConstants.bot,
      dateTime: new Date().toISOString(),
      activity: null,
      status: "SENT",
      replyId: replyMessageId,
      replyIndex: replyIndex,
      message: {
        text: text.trim(),
        botOption: false,
        options: [],
      },
      media: {
        video: [],
        image: [],
         document: [],
      },
    },
    socketPayload: {
      action: CHAT_MESSAGE_PROXY,
      message: {
      emailId: reconfigApiResponse?.userInfo?.email,
      userId: reconfigApiResponse?.userInfo?.agentId,
      messageId,
      platform: reconfigApiResponse?.theme?.platform,
      sendType: "MESSAGE",
      messageTo: stringConstants.botCaps,
      messageType: messageType || socketMessageTypes.text,
      text: text.trim(),
      replyToMessageId: replyMessageId,
      }
    }
   };
};

// utils/messageFormatter.js

export const formatHistoryMessage = (apiMessage) => {
  const isBot = apiMessage.messageTo === stringConstants.botCaps;
   let activity = null;
  if (apiMessage.emoji && apiMessage.action) {
    if (apiMessage.emoji === stringConstants.thumbsUpEmoji) {
      activity = apiMessage.action === socketConstants.selected ? stringConstants.like : null;
    }
    else if(apiMessage.emoji === stringConstants.thumbsDownEmoji) {
      activity = apiMessage.action === socketConstants.selected ? stringConstants.dislike : null;
    }
  }
  return {
    messageId: apiMessage.messageId,
    messageTo: isBot ? stringConstants.bot : stringConstants.user,
    dateTime: new Date(apiMessage.createdAt * 1000).toISOString(),
    activity: activity, 
    replyId: apiMessage.replyToMessageId, 
    conversationEnded: false, 
    status: socketConstants.read,
    message: {
      text: apiMessage.text,
      table: null, 
      botOption: apiMessage.botOptions, 
      options: apiMessage.options || [],
    },
    media: apiMessage.media || { 
      video: [],
      image: [],
      document: [],
    },
  };
};
 export const getFileExtension = (url) => {
      const cleanUrl = url.split("?")[0];
      const parts = cleanUrl.split(".");
      if (parts.length > 1) {
        return parts.pop().toLowerCase();
      }
      return null;
    };
 export const isVideoFile = (url) => {
    const ext = getFileExtension(url);
    const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm", "3gp"];
    return ext ? videoExtensions.includes(ext) : false;
  };

  export const getMimeType = (extension) => {
  const mimeTypes = {
    mp4: "video/mp4",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png"
  };
  return mimeTypes[extension];
};

 





 
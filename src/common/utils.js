import { format, isToday, isYesterday, isSameYear, parseISO } from "date-fns";
import uuid from "react-native-uuid"


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
    messageTo: "user",
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

export const formatUserMessage = (text, reconfigApiResponse, messageType,token,replyMessageId = null,replyIndex=0) => {
  const messageId = generateUniqueId();
  return {
     message: {
      messageId,
      messageTo: "bot",
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
      action: "api/chatbot/message-proxy",
      token:token,
      message: {
      emailId: reconfigApiResponse?.userInfo?.email,
      userId: reconfigApiResponse?.userInfo?.agentId,
      messageId,
      platform: reconfigApiResponse?.theme?.platform,
      sendType: "MESSAGE",
      messageTo: "BOT",
      messageType: messageType || "TEXT",
      text: text.trim(),
      replyToMessageId: replyMessageId,
      }
    }
   };
};

// utils/messageFormatter.js

export const formatHistoryMessage = (apiMessage) => {
  const isBot = apiMessage.messageTo === "BOT";
  
  return {
    messageId: apiMessage.messageId,
    messageTo: isBot ? "bot" : "user",
    dateTime: new Date(apiMessage.createdAt * 1000).toISOString(),
    activity: apiMessage.action==="SELECTED" ? "like" : "dislike", 
    replyId: apiMessage.replyToMessageId, 
    conversationEnded: false, 
    status: apiMessage.status || "RECEIVED",
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

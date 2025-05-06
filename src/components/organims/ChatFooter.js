import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import DynamicTextInput from "../atoms/DynamicTextInput";
import Button from "../atoms/Button";
import ReplyMessage from "../atoms/ReplyMessage";
import CopyTextClipboard from "../atoms/CopyTextClipboard";
import Dropdown from "../atoms/Dropdown";
import { useDispatch, useSelector } from "react-redux";
// import * as Clipboard from "expo-clipboard";
import { addMessage } from "../../store/reducers/chatSlice";
import {  hideLoader } from "../../store/reducers/loaderSlice";
import {  setupDynamicPlaceholder } from "../../common/utils";
import { borderWidth, spacing } from "../../constants/Dimensions";
import PropTypes from "prop-types";
import uuid from 'react-native-uuid';



export const ChatFooter = ({
  copied,
  setCopied,
  dropDownType,
  messageObjectId,
  setMessageObjectId,
  replyMessageId,
  setReplyMessageId,
  navigationPage,
  setnavigationPage,
  addNewMessage,
  setReply,
  reply,
  handleReplyClose,
  handleReplyMessage,
  reconfigApiResponse,
  socket,
  messages,
  copyToClipboard,
}) => {
  ChatFooter.propTypes = {
    copied: PropTypes.bool.isRequired,
    setCopied: PropTypes.func.isRequired,
    dropDownType: PropTypes.string.isRequired,
    messageObjectId: PropTypes.string,
    setMessageObjectId: PropTypes.func.isRequired,
    setReplyMessageId: PropTypes.func.isRequired,
    replyMessageId: PropTypes.string,
    navigationPage: PropTypes.string.isRequired,
    setnavigationPage: PropTypes.func.isRequired,
    addNewMessage: PropTypes.func.isRequired,
    setReply: PropTypes.func.isRequired,
    reply: PropTypes.bool.isRequired,
    handleReplyClose: PropTypes.func.isRequired,
    handleReplyMessage: PropTypes.func.isRequired,
    reconfigApiResponse: PropTypes.object.isRequired,
    socket: PropTypes.object.isRequired,
    messages: PropTypes.array,
    copyToClipboard: PropTypes.func,
  };
  const dispatch = useDispatch();
  const [value, setValue] = useState("");
  const [count, setCount] = useState(0);
  const [dynamicPlaceholder, setDynamicPlaceholder] =
    useState("Type a message...");
  const isLoading = useSelector((state) => state.loader.isLoading);

  const isBottomSheetOpen = useSelector(
    (state) => state.bottomSheet.isBottomSheetOpen
  );
  const questionsList = [
    `Hi Shreya, \ud83d\ude0a\n\n
  I understand that logging into Disha is crucial for accessing various employee services. Here’s a step-by-step guide to help you log in:
  1) Open Google Chrome: Ensure you are using Google Chrome for the best experience.
  2) Login to e-cube: Go to the internal employee platform, Ecube, using the URL: Ecube Login
  3) Quick Links: Once logged in, click on “Quick Links” located at the right corner of the page.
  4) Select Disha: From the drop-down menu, click on “Disha”.

  You will need your SSO ID and password to log in. If you encounter any issues with your password, you can reset it using the “Forgot Password” option on the Disha login page. Remember, the date of birth needed to reset the password should match the one on your PAN card.
  If you need further assistance, feel free to reach out to: [trishita.rastogi@maxlifeinsurance.com](mailto:trishita.rastogi@maxlifeinsurance.com).
  `,
    `Hi Shreya, \ud83d\ude0a\n\n

I understand that logging into Disha is crucial for accessing various employee services. Here’s a step-by-step guide to help you log in:

1. **Open Google Chrome:** Ensure you are using Google Chrome for the best experience.  
2. **Login to e-cube:** Go to the internal employee platform, Ecube, using this link: [Ecube Login](https://your-ecube-login-url.com)  
3. **Quick Links:** Once logged in, click on “Quick Links” located at the right corner of the page.  
4. **Select Disha:** From the drop-down menu, click on “Disha”.

You will need your SSO ID and password to log in. If you encounter any issues with your password, you can reset it using the “Forgot Password” option on the Disha login page. Remember, the date of birth needed to reset the password should match the one on your PAN card.

If you need further assistance, feel free to reach out to [trishita.rastogi@maxlifeinsurance.com](mailto:trishita.rastogi@maxlifeinsurance.com).
`,
    "\n  Hello and Welcome! \ud83d\ude0a\n\n  I am ELY, your Virtual HR, created by Max Life Insurance to assist you with your HR and company policy queries. I'm here to be your safe space for feedback and any issues you might face while navigating your professional journey.\n\n  I can assist you in various ways, including:\n  - **Answering HR and company policy-related queries**\n  - **Gathering your feedback about your experience here**\n  - **Providing a safe space for raising any concerns**\n  - **Guiding you through work-related stress**\n\n  Here are some sample questions you can ask to engage with me:\n  1. **Tell me about the working hour-related policy in our company.**\n  2. **What kind of medical insurance options do I have here?**\n  3. **I have been facing issues with my work-life balance. How can I manage it better?**\n  4. **How many types of leave can I avail in a calendar year?**\n\n  Feel free to converse with me in your preferred language. You are now ready to engage in a conversation with me regarding your questions and concerns. The more specific and context-rich your questions are, the better I can assist you.\n\n  Let's get started! \ud83d\ude0a\n ",
    `Hi R, \ud83d\ude0a\n\nI understand that you are interested in learning about the promotion process at Max Life Insurance. Let me provide you with a concise overview of the promotion policy and guidelines.\n\n**Promotion Policy Overview:**\n\n- **Objective:** The policy aims to recognize individual merit and consistent contributions, building a talent pool of employees at all levels to ensure that vacancies are staffed with competent employees.\n\n- **Eligibility Criteria:**\n  - **Role Vacancy:** There must be an existing vacancy for the promotion.\n  - **Job Evaluation:** For roles in Band 3 and above, a job evaluation as per the Hay methodology is required.\n  - **Performance Rating:** A minimum rating of G3 (Meeting Expectations) and V3 (Consistent) is required. For gate-based promotions, the minimum value rating should be V3.\n  - **Tenure in Current Band:** The minimum tenure needed to be eligible for a promotion is:\n    - Band 3 & Above: 24 months\n    - Band 4B & Below: 18 months\n\n- **Additional Guidelines:**\n  - Employees rated V1 (Role-Model) for two consecutive years are eligible for a 6-month relaxation in the minimum tenure requirement for promotion to the next band (applicable for movements into Band 3B and below).\n  - Promotions are subject to performance, potential, readiness, business need, and availability of the role at that level.\n  - Gate-based promotions for identified revenue-generating roles follow specific business vectors/tenure eligibility as defined in the channel-wise performance management and promotion guidelines/criteria.\n\n- **Disqualifiers:**\n  - Any disciplinary action taken on an employee under the Employee Disciplinary Action Policy (EDAP) may affect the
  minimum tenure clause for promotion.\n\n- **Process:**\n  - Promotions for all roles are done as per the performance cycle.\n  - For gate-based promotions in sales roles, monthly/quarterly/annual promotion cycles are followed as per the channel performance management and promotion guidelines.\n\nIf you have any specific questions or need further assistance, feel free to reach out to M L at m.l@maxlifeinsurance.com or contact the HR department at hr4u@maxlifeinsurance.com.\n\nKeep up the great work, and I hope this information helps you understand the promotion process better. If you need any more details or have other queries, don't hesitate to ask.\n\n`,
    "Max Life Insurance offers various plans such as term insurance, ULIPs, endowment plans, child plans, retirement plans, and money-back policies.",
    "You can check your policy status by logging into the Max Life customer portal, using the mobile app, or calling customer support at their toll-free number.",
    "To claim your Max Life Insurance policy, submit the required documents online or visit the nearest branch. The company will process the claim and settle it within the stipulated time.",
    "Yes, you can change your nominee by submitting a 'Nomination Change Form' along with the required documents at a Max Life branch or via the online portal.",
    "Max Life offers multiple premium payment options, including monthly, quarterly, half-yearly, and yearly payments. You can pay via online banking, credit/debit cards, auto-debit, and UPI.",
    "Yes, Max Life Insurance policies provide tax benefits under sections 80C and 10(10D) of the Income Tax Act, subject to applicable conditions.",
    "You can download your Max Life Insurance policy document by logging into the official website or mobile app under the 'My Policy' section.",
    "If you miss a premium payment, you get a grace period (typically 30 days for annual/quarterly modes and 15 days for monthly mode) to pay. If unpaid after the grace period, the policy may lapse.",
    "Yes, you can surrender your policy before maturity. However, surrender charges may apply depending on the policy type and tenure.",
    "The free-look period is usually 15 to 30 days from the policy purchase date. During this time, you can review your policy and cancel it if needed for a full refund, subject to deductions.",
    "You can update your contact details through the Max Life Insurance customer portal, mobile app, or by visiting the nearest branch with identity proof.",
    "Max Life offers riders like accidental death benefit, critical illness cover, waiver of premium, and disability benefits that can be added to your policy for enhanced coverage.",
    "Yes, Max Life Insurance policies can include coverage for accidental death and critical illnesses if you opt for specific riders.",
    "Claim settlement time varies based on documentation. However, Max Life aims to settle claims within 30 days for straightforward cases and 10 working days for express claims.",
    "You can contact Max Life Insurance customer support via their toll-free number, email, or by visiting the nearest branch. Their website also has a chatbot for instant support.",
    "You're welcome! \ud83d\ude0a Let me know if you have any other questions related to Max Life Insurance.",
  ];

  useEffect(() => {
    const clearPlaceholderInterval = setupDynamicPlaceholder(
      reconfigApiResponse.placeHolders || [],
      setDynamicPlaceholder,
      3000,
      isLoading // Pass loading state
    );

    return () => clearPlaceholderInterval();
  }, [reconfigApiResponse, isLoading]);
  const handleChange = (text) => {
    setValue(text);
  };

  const handleSend = async () => {
    if (navigationPage == "COACH") if (!value.trim() || isLoading) return;
    if (navigationPage === "COACH") setnavigationPage("AGENDA");
    const messageId = uuid.v4();
    try {
      setReply(false);
      const userMessage = {
        messageId: messageId,
        messageTo: "bot",
        dateTime: new Date().toISOString(),
        activity: null,
        status: "SENT",
        replyId: replyMessageId,
        message: {
          text: value.trim(),
          botOption: false,
          options: [],
        },
        media: {
          video: [],
          image: [],
          document: [],
        },
      };
      const message = {
        emailId: reconfigApiResponse?.userInfo?.email,
        userId:  reconfigApiResponse?.userInfo?.agentId,
        messageId: messageId,
        platform: "MSPACE",
        sendType: "MESSAGE",
        messageTo: "BOT",
        messageType: "TEXT",
        text: value.trim(),
        replyToMessageId: replyMessageId,
      };
      dispatch(addMessage(userMessage));
      setValue("");
      console.log("sent message", message);
      socket.emit("user_message", message);
      addNewMessage();
      setReply(false);
      setReplyMessageId(null);
    } catch (error) {
      console.error("Error in message handling:", error);
      dispatch(hideLoader());
    }
  };

  const getReplyMessage = () => {
    let replyMessageObject = messages.find(
      (msg) => msg?.messageId === replyMessageId
    );
    return {
      text: replyMessageObject?.message?.text || replyMessageObject?.text || "",
      messageTo: replyMessageObject?.messageTo,
      media: replyMessageObject?.media || []
    };
  };
  let data={};
  return (
    <View>
      {copied && <CopyTextClipboard reply={reply}/>}
      <View style={styles.containerHead}>
      {reply && (
         data =getReplyMessage(),
        <ReplyMessage
          replyFrom={
           data.messageTo.toLowerCase() === "bot" ? "YOU" : "BOT"
          }
          replyMessage={data.text}
          media={data.media}
          reply={reply}
          handleClose={handleReplyClose}
        />
      )}
      <View style={styles.container} >
        <View style={styles.inputContainer}>
          <DynamicTextInput
            value={value}
            onChange={handleChange}
            placeholder={dynamicPlaceholder}
            rows={3}
            fullWidth
            disabled={isLoading}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            isEnabled={!!value.trim() && !isLoading}
            onClick={handleSend}
          />
        </View>
      </View>
      </View>
      {isBottomSheetOpen && (
        <Dropdown
          isOpen={isBottomSheetOpen}
          dropDownType={dropDownType}
          copyToClipboard={copyToClipboard}
          handleReplyMessage={handleReplyMessage}
          testID="dropdown-component"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  containerHead:{
    backgroundColor: "#F4F6FA",
    borderTopWidth: borderWidth.borderWidth1,
    borderTopColor: "#e0e0e0",
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.space_10,
    paddingVertical: spacing.space_base,
  },
  inputContainer: {
    flex: 1,
    marginRight: spacing.space_base,
  },
  buttonContainer: {
    justifyContent: "flex-end",
    paddingBottom: spacing.space_s2,
  },
});

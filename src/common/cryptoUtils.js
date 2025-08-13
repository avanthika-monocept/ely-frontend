import CryptoJS from "crypto-js";
import { ENCRYPT_KEY_VALUE, ENCRYPT_IV_VALUE_ } from "../constants/constants";


const encrypt = (data1, keyValue, ivValue) => {
  const key = CryptoJS.enc.Latin1.parse(keyValue);
  const iv = CryptoJS.enc.Latin1.parse(ivValue);

  const data = JSON.stringify(data1);
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.ZeroPadding,
  });

  const encryptedString = encrypted.toString();
  return encryptedString;
};

const decrypt = (encrypted, keyValue, ivValue) => {
  const key = CryptoJS.enc.Latin1.parse(keyValue);
  const iv = CryptoJS.enc.Latin1.parse(ivValue);
  const decrypted = CryptoJS.AES.decrypt(encrypted.trim(), key, {
    iv: iv,
    padding: CryptoJS.pad.ZeroPadding,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
};

export const encNewPayload = (rawPayload) => {
  const newPayload = {
    payload: encrypt(rawPayload, ENCRYPT_KEY_VALUE, ENCRYPT_IV_VALUE_),
  };
  return newPayload;
};

export const decResPayload = (resPayload) => {
  let decryptedRes = decrypt(resPayload, ENCRYPT_KEY_VALUE, ENCRYPT_IV_VALUE_);
  // Trim non-printable characters from the end
  decryptedRes = decryptedRes.replace(/[^\x20-\x7E]+$/, "");
  const decryptedResponseObject = JSON.parse(decryptedRes);
  return decryptedResponseObject;
};
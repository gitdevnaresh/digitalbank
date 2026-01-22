import { useCallback } from 'react';
import CryptoJS from "crypto-js";
import { useSelector } from 'react-redux';
 
const useEncryptDecrypt = (customSecretKey?:string) => {
  const defaultSecretKey = useSelector((state:any) => state.userReducer.userDetails?.clientSecretKey); // Redux Secret Key
 
  const getSecretKey = useCallback(() => {
    return customSecretKey || defaultSecretKey || '';
  }, [customSecretKey, defaultSecretKey]);
 
  const encryptAES = useCallback((plainText:string) => {
    try {
      const secretKey = getSecretKey().replace(/ |-/g, "");
      const iv = CryptoJS.enc.Utf8.parse("\0".repeat(16));
      const encrypted = CryptoJS.AES.encrypt(plainText||'', CryptoJS?.enc?.Utf8?.parse(secretKey||''), {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: iv,
      });
      return encrypted.toString();
    } catch (error) {
      console.warn("Encryption failed:", error);
      return plainText; // Return original text if encryption fails
    }
  }, [getSecretKey]);
 
  const decryptAES = useCallback((cipherText:string) => {
    try {
      if (!cipherText) {
        return cipherText;
      }
      
      const secretKey = getSecretKey().replace(/ |-/g, "");   
      const iv = CryptoJS?.enc?.Utf8?.parse("\0".repeat(16));
      const bytes = CryptoJS?.AES?.decrypt(cipherText||'', CryptoJS?.enc?.Utf8?.parse(secretKey||''), {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: iv,
      });
      
      // Check if decryption was successful by verifying the result
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      
      // If decryption results in empty string or invalid UTF-8, return original cipher text
      if (!decryptedString || decryptedString === '') {
        console.warn("Decryption resulted in empty string, returning original cipher text");
        return cipherText;
      }
      
      return decryptedString;
    } catch (error) {
      console.warn("Decryption failed:", error);
      // Return original cipher text instead of throwing error to prevent crash
      return cipherText;
    }
  }, [getSecretKey]);
 
  return { encryptAES, decryptAES };
};
 
export default useEncryptDecrypt;
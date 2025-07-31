import apiCall from '../axiosRequest';
import { Buffer } from 'buffer';
import { COGNITO_BASE_URL,CLIENT_SECRET, CLIENT_ID } from '../../constants/constants';



export const getCognitoToken = async () => {
  try {
    const credentials = `${CLIENT_ID}:${CLIENT_SECRET}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');

    const response = await apiCall({
      baseURL: COGNITO_BASE_URL,
      url: '/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${base64Credentials}`
      },
      data: 'grant_type=client_credentials&scope=admin/write%20admin/read'
    });

    return response;
  } catch (error) {
    console.error('Failed to get Cognito token:', error);
    throw error;
  }
};
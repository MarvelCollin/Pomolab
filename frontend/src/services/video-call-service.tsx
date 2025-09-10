import { SignJWT } from 'jose';

const validateEnvironmentVariables = () => {
  const apiKey = import.meta.env.VITE_VIDEOSDK_API_KEY;
  const secretKey = import.meta.env.VITE_VIDEOSDK_SECRET_KEY;
  
  if (!apiKey || !secretKey) {
    throw new Error('VideoSDK API Key and Secret Key must be set in environment variables (VITE_VIDEOSDK_API_KEY and VITE_VIDEOSDK_SECRET_KEY)');
  }
  
  return { apiKey, secretKey };
};

export const generateApiToken = async () => {
  try {
    const { apiKey, secretKey } = validateEnvironmentVariables();

    const secret = new TextEncoder().encode(secretKey);
    
    const payload = {
      apikey: apiKey,
      permissions: ['allow_join'],
      version: 2,
      roles: ['crawler']
    };

    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('2h')
      .sign(secret);

    return jwt;
  } catch (error) {
    console.error('Error generating API JWT token:', error);
    throw new Error('Failed to generate API authentication token');
  }
};

export const generateMeetingToken = async () => {
  try {
    const { apiKey, secretKey } = validateEnvironmentVariables();

    const secret = new TextEncoder().encode(secretKey);
    
    const payload = {
      apikey: apiKey,
      permissions: ['allow_join'],
      version: 2,
      roles: ['rtc']
    };

    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('2h')
      .sign(secret);

    return jwt;
  } catch (error) {
    console.error('Error generating meeting JWT token:', error);
    throw new Error('Failed to generate meeting authentication token');
  }
};

export const createMeeting = async () => {
  try {
    const apiToken = await generateApiToken();
    
    const response = await fetch("https://api.videosdk.live/v2/rooms", {
      method: "POST",
      headers: {
        authorization: apiToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create meeting: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const { roomId } = await response.json();
    const meetingToken = await generateMeetingToken();
    
    return { roomId, token: meetingToken };
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};
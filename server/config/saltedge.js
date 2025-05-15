import axios from 'axios';

// Salt Edge API configuration
const saltEdgeClient = axios.create({
  baseURL: 'https://www.saltedge.com/api/v5',
  headers: {
    'App-id': process.env.SALT_EDGE_APP_ID,
    'Secret': process.env.SALT_EDGE_SECRET,
    'Content-Type': 'application/json'
  }
});

export default saltEdgeClient;
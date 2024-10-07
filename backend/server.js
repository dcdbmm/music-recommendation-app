require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // This allows the server to parse incoming JSON requests

// Predefined moods with corresponding features
const moodFeatureMapping = {
    'happy': { seedGenre: 'pop', valence: 0.8, energy: 0.7 },
    'chill': { seedGenre: 'chill', valence: 0.5, energy: 0.4 },
    'party': { seedGenre: 'dance', valence: 0.9, energy: 0.9 },
    'ambient': { seedGenre: 'ambient', valence: 0.4, energy: 0.3 },
    'classical': { seedGenre: 'classical', valence: 0.5, energy: 0.2, acousticness: 0.9 },
    'jazz': { seedGenre: 'jazz', valence: 0.6, energy: 0.5, acousticness: 0.7 },
    'hip-hop': { seedGenre: 'hip-hop', valence: 0.7, energy: 0.8 },
    'pop': { seedGenre: 'pop', valence: 0.7, energy: 0.8 },
    'rock': { seedGenre: 'rock', valence: 0.6, energy: 0.8 },
    'blues': { seedGenre: 'blues', valence: 0.4, energy: 0.5, acousticness: 0.8 },
    'soft': { seedGenre: 'acoustic', valence: 0.6, energy: 0.3, acousticness: 0.8 },
    'sad': { seedGenre: 'sad', valence: 0.2, energy: 0.3, acousticness: 0.6 },
    'heartbreak': { seedGenre: 'soul', valence: 0.3, energy: 0.4, acousticness: 0.5 },
    'empty': { seedGenre: 'blues', valence: 0.1, energy: 0.2, acousticness: 0.7 }
};

// Function to get Spotify Access Token
async function getSpotifyAccessToken() {
    const url = 'https://accounts.spotify.com/api/token';
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
    };
    const data = 'grant_type=client_credentials';

    try {
        const response = await axios.post(url, data, { headers });
        console.log('Access Token Response:', response.data);
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching Spotify access token:', error.response ? error.response.data : error.message);
        return null;
    }
}

// Route to get mood-based recommendations
app.get('/recommend/mood/:mood', async (req, res) => {
    const mood = req.params.mood.toLowerCase();
    const accessToken = await getSpotifyAccessToken();

    if (!accessToken) {
        return res.status(500).send('Unable to get Spotify access token');
    }

    // Get the feature values for the selected mood
    const features = moodFeatureMapping[mood] || {};
    const seedGenre = features.seedGenre || 'pop'; // Default to 'pop' if no genre is found

    // Introduce slight randomization to valence and energy to make recommendations vary
    const valence = (features.valence || 0.5) + (Math.random() * 0.2 - 0.1); // Randomize between -0.1 and +0.1
    const energy = (features.energy || 0.5) + (Math.random() * 0.2 - 0.1);   // Randomize between -0.1 and +0.1
    const acousticness = features.acousticness !== undefined
        ? (features.acousticness + (Math.random() * 0.2 - 0.1)) // Randomize if acousticness is available
        : undefined;

    // Add a random seed track or artist to mix things up
    const seedTracks = [
        '4NHQUGzhtTLFvgF5SZesLK', // Example track IDs, replace with actual track IDs
        '6rqhFgbbKwnb9MLmUQDhG6',
        '3n3Ppam7vgaVa1iaRUc9Lp'
    ];
    const randomTrack = seedTracks[Math.floor(Math.random() * seedTracks.length)];


    // Construct the API URL with the features
    let url = `https://api.spotify.com/v1/recommendations?seed_genres=${seedGenre}&seed_tracks=${randomTrack}&limit=10&target_valence=${valence}&target_energy=${energy}`;

    if (acousticness !== undefined) {
        url += `&target_acousticness=${acousticness}`;
    }

    const headers = {
        'Authorization': `Bearer ${accessToken}`
    };

    try {
        const response = await axios.get(url, { headers });
        // Filter and format the data
        const formattedTracks = response.data.tracks.map(track => ({
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            albumCover: track.album.images[0]?.url,  // Get the first image (highest resolution)
            spotifyUrl: track.external_urls.spotify,
            previewUrl: track.preview_url  // May be null if not available
        }));
        res.json(formattedTracks);  // Send only the necessary fields
    } catch (error) {
        console.error('Error fetching recommendations:', error.message);
        res.status(500).send('Error fetching recommendations');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

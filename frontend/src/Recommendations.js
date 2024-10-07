import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import music_logo from './music_logo.png'

function Recommendations() {
    const [mood, setMood] = useState('');
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSelectAnother, setShowSelectAnother] = useState(false); // Track whether to show "Select Another List"

    // Predefined moods
    const moods = [
        'happy',
        'chill',
        'party',
        'ambient',
        'classical',
        'jazz',
        'hip-hop',
        'pop',
        'rock',
        'blues',
        'soft',
        'sad',
        'heartbreak',
        'empty'
    ];

    const handleMoodChange = (e) => {
        setMood(e.target.value);
    };

    const getRecommendations = async (selectedMood) => {
        if (!selectedMood) {
            alert('Please select a mood!');
            return;
        }

        setLoading(true); // Show loading spinner

        try {
            const response = await axios.get(`/recommend/mood/${selectedMood}`);
            setTracks(response.data);
            setShowSelectAnother(true); // Show the "Select Another List" option after loading
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false); // Hide loading spinner
        }
    };

    const handleGetRecommendations = () => {
        getRecommendations(mood);
    };

    const handleRefreshRecommendations = () => {
        getRecommendations(mood);
    };

    const handleSelectAnotherMood = () => {
        setTracks([]); // Clear the previous tracks
        setShowSelectAnother(false); // Hide the "Select Another List" button until new recommendations are loaded
        setMood(''); // Reset the mood selection
    };


    return (
        <div className="app-container">
            <h1>Music Recommendation App</h1>

        {!showSelectAnother && (
            <div className="mood-selection-container">
                <img alt="Website Logo" src={music_logo} style={{width:'100%'}} className="logo-image"/>
                <div className="mood-text">
                    <h2>Simply select a mood to get started. Refresh for a new set if needed.</h2>
                    <label htmlFor="mood-select">Choose a mood: </label>
                    <select id="mood-select" value={mood} onChange={handleMoodChange}>
                        <option value="" disabled>Select a mood</option>
                        {moods.map((m, index) => (
                            <option key={index} value={m}>
                                {m.charAt(0).toUpperCase() + m.slice(1)}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleGetRecommendations}>Get Recommendations</button>
                </div>
            </div>
        )}

            {loading && <div className="loading-spinner">Loading...</div>} {/* Show spinner when loading */}

            <div>
                {tracks.length > 0 && (
                    <ul className="track-list">
                        {tracks.map((track, index) => (
                            <li key={index} className="track-item">
                                <div className="track-info">
                                    {track.albumCover && (
                                        <img src={track.albumCover} alt={track.album} className="track-image"/>
                                    )}
                                    <div className="track-details">
                                        <p><strong>Track:</strong> {track.name}</p>
                                        <p><strong>Artist:</strong> {track.artist}</p>
                                        <p><strong>Album:</strong> {track.album}</p>
                                        <p>
                                            <a href={track.spotifyUrl} target="_blank" rel="noopener noreferrer">
                                                Listen on Spotify
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Show "Select Another Mood" and "Refresh Recommendations" buttons only after recommendations are loaded */}
            {showSelectAnother && (
                <div className="select-another-container">
                    <button onClick={handleSelectAnotherMood}>
                        Select Another Mood
                    </button>
                    <button onClick={handleRefreshRecommendations} style={{marginLeft: '10px'}}>
                        Refresh Recommendations
                    </button>
                </div>
            )}
        </div>
    );
}

export default Recommendations;

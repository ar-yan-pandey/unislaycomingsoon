// Video controls
const video = document.getElementById('bgVideo');
const unmuteButton = document.getElementById('unmuteButton');
const replayButton = document.getElementById('replayButton');

// Function to check if device is mobile and in portrait
const isMobilePortrait = () => {
    return window.matchMedia('(max-width: 800px) and (orientation: portrait)').matches;
};

// Function to play video
const playVideo = async () => {
    try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
            await playPromise;
            console.log('Video started playing');
        }
    } catch (err) {
        console.error('Video play failed:', err);
        // Retry play after a short delay
        setTimeout(playVideo, 1000);
    }
};

// Function to set correct video source
const setVideoSource = () => {
    const wasMuted = video.muted;
    const currentTime = video.currentTime;
    const wasPlaying = !video.paused;
    
    if (isMobilePortrait()) {
        video.src = '/background-mobile.mp4';
    } else {
        video.src = '/background.mp4';
    }
    
    video.load();
    video.muted = wasMuted;
    
    // Wait for metadata to be loaded before setting time and playing
    video.addEventListener('loadedmetadata', () => {
        video.currentTime = Math.min(currentTime, video.duration);
        if (wasPlaying) {
            playVideo();
        }
    }, { once: true });
};

// Handle window resize and orientation change
let resizeTimeout;
const handleResize = () => {
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(setVideoSource, 250);
};

window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', handleResize);

// Start video muted
video.muted = true;
unmuteButton.classList.add('muted');

// Play video when it's loaded
video.addEventListener('loadedmetadata', playVideo);
video.addEventListener('loadeddata', playVideo);

// Ensure video plays on user interaction
document.addEventListener('click', () => {
    if (video.muted) {
        playVideo();
    }
}, { once: true });

document.addEventListener('touchstart', () => {
    if (video.muted) {
        playVideo();
    }
}, { once: true });

// Show replay button when video ends and pause the video
video.addEventListener('ended', () => {
    video.pause();
    replayButton.classList.add('show');
});

// Handle replay button click
replayButton.addEventListener('click', () => {
    video.currentTime = 0;
    replayButton.classList.remove('show');
    playVideo();
});

// Update mute button state when video mute state changes
video.addEventListener('volumechange', () => {
    unmuteButton.classList.toggle('muted', video.muted);
    if (!video.muted) {
        video.volume = 1.0;
    }
});

// Handle unmute button click
const handleUnmute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wasPaused = video.paused;
    video.muted = !video.muted;
    
    if (!video.muted && wasPaused) {
        playVideo();
    }
};

unmuteButton.addEventListener('click', handleUnmute);
unmuteButton.addEventListener('touchend', handleUnmute);

// Initial video source setup
document.addEventListener('DOMContentLoaded', () => {
    setVideoSource();
});

// Email subscription form
document.getElementById('subscribeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const emailInput = document.getElementById('email');
    const submitButton = e.target.querySelector('button');
    const buttonText = submitButton.querySelector('.button-text');
    const successMessage = document.querySelector('.success-message');
    const errorMessage = document.querySelector('.error-message');
    const email = emailInput.value;
    
    // Hide any existing messages
    successMessage.classList.remove('show');
    errorMessage.classList.remove('show');
    
    try {
        submitButton.disabled = true;
        buttonText.textContent = 'Joining...';
        
        const apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api/subscribe'
            : 'https://www.unislay.com/api/subscribe';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        emailInput.value = '';
        
        if (response.status === 400 && data.message === 'Email already subscribed') {
            errorMessage.classList.add('show');
            
            // Hide error message after 5 seconds with fade out
            setTimeout(() => {
                errorMessage.style.transition = 'all 0.5s ease-out';
                errorMessage.style.opacity = '0';
                errorMessage.style.transform = 'translateX(-50%) translateY(20px)';
                
                // Remove show class and reset styles after animation
                setTimeout(() => {
                    errorMessage.classList.remove('show');
                    errorMessage.style.transition = '';
                    errorMessage.style.opacity = '';
                    errorMessage.style.transform = '';
                }, 500);
            }, 5000);
        } else if (!response.ok) {
            throw new Error(data.message || 'Failed to subscribe');
        } else {
            successMessage.classList.add('show');
            
            // Hide success message after 5 seconds with fade out
            setTimeout(() => {
                successMessage.style.transition = 'all 0.5s ease-out';
                successMessage.style.opacity = '0';
                successMessage.style.transform = 'translateX(-50%) translateY(20px)';
                
                // Remove show class and reset styles after animation
                setTimeout(() => {
                    successMessage.classList.remove('show');
                    successMessage.style.transition = '';
                    successMessage.style.opacity = '';
                    successMessage.style.transform = '';
                }, 500);
            }, 5000);
        }
    } catch (error) {
        console.error('Subscription error:', error);
        alert(error.message || 'Failed to subscribe. Please try again.');
    } finally {
        submitButton.disabled = false;
        buttonText.textContent = 'JOIN';
    }
});

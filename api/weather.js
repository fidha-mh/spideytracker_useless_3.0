// api/weather.js
export default async function handler(req, res) {
    // This securely accesses the secret variable in Vercel
    const apiKey = process.env.WEATHER_API_KEY;
    const { lat, lon } = req.query;

    if (!apiKey) {
        // Fallback if the key isn't set up yet
        return res.status(200).json({ weather: [{ main: 'Clear' }] });
    }

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const data = await response.json();
        
        // We only send the safe weather data back to the user's browser
        res.status(200).json(data);
    } catch (error) {
        console.error("Weather fetch failed:", error);
        res.status(200).json({ weather: [{ main: 'Clear' }] });
    }
}
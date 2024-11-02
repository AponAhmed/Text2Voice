// backend/server.js

import express from 'express';
import gTTS from 'gtts';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3001;

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the generated folder if it doesn't exist
const generatedDir = path.join(__dirname, 'generated');
if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir);
}

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


function sanitizeFilename(text) {
    // Remove invalid filename characters and replace spaces with hyphens
    const sanitizedText = text
        .replace(/[<>:"/\\|,.?*]/g, '') // Remove invalid characters
        .replace(/\s+/g, '-')        // Replace spaces with hyphens
        .toLowerCase();              // Convert to lowercase

    // Limit the length of the filename
    const prefix = sanitizedText.substring(0, 30); // Take the first 30 characters (adjust as needed)

    return prefix;
}
// Route to convert text to MP3

app.post('/api/convert', (req, res) => {
    const text = req.body.text;

    if (!text) {
        return res.status(400).json({ error: 'No text provided.' });
    }

    const sanitizedText = text.replace(/[<>:"/\\|?*]/g, ''); // Remove invalid filename characters
    const prefix = sanitizeFilename(sanitizedText.substring(0, 30)); // Take the first 10 characters (you can adjust this)
    const filename = `${prefix}-${Date.now()}.mp3`; // Filename starts with the prefix
    const filePath = path.join(generatedDir, filename);
    const gtts = new gTTS(text, 'en');

    gtts.save(filePath, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error generating MP3' });
        }

        res.json({ filename });
    });
});

// Route to download the generated MP3 file
app.get('/api/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(generatedDir, filename); // Serve from the generated directory

    res.download(filePath, (err) => {
        if (err) {
            return res.status(500).send('File download error.');
        }

        // Delete file after download to clear up space
        // fs.unlink(filePath, (err) => {
        //     if (err) console.error('Error deleting file:', err);
        // });
    });
});

// Route to get the list of generated MP3 files
app.get('/api/files', (req, res) => {
    const filesDir = path.join(__dirname, 'generated'); // Make sure this is your generated files directory

    fs.readdir(filesDir, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading files directory');
        }

        // Filter for MP3 files
        const mp3Files = files.filter(file => file.endsWith('.mp3'));
        res.json(mp3Files); // Return the list of files
    });
});

// Route to delete a file
app.delete('/api/delete/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(generatedDir, filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).send('Error deleting file.');
        }
        res.status(204).send(); // No content to send back
    });
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

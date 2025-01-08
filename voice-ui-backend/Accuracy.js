const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // Install using `npm install axios`
const cors = require('cors');
const bodyParser = require('body-parser');
const levenshtein = require('fast-levenshtein');
const natural = require('natural');
const cosineSimilarity = require('cosine-similarity');
const wer = require('wer');
const sqlite3 = require('sqlite3').verbose();

const { createObjectCsvWriter } = require('csv-writer');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const WIT_API_TOKEN = 'D74M55VRUAEAVLLO4744KB7OPQFBI3WS-test'; // Replace with your Wit.ai token
ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const transcribeChunk = async (chunkPath,language ) => {
    console.log(language);
        try {
            // Send audio chunk to the Wit.ai speech endpoint
            const response = await axios.post(
                `https://api.wit.ai/speech?v=20230929`,
                fs.createReadStream(chunkPath),
                {
                    headers: {
                        'Authorization': `Bearer ${WIT_API_TOKEN}`,
                        'Content-Type': 'audio/mpeg',
                    },
                }
            );
    
            // Process the response
            const data = response.data; // `response.data` is already parsed JSON
            let finalText = '';
            console.log( typeof (response.data));
            if (typeof data === 'string') {
                const isFinalIndex = data.indexOf('"is_final":true');
    
              
                    const textStart = data.lastIndexOf('"text"') ;
                    console.log("the  last index  ",textStart);
                    const textEnd = data.indexOf("traits", textStart);
                    finalText = data.substring(textStart, textEnd);
                    const textMatch = finalText.match(/"text":\s*"([^"]+)"/);

                    if (textMatch && textMatch[1]) {
                        finalText = textMatch[1]; // Extracted text
                    } else {
                        console.log('No matching text found in response.');
                    }
                
            }
    
            console.log("Final Text:", finalText);
            console.log(typeof finalText);
            
         //   // Extract the final text from the response if available
           // const finalText = data.find(item => item.is_final)?.text || "Final text not found";
            //console.log("Final Text:", finalText);
    
            // Log the full response
    //        console.log("Full Response:", data);
    
            // Check for the transcription of the current chunk
        //     // If `data` contains a specific field for final text, adjust accordingly
        //  finalText = data.is_final ? data.text : "Final text not found";
        // console.log("Final Text:", finalText);

        // If transcriptions are in a nested structure, locate them
        // const transcription = data.transcriptions?.find(
        //     item => item.chunk === path.basename(chunkPath)
        // );

        // if (transcription) {
        //     return transcription.transcription || 'No transcription available for this chunk';
        // } else {
        //     return 'Chunk transcription not found';
        // }
        return  finalText;
    } catch (error) {
        console.error(`Error transcribing ${chunkPath}:`, error.message);
        return 'Error during transcription';
    }
};
const clearChunksFolder = (folderPath) => {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach(file => {
            fs.unlinkSync(path.join(folderPath, file));
        });
    }
};
app.post('/upload', upload.single('audio'), async (req, res) => {
    const inputAudio = req.file.path;
    const selectedLanguage = req.body.language;  // Get the selected language
    const chunkFolder = path.join(__dirname, 'chunks');
    const chunkDuration = 3; // Chunk duration in seconds

    // Clear old chunks
    clearChunksFolder(chunkFolder);
    if (!fs.existsSync(chunkFolder)) {
        fs.mkdirSync(chunkFolder, { recursive: true });
    }

    ffmpeg(inputAudio)
        .output(`${chunkFolder}/chunk-%03d.mp3`)
        .audioCodec('libmp3lame')
        .outputOptions([`-f segment`, `-segment_time ${chunkDuration}`])
        .on('end', async () => {
            console.log('Audio split into chunks.');

            const chunkFiles = fs.readdirSync(chunkFolder).map(file => path.join(chunkFolder, file));
            const transcriptions = [];

            for (const chunk of chunkFiles) {
                console.log(`Processing ${chunk}...`);
                const transcription = await transcribeChunk(chunk, selectedLanguage); // Pass language to transcription
                transcriptions.push({
                    chunk: path.basename(chunk),
                    transcription,
                });
            }

            res.json({
                message: 'Audio processed and transcribed successfully.',
                transcriptions,
            });
        })
        .on('error', (err) => {
            console.error('Error processing audio:', err.message);
            res.status(500).json({ error: 'Failed to process audio.' });
        })
        .run();
});

function levenshteinDistance(s1, s2) {
    const m = s1.length;
    const n = s2.length;

    // Create a 2D array (dp table)
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    // Initialize the table
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    // Compute distances
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1]; // No operation needed
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],    // Deletion
                    dp[i][j - 1],    // Insertion
                    dp[i - 1][j - 1] // Substitution
                );
            }
        }
    }

    return dp[m][n];
}

// POST route to calculate Levenshtein distance
app.post('/wer', (req, res) => {
    const { string1, string2 } = req.body;

    if (!string1 || !string2) {
        return res.status(400).json({ error: 'Both string1 and string2 are required.' });
    }

    // Optional: Validate if the strings are non-empty and of valid type (string)
    if (typeof string1 !== 'string' || typeof string2 !== 'string' || !string1.trim() || !string2.trim()) {
        return res.status(400).json({ error: 'Both strings must be non-empty valid strings.' });
    }

    // Logging the strings (for debugging purposes)
    console.log('String 1:', string1);
    console.log('String 2:', string2);

    const distance = levenshteinDistance(string1, string2);

    // Return the result as a JSON response
    res.json({ string1, string2, distance });
});

const db = new sqlite3.Database('./results.db', (err) => {
    if (err) {
        console.error('Error connecting to database', err);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create table if not exists
db.run(`
    CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        string1 TEXT NOT NULL,
        string2 TEXT NOT NULL,
        levenshtein_distance INTEGER NOT NULL,
        levenshtein_similarity TEXT NOT NULL,
        cosine_similarity TEXT NOT NULL,
        wer_accuracy TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);

// Preprocessing function
function preprocessString(input) {
    return input.toLowerCase().replace(/[^\w\s]/g, '').trim();
}

// Compare API
app.post('/compare', (req, res) => {
    const { string1, string2 } = req.body;

    if (!string1 || !string2) {
        return res.status(400).json({ error: 'Both string1 and string2 are required.' });
    }

    const str1 = preprocessString(string1);
    const str2 = preprocessString(string2);

    const levenshteinDistance = levenshtein.get(str1, str2);
    const levenshteinSimilarity = ((1 - levenshteinDistance / Math.max(str1.length, str2.length)) * 100).toFixed(2);

    const tokenizer = new natural.WordTokenizer();
    const tokens1 = tokenizer.tokenize(str1);
    const tokens2 = tokenizer.tokenize(str2);
    const allTokens = Array.from(new Set([...tokens1, ...tokens2]));
    const vectorize = (tokens) => allTokens.map((token) => tokens.includes(token) ? 1 : 0);

    const cosineSim = (cosineSimilarity(vectorize(tokens1), vectorize(tokens2)) * 100).toFixed(2);

    const werAccuracy = ((1 - wer(str1, str2)) * 100).toFixed(2);

    // Save results to database
    const query = `
        INSERT INTO results (string1, string2, levenshtein_distance, levenshtein_similarity, cosine_similarity, wer_accuracy)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.run(query, [string1, string2, levenshteinDistance, levenshteinSimilarity, cosineSim, werAccuracy], (err) => {
        if (err) {
            console.error('Error saving to database:', err);
            return res.status(500).json({ error: 'Error saving results to the database.' });
        }

        res.json({
            levenshtein: { distance: levenshteinDistance, similarity: levenshteinSimilarity + '%' },
            cosineSimilarity: cosineSim + '%',
            werAccuracy: werAccuracy + '%'
        });
    });
});

// Export results to CSV
app.get('/export', (req, res) => {
    const query = `SELECT * FROM results`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Error fetching data from the database.' });
        }

        const csvWriter = createObjectCsvWriter({
            path: 'results.csv',
            header: [
                { id: 'id', title: 'ID' },
                { id: 'string1', title: 'String 1' },
                { id: 'string2', title: 'String 2' },
                { id: 'levenshtein_distance', title: 'Levenshtein Distance' },
                { id: 'levenshtein_similarity', title: 'Levenshtein Similarity' },
                { id: 'cosine_similarity', title: 'Cosine Similarity' },
                { id: 'wer_accuracy', title: 'WER Accuracy' },
                { id: 'created_at', title: 'Created At' }
            ]
        });

        csvWriter.writeRecords(rows)
            .then(() => {
                res.download('results.csv', 'results.csv', (err) => {
                    if (err) {
                        console.error('Error sending file:', err);
                    }
                });
            })
            .catch((err) => {
                console.error('Error writing CSV:', err);
                res.status(500).json({ error: 'Error generating CSV file.' });
            });
    });
});
// Start the server
app.listen(9000, () => {
    console.log(`Server running on http://localhost:9000`);
});

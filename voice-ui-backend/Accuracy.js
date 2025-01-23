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
const  speechscore = require("word-error-rate");
const mysql = require('mysql2');
const PDFDocument = require('pdfkit');
//import { AssemblyAI } from 'assemblyai'

// const client = new AssemblyAI({
 
// })

 const  Assembly_api_Key=  '';


const { createObjectCsvWriter } = require('csv-writer');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const WIT_API_TOKEN = ''; // Replace with your Wit.ai token
ffmpeg.setFfmpegPath("");  //path to your  system  ffmpeg

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
/* Main  Worlking  Function
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
        .on('start', () => {
                console.log('Started chunk generation...');
            })
            .on('progress', async (progress) => {
                // Monitor progress (optional)
                console.log(`Progress: ${progress.timemark}`);
            })
            .on('error', (err) => {
                console.error('Error during FFmpeg processing:', err.message);
                res.status(500).json({ error: 'Failed to process audio.' });
            })
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
});*/
/*
this  api make  the  time to  reduct  by  less  time
*/
app.post('/upload', upload.single('audio'), async (req, res) => {
    try {
        const { default: pLimit } = await import('p-limit'); 
        const inputAudio = req.file.path;
        const selectedLanguage = req.body.language; // Get the selected language
        const chunkFolder = path.join(__dirname, 'chunks');
        const chunkDuration = 3; // Chunk duration in seconds
        const maxConcurrentTranscriptions = 5; // Adjust based on system capabilities

        // Clear old chunks
        clearChunksFolder(chunkFolder);
        if (!fs.existsSync(chunkFolder)) {
            fs.mkdirSync(chunkFolder, { recursive: true });
        }

        console.log('Starting FFmpeg to split audio into chunks...');
        await new Promise((resolve, reject) => {
            ffmpeg(inputAudio)
                .output(`${chunkFolder}/chunk-%03d.mp3`)
                .audioCodec('libmp3lame')
                .outputOptions([`-f segment`, `-segment_time ${chunkDuration}`])
                .on('start', () => {
                    console.log('FFmpeg started processing...');
                })
                .on('error', (err) => {
                    console.error('Error during FFmpeg processing:', err.message);
                    reject(new Error('FFmpeg failed to process the audio.'));
                })
                .on('end', () => {
                    console.log('FFmpeg finished processing.');
                    resolve();
                })
                .run();
        });

        console.log('FFmpeg completed successfully. Starting chunk transcription...');
        const chunkFiles = fs.readdirSync(chunkFolder)
            .filter(file => file.endsWith('.mp3'))
            .map(file => path.join(chunkFolder, file));

        // Limit the number of concurrent transcriptions
        const limit = pLimit(maxConcurrentTranscriptions);

        const transcriptionPromises = chunkFiles.map(chunk =>
            limit(async () => {
                console.log(`Transcribing chunk: ${chunk}`);
                try {
                    const transcription = await transcribeChunk(chunk, selectedLanguage);
                    return {
                        chunk: path.basename(chunk),
                        transcription,
                    };
                } catch (err) {
                    console.error(`Failed to transcribe chunk ${chunk}:`, err.message);
                    return {
                        chunk: path.basename(chunk),
                        transcription: 'Error during transcription',
                    };
                }
            })
        );

        // Wait for all transcriptions to complete
        const transcriptions = await Promise.all(transcriptionPromises);

        console.log('All chunks processed successfully.');
        console.log(transcriptions);
        res.json({
            message: 'Audio processed and transcribed successfully.',
            transcriptions,
        });
    } catch (err) {
        console.error('Error processing request:', err.message);
        res.status(500).json({
            error: 'An error occurred while processing the audio.',
            details: err.message,
        });
    }
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



const db = mysql.createConnection({
    host: 'localhost',
    user: '',
    password: '',
    database: ''
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
    } else {
        console.log('Connected to MySQL database.');
    }
});

db.query(`
    CREATE TABLE IF NOT EXISTS Test (
        id INT AUTO_INCREMENT PRIMARY KEY,
        Transcription TEXT NOT NULL,
        Actual TEXT NOT NULL,
        levenshtein_distance INT NOT NULL,
        levenshtein_similarity VARCHAR(255) NOT NULL,
        cosine_similarity VARCHAR(255) NOT NULL,
        wer_accuracy VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.error('Error creating table:', err);
    } else {
        console.log('Table "results" is ready.');
    }
});
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

    const werRaw = speechscore.wordErrorRate(str1, str2); // WER returns a value like 0.3816
const werAccuracy = ((1 - werRaw) * 100).toFixed(2); // Converts to percentage


    // Save results to database
    const query = `
    INSERT INTO Test (Transcription, Actual, levenshtein_distance, levenshtein_similarity, cosine_similarity, wer_accuracy)
    VALUES (?, ?, ?, ?, ?, ?)
`;

db.query(query, [string1, string2, levenshteinDistance, levenshteinSimilarity, cosineSim, werAccuracy], (err, results) => {
    if (err) {
        console.error('Error saving to MySQL database:', err);
        return res.status(500).json({ error: 'Error saving results to the MySQL database.' });
    }

    // Send JSON response on successful insertion
    res.json({
        message: 'Results successfully saved to MySQL database.',
        insertedId: results.insertId, // MySQL provides the ID of the inserted row
        data: {
            levenshtein: { 
                distance: levenshteinDistance, 
                similarity: levenshteinSimilarity + '%' 
            },
            cosineSimilarity: cosineSim + '%',
            werAccuracy: werAccuracy + '%'
        }
    });
});

});
// Route to generate PDF
app.get("/pdf", (req, res) => {
    const query = "SELECT * FROM Test";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data: ", err);
      return res.status(500).send("Error fetching data.");
    }

    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 });
    const filePath = "Test_Report.pdf";

    // Stream to file
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add title
    doc
      .fontSize(18)
      .text("Test Table Report", { align: "center" })
      .moveDown(1);

    // Loop through results and add content
    results.forEach((row, index) => {
      // Add Transcription and Actual Text
      doc.fontSize(14).text(`Transcription (ID: ${row.id}):`, { continued: true });
      doc.fontSize(12).text(row.Transcription, { align: 'justify' }).moveDown(1);

      doc.fontSize(14).text(`Actual (ID: ${row.id}):`, { continued: true });
      doc.fontSize(12).text(row.Actual, { align: 'justify' }).moveDown(1);

      // Add Accuracy Parameters
      doc.fontSize(14).text("Accuracy Parameters:", { underline: true }).moveDown(0.5);

      // Create a table-like format for accuracy parameters
      const accuracyData = [
        { label: "Levenshtein Distance", value: row.levenshtein_distance },
        { label: "Levenshtein Similarity", value: row.levenshtein_similarity },
        { label: "Cosine Similarity", value: row.cosine_similarity },
        { label: "WER Accuracy", value: row.wer_accuracy },
      ];

      accuracyData.forEach((param) => {
        doc.fontSize(12).text(`${param.label}:`, { continued: true });
        doc.fontSize(12).text(param.value, { align: 'left' }).moveDown(0.5);
      });

      // Add page break if it's not the last row
      if (index < results.length - 1) {
        doc.addPage();
      }
    });

    // Finalize the PDF and send it
    doc.end();

    stream.on("finish", () => {
      res.download(filePath, (err) => {
        if (err) {
          console.error("Error downloading PDF: ", err);
        }
        fs.unlinkSync(filePath); // Clean up the file after download
      });
    });
  });
  });
app.listen(9000, () => {
    console.log(`Server running on http://localhost:9000`);
});

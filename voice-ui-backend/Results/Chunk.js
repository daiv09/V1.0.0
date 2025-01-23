const fs = require('fs');
const readline = require('readline');
const mysql = require('mysql2/promise');

// MySQL Database Connection Setup
Function to parse the TSV file
const parseTSV = async (filePath) => {
    const results = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream });

    let isHeader = true;
    for await (const line of rl) {
        if (isHeader) {
            isHeader = false; // Skip the header
            continue;
        }

        const fields = line.split('\t'); // Split by tab
        const [client_id, path, sentence_id, sentence, sentence_domain, up_votes, age, gender, accents, variant, locale] = fields;

        // Push only the required fields
        if (path && sentence && gender && accents) {
            results.push({ path, sentence, gender, accents });
        }
    }
    return results;
};

// Function to insert data into the database
const insertIntoDB = async (data) => {
    const connection = await mysql.createConnection(dbConfig);

    try {
        // Create the table if it doesn't exist
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS audio_data (
                id INT AUTO_INCREMENT PRIMARY KEY,
                path VARCHAR(255),
                sentence TEXT,
                gender VARCHAR(20),
                accents VARCHAR(100)
            )
        `);

        // Insert each row into the database
        for (const row of data) {
            await connection.execute(
                'INSERT INTO audio_data (path, sentence, gender, accents) VALUES (?, ?, ?, ?)',
                [row.path, row.sentence, row.gender, row.accents]
            );
        }
        console.log('Data successfully inserted into the database.');
    } catch (error) {
        console.error('Error inserting data:', error);
    } finally {
        await connection.end();
    }
};

// Main Function
const main = async () => {
    const tsvFilePath = './validated.tsv'; // Replace with the path to your TSV file
    const data = await parseTSV(tsvFilePath);

    if (data.length > 0) {
        console.log(`Extracted ${data.length} rows from the TSV file.`);
        await insertIntoDB(data);
    } else {
        console.log('No valid data found in the TSV file.');
    }
};

main().catch((err) => console.error(err));

const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Java@123',
  database: 'results'
});

// Query to fetch all the data from the Test table
const query = 'SELECT * FROM Test';

// Fetch the data from the database
connection.query(query, (err, results) => {
  if (err) {
    console.error('Error fetching data from database: ', err);
    return;
  }

  // Define the column names based on the table structure
  const columns = [
    'id',
    'Transcription',
    'Actual',
    'levenshtein_distance',
    'levenshtein_similarity',
    'cosine_similarity',
    'wer_accuracy',
    'created_at'
  ];

  // Convert the data to CSV format
  let csvContent = columns.join(',') + '\n'; // Add the column names to the CSV file

  // Iterate through the results and add each row to the CSV file
  results.forEach(row => {
    const rowData = columns.map(col => row[col]); // Extract the values based on column names
    csvContent += rowData.join(',') + '\n'; // Add the row to the CSV content
  });

  // Define the output path for the CSV file
  const outputPath = path.join(__dirname, 'output.csv');

  // Write the CSV content to the file
  fs.writeFile(outputPath, csvContent, (err) => {
    if (err) {
      console.error('Error writing CSV file: ', err);
      return;
    }
    console.log('Data successfully written to output.csv');
  });
});

// Close the database connection
connection.end();

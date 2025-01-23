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

// Query to fetch all the data from the upload_tests table
const query = 'SELECT * FROM upload_tests';

// Fetch the data from the database
connection.query(query, (err, results) => {
  if (err) {
    console.error('Error fetching data from database: ', err);
    return;
  }

  // Define the column names based on the new table structure
  const columns = [
    'id',
    'file_name',
    'status',
    'error_message',
    'Api_time_taken',
    'created_at',
    'file_size',
    'file_duration',
    'Levenshtein Distance',
    'Similarity',
    'Cosine_Similarity',
    'WER_Accuracy'
  ];

  // Convert the data to CSV format
  let csvContent = columns.join(',') + '\n'; // Add the column names to the CSV file

  // Iterate through the results and add each row to the CSV file
  results.forEach(row => {
    const rowData = columns.map(col => {
      // Ensure each column value is safely quoted (to handle commas and special characters)
      const value = row[col] ? row[col].toString() : ''; // Convert value to string
      return `"${value.replace(/"/g, '""')}"`; // Escape double quotes inside values
    });
    csvContent += rowData.join(',') + '\n'; // Add the row to the CSV content
  });

  // Define the output path for the CSV file
  const outputPath = path.join(__dirname, 'test1.csv');

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

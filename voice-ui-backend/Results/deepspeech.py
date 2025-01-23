import mysql.connector
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np  # For handling NaN values

# Connect to MySQL Database
db_connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Java@123",
    database="results"
)
cursor = db_connection.cursor()

# Fetch the required data from the database
query = '''
    SELECT Api_time_taken, file_size, file_duration 
    FROM upload_tests
    WHERE Api_time_taken IS NOT NULL AND file_size IS NOT NULL AND file_duration IS NOT NULL
'''

cursor.execute(query)

# Fetch all results
data = cursor.fetchall()

# Close the cursor and connection
cursor.close()
db_connection.close()

# Process the data
api_time_taken = []
file_size = []
file_duration = []

# Iterate over the rows and ensure the data is numeric
for row in data:
    try:
        # Convert values to float
        api_time_taken.append(float(row[0]))  # Api_time_taken
        file_size.append(float(row[1]))       # file_size
        file_duration.append(float(row[2]))   # file_duration
    except ValueError:
        # If there's an error in conversion, print the problematic row
        print(f"Skipping row due to invalid data: {row}")

# Check if we have valid data
if not api_time_taken or not file_size or not file_duration:
    raise ValueError("One or more columns contain invalid data after conversion.")

# Clean the data by removing any NaN values that may have been introduced
api_time_taken = [x for x in api_time_taken if not np.isnan(x)]
file_size = [x for x in file_size if not np.isnan(x)]
file_duration = [x for x in file_duration if not np.isnan(x)]

# Check again if the lists are empty
if not api_time_taken or not file_size or not file_duration:
    raise ValueError("One or more columns contain no valid data after cleaning.")

# Convert file size from bytes to KB or MB
file_size_kb = [size / 1024 for size in file_size]  # Convert bytes to KB
file_size_mb = [size / (1024 * 1024) for size in file_size]  # Convert bytes to MB

# Plot the data

# 1. File Size vs. API Time Taken
plt.figure(figsize=(12, 8))
sns.scatterplot(x=file_size_kb, y=api_time_taken, color='blue', label="File Size (KB) vs API Time")

# Add titles and labels
plt.title('File Size (KB) vs API Time Taken', fontsize=16)
plt.xlabel('File Size (KB)', fontsize=12)
plt.ylabel('API Time Taken (Seconds)', fontsize=12)

# Add a regression line to indicate trends
sns.regplot(x=file_size_kb, y=api_time_taken, scatter=False, color='blue', line_kws={"color": "blue", "alpha": 0.5, "lw": 2})

# Add annotations to explain insights
plt.annotate(
    'As the file size increases, API time generally increases.\nThis indicates that larger files take longer to process.',
    xy=(100, 1), xycoords='data', horizontalalignment='center', fontsize=10, color='black', bbox=dict(facecolor='white', alpha=0.5)
)

# Show the plot
plt.tight_layout()
plt.savefig('file_size_vs_api_time.png')
plt.show()

# 2. File Duration vs. API Time Taken
plt.figure(figsize=(12, 8))
sns.scatterplot(x=file_duration, y=api_time_taken, color='red', label="File Duration (Seconds) vs API Time")

# Add titles and labels
plt.title('File Duration (Seconds) vs API Time Taken', fontsize=16)
plt.xlabel('File Duration (Seconds)', fontsize=12)
plt.ylabel('API Time Taken (Seconds)', fontsize=12)

# Add a regression line to indicate trends
sns.regplot(x=file_duration, y=api_time_taken, scatter=False, color='red', line_kws={"color": "red", "alpha": 0.5, "lw": 2})

# Add annotations to explain insights
plt.annotate(
    'File duration impacts API time, but the relationship may not be linear.\n Longer duration files may involve more complex processing.',
    xy=(15, 1), xycoords='data', horizontalalignment='center', fontsize=10, color='black', bbox=dict(facecolor='white', alpha=0.5)
)

# Show the plot
plt.tight_layout()
plt.savefig('file_duration_vs_api_time.png')
plt.show()

# Conclusion
# The two plots give us valuable insights into the API processing time. We can observe the following trends:
# 1. **File Size vs API Time Taken**: Larger file sizes result in higher API processing times, which makes sense since bigger files will take longer to process.
# 2. **File Duration vs API Time Taken**: While the relationship between file duration and API time is less clear, it's still important. Files with longer durations may involve more complex processing or additional tasks.
# By analyzing these relationships, we can focus on optimizing file handling and processing in the backend to improve API performance.

# Optional: Correlation Analysis (for reference)
file_size_kb_series = pd.Series(file_size_kb)
file_duration_series = pd.Series(file_duration)

correlation_size_api = file_size_kb_series.corr(pd.Series(api_time_taken))
correlation_duration_api = file_duration_series.corr(pd.Series(api_time_taken))

# Print the correlation values
print(f"Correlation between File Size (KB) and API Time Taken: {correlation_size_api:.2f}")
print(f"Correlation between File Duration (Seconds) and API Time Taken: {correlation_duration_api:.2f}")

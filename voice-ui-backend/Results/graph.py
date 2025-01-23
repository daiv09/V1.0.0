import mysql.connector
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Connect to MySQL Database

cursor = db_connection.cursor()

# Fetch the data for analysis
query = '''
    SELECT levenshtein_distance, levenshtein_similarity, cosine_similarity, wer_accuracy, created_at
    FROM Test  # replace with the actual table name
    WHERE levenshtein_distance IS NOT NULL AND wer_accuracy IS NOT NULL
'''

cursor.execute(query)

# Fetch all results
data = cursor.fetchall()

# Convert to DataFrame for easier manipulation
df = pd.DataFrame(data, columns=["levenshtein_distance", "levenshtein_similarity", "cosine_similarity", "wer_accuracy", "created_at"])

# Close the cursor and connection
cursor.close()
db_connection.close()

# Convert levenshtein_distance to numeric if needed
df['levenshtein_distance'] = pd.to_numeric(df['levenshtein_distance'], errors='coerce')

# Convert 'wer_accuracy' to numeric (remove '%' and convert to float)
df['wer_accuracy'] = df['wer_accuracy'].astype(str).str.replace('%', '').astype(float) / 100

# Summary Statistics
summary = {
    'Total Records': len(df),
    'Average Levenshtein Distance': df['levenshtein_distance'].mean(),
    'Average WER Accuracy': df['wer_accuracy'].mean(),
    'Max Levenshtein Distance': df['levenshtein_distance'].max(),
    'Min Levenshtein Distance': df['levenshtein_distance'].min(),
}

# 1. Graph 1: Distribution of Levenshtein Distance
plt.figure(figsize=(10, 6))
sns.histplot(df['levenshtein_distance'], kde=True, color='blue')
plt.title('Distribution of Levenshtein Distance')
plt.xlabel('Levenshtein Distance')
plt.ylabel('Frequency')
plt.annotate('Levenshtein distance measures the difference between strings. A higher distance indicates more significant differences between the strings.',
             xy=(0.7, 0.9), xycoords='axes fraction', horizontalalignment='center', verticalalignment='center', fontsize=9, color='black')
plt.tight_layout()
plt.savefig('levenshtein_distance_distribution.png')
plt.show()

# 2. Graph 2: Distribution of WER Accuracy
plt.figure(figsize=(10, 6))
sns.histplot(df['wer_accuracy'], kde=True, color='purple')
plt.title('Distribution of WER Accuracy')
plt.xlabel('WER Accuracy')
plt.ylabel('Frequency')
plt.annotate('WER (Word Error Rate) accuracy reflects the performance of speech-to-text. A higher value means better accuracy.',
             xy=(0.7, 0.9), xycoords='axes fraction', horizontalalignment='center', verticalalignment='center', fontsize=9, color='black')
plt.tight_layout()
plt.savefig('wer_accuracy_distribution.png')
plt.show()

# 3. Graph 3: Distribution of Cosine Similarity
plt.figure(figsize=(10, 6))
df['cosine_similarity'] = df['cosine_similarity'].apply(lambda x: float(x.strip('%')) if isinstance(x, str) else x)
sns.histplot(df['cosine_similarity'], kde=True, color='green')
plt.title('Distribution of Cosine Similarity')
plt.xlabel('Cosine Similarity')
plt.ylabel('Frequency')
plt.annotate('Cosine Similarity indicates how similar two vectors (or strings) are. A higher value means more similarity.',
             xy=(0.7, 0.9), xycoords='axes fraction', horizontalalignment='center', verticalalignment='center', fontsize=9, color='black')
plt.tight_layout()
plt.savefig('cosine_similarity_distribution.png')
plt.show()

# 4. Graph 4: Levenshtein Similarity (Bar Chart)
plt.figure(figsize=(10, 6))
levenshtein_similarity_counts = df['levenshtein_similarity'].value_counts()
levenshtein_similarity_counts.plot(kind='bar', color='red', title='Levenshtein Similarity Levels')
plt.ylabel('Count')
plt.xlabel('Similarity Levels')
plt.annotate('The bar chart shows the frequency of different similarity levels. Higher similarity indicates better string match.',
             xy=(0.7, 0.9), xycoords='axes fraction', horizontalalignment='center', verticalalignment='center', fontsize=9, color='black')
plt.tight_layout()
plt.savefig('levenshtein_similarity_bar_chart.png')
plt.show()

# 5. Correlation Heatmap of Levenshtein Distance, Cosine Similarity, and WER Accuracy
plt.figure(figsize=(10, 6))
correlation_matrix = df[['levenshtein_distance', 'cosine_similarity', 'wer_accuracy']].corr()
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', fmt='.2f')
plt.title('Correlation Heatmap between Levenshtein Distance, Cosine Similarity, and WER Accuracy')
plt.tight_layout()
plt.savefig('correlation_heatmap.png')
plt.show()

# Save the summary statistics
with open('data_summary.txt', 'w') as f:
    for key, value in summary.items():
        f.write(f"{key}: {value}\n")

# Displaying the summary report
print("\nData Summary Report:")
for key, value in summary.items():
    print(f"{key}: {value}")

import os
import json
from collections import Counter
from datetime import datetime

def analyze_streaming_data(directory, start_date, end_date):
    total_duration = 0
    songs_counter = Counter()
    artists_counter = Counter()

    # Search the directory for JSON files
    for filename in os.listdir(directory):
        if filename.endswith('.json'):
            file_path = os.path.join(directory, filename)

            # Load JSON file
            with open(file_path, 'r', encoding='utf-8') as file:
                try:
                    data = json.load(file)
                    
                    # Evaluate data
                    for entry in data:
                        timestamp = entry.get('ts', '')
                        if timestamp:
                            entry_date = datetime.strptime(timestamp[:10], '%Y-%m-%d')
                            if start_date <= entry_date <= end_date:
                                ms_played = entry.get('ms_played', 0)
                                total_duration += ms_played

                                song_name = entry.get('master_metadata_track_name')
                                artist_name = entry.get('master_metadata_album_artist_name')

                                if song_name:
                                    songs_counter[song_name] += ms_played
                                if artist_name:
                                    artists_counter[artist_name] += ms_played
                except json.JSONDecodeError:
                    print(f"Error loading {file_path}, skipping file.")

    # Most played songs and artists (Top 10)
    top_songs = songs_counter.most_common(10)
    top_artists = artists_counter.most_common(10)

    # Convert total duration to hours, minutes, and seconds
    total_seconds = total_duration // 1000
    total_hours = total_seconds // 3600
    total_minutes = (total_seconds % 3600) // 60
    total_seconds = total_seconds % 60

    # Convert top 3 to hours and minutes
    def convert_ms_to_time(ms):
        seconds = ms // 1000
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        return hours, minutes

    top_songs_with_time = [(song, convert_ms_to_time(duration)) for song, duration in top_songs]
    top_artists_with_time = [(artist, convert_ms_to_time(duration)) for artist, duration in top_artists]

    return top_songs_with_time, top_artists_with_time, (total_hours, total_minutes, total_seconds)

# Example call
def main():
    directory = os.path.dirname(os.path.abspath(__file__))  # Directory of the script

    # Query start and end date
    while True:
        try:
            start_date_str = input("Enter the start date (DD-MM-YYYY): ")
            end_date_str = input("Enter the end date (DD-MM-YYYY): ")
            start_date = datetime.strptime(start_date_str, '%d-%m-%Y')
            end_date = datetime.strptime(end_date_str, '%d-%m-%Y')
            if start_date <= end_date:
                break
            else:
                print("The start date must be before the end date.")
        except ValueError:
            print("Invalid input. Please enter the date in the format DD-MM-YYYY.")

    top_songs, top_artists, total_time = analyze_streaming_data(directory, start_date, end_date)

    print(f"\nTime interval: {start_date_str} to {end_date_str}")
    print("\nResults:")
    print("Top 10 most played songs:")
    for i, (song, (hours, minutes)) in enumerate(top_songs, 1):
        print(f"  {i}. {song}: {hours} hours, {minutes} minutes")

    print("\nTop 10 most played artists:")
    for i, (artist, (hours, minutes)) in enumerate(top_artists, 1):
        print(f"  {i}. {artist}: {hours} hours, {minutes} minutes")

    print(f"\nTotal duration of all content: {total_time[0]} hours, {total_time[1]} minutes, {total_time[2]} seconds")

if __name__ == "__main__":
    main()

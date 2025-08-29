from flask import Flask, render_template, request, jsonify, send_file
import os
import json
from collections import Counter
from datetime import datetime
import tempfile
import zipfile
from werkzeug.utils import secure_filename
import io

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def analyze_streaming_data(files, start_date, end_date):
    total_duration = 0
    songs_counter = Counter()
    artists_counter = Counter()

    for file in files:
        if file.filename.endswith('.json'):
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
                continue

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

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/spotify-analyzer')
def spotify_analyzer():
    return render_template('spotify_analyzer.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        # Get uploaded files
        files = request.files.getlist('files')
        if not files or files[0].filename == '':
            return jsonify({'error': 'No files uploaded'}), 400

        # Get date range
        start_date_str = request.form.get('start_date')
        end_date_str = request.form.get('end_date')
        
        if not start_date_str or not end_date_str:
            return jsonify({'error': 'Please provide both start and end dates'}), 400

        # Parse dates
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

        if start_date > end_date:
            return jsonify({'error': 'Start date must be before end date'}), 400

        # Analyze data
        top_songs, top_artists, total_time = analyze_streaming_data(files, start_date, end_date)

        # Format results
        songs_data = []
        for i, (song, (hours, minutes)) in enumerate(top_songs, 1):
            songs_data.append({
                'rank': i,
                'name': song,
                'hours': hours,
                'minutes': minutes
            })

        artists_data = []
        for i, (artist, (hours, minutes)) in enumerate(top_artists, 1):
            artists_data.append({
                'rank': i,
                'name': artist,
                'hours': hours,
                'minutes': minutes
            })

        return jsonify({
            'success': True,
            'songs': songs_data,
            'artists': artists_data,
            'total_time': {
                'hours': total_time[0],
                'minutes': total_time[1],
                'seconds': total_time[2]
            },
            'date_range': f"{start_date_str} to {end_date_str}"
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

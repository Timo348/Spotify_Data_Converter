// Analyzer JavaScript for file upload and analysis
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const fileList = document.getElementById('fileList');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadingSection = document.getElementById('loadingSection');
    const resultsSection = document.getElementById('resultsSection');
    const errorSection = document.getElementById('errorSection');

    // Slider elements
    const startHandle = document.getElementById('startHandle');
    const endHandle = document.getElementById('endHandle');
    const sliderRange = document.getElementById('sliderRange');
    const startDateDisplay = document.getElementById('startDateDisplay');
    const endDateDisplay = document.getElementById('endDateDisplay');
    const minDateLabel = document.getElementById('minDateLabel');
    const maxDateLabel = document.getElementById('maxDateLabel');
    const presetBtns = document.querySelectorAll('.preset-btn');

    let uploadedFiles = [];
    let startDate = new Date();
    let endDate = new Date();
    let minDate = new Date();
    let maxDate = new Date();
    let isDragging = false;
    let activeHandle = null;

    // File input change handler
    fileInput.addEventListener('change', function(e) {
        handleFiles(e.target.files);
    });

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    // Click to select files
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });

    // Handle uploaded files
    function handleFiles(files) {
        uploadedFiles = Array.from(files).filter(file => file.name.endsWith('.json'));
        
        if (uploadedFiles.length === 0) {
            showError('Bitte wähle nur JSON-Dateien aus.');
            return;
        }

        displayFileList();
        updateAnalyzeButton();
    }

    // Display file list
    function displayFileList() {
        fileList.innerHTML = '';
        
        uploadedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span class="file-name">${file.name}</span>
                <span class="remove-file" onclick="removeFile(${index})">
                    <i class="fas fa-times"></i>
                </span>
            `;
            fileList.appendChild(fileItem);
        });
    }

    // Remove file from list
    window.removeFile = function(index) {
        uploadedFiles.splice(index, 1);
        displayFileList();
        updateAnalyzeButton();
    };

    // Initialize slider
    function initializeSlider() {
        const today = new Date();
        minDate = new Date(today.getTime() - (365 * 24 * 60 * 60 * 1000)); // 1 year ago
        maxDate = today;
        
        minDateLabel.textContent = formatDate(minDate);
        maxDateLabel.textContent = formatDate(maxDate);
        
        updateSliderPosition();
    }

    // Set date range from number of days
    function setDateRangeFromDays(days) {
        const today = new Date();
        endDate = new Date(today);
        startDate = new Date(today.getTime() - (days * 24 * 60 * 60 * 1000));
        
        updateDateDisplay();
        updateSliderPosition();
        updateAnalyzeButton();
    }

    // Update date display
    function updateDateDisplay() {
        startDateDisplay.textContent = formatDate(startDate);
        endDateDisplay.textContent = formatDate(endDate);
    }

    // Format date for display
    function formatDate(date) {
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Update slider position based on dates
    function updateSliderPosition() {
        const trackWidth = document.querySelector('.slider-track').offsetWidth;
        const startPercent = ((startDate - minDate) / (maxDate - minDate)) * 100;
        const endPercent = ((endDate - minDate) / (maxDate - minDate)) * 100;
        
        startHandle.style.left = `${startPercent}%`;
        endHandle.style.left = `${endPercent}%`;
        
        sliderRange.style.left = `${startPercent}%`;
        sliderRange.style.width = `${endPercent - startPercent}%`;
    }

    // Start dragging
    function startDragging(e) {
        isDragging = true;
        activeHandle = e.target;
        activeHandle.style.zIndex = '20';
        e.preventDefault();
    }

    // Drag function
    function drag(e) {
        if (!isDragging || !activeHandle) return;
        
        const track = document.querySelector('.slider-track');
        const trackRect = track.getBoundingClientRect();
        const clickX = e.clientX - trackRect.left;
        const trackWidth = trackRect.width;
        let percent = (clickX / trackWidth) * 100;
        
        percent = Math.max(0, Math.min(100, percent));
        
        if (activeHandle === startHandle) {
            const endPercent = parseFloat(endHandle.style.left);
            if (percent >= endPercent - 5) percent = endPercent - 5;
            startHandle.style.left = `${percent}%`;
            sliderRange.style.left = `${percent}%`;
            sliderRange.style.width = `${endPercent - percent}%`;
            
            // Update date
            const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);
            const daysFromMin = (percent / 100) * totalDays;
            startDate = new Date(minDate.getTime() + (daysFromMin * 24 * 60 * 60 * 1000));
        } else if (activeHandle === endHandle) {
            const startPercent = parseFloat(startHandle.style.left);
            if (percent <= startPercent + 5) percent = startPercent + 5;
            endHandle.style.left = `${percent}%`;
            sliderRange.style.width = `${percent - startPercent}%`;
            
            // Update date
            const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);
            const daysFromMin = (percent / 100) * totalDays;
            endDate = new Date(minDate.getTime() + (daysFromMin * 24 * 60 * 60 * 1000));
        }
        
        updateDateDisplay();
        updateAnalyzeButton();
    }

    // Stop dragging
    function stopDragging() {
        if (isDragging && activeHandle) {
            activeHandle.style.zIndex = '10';
            isDragging = false;
            activeHandle = null;
        }
    }

    // Update analyze button state
    function updateAnalyzeButton() {
        const hasFiles = uploadedFiles.length > 0;
        const validDates = startDate <= endDate;
        
        analyzeBtn.disabled = !(hasFiles && validDates);
    }

    // Initialize slider
    initializeSlider();

    // Slider event listeners
    startHandle.addEventListener('mousedown', startDragging);
    endHandle.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);

    // Preset button listeners
    presetBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const days = parseInt(this.dataset.days);
            setDateRangeFromDays(days);
            
            // Update active state
            presetBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Initialize with 30 days
    setDateRangeFromDays(30);
    presetBtns[1].classList.add('active'); // 30 days button

    // Analyze button click handler
    analyzeBtn.addEventListener('click', function() {
        if (uploadedFiles.length === 0) {
            showError('Bitte lade zuerst Dateien hoch.');
            return;
        }

        if (startDate > endDate) {
            showError('Das Startdatum muss vor dem Enddatum liegen.');
            return;
        }

        analyzeData();
    });

    // Analyze data function
    function analyzeData() {
        // Show loading
        hideResults();
        hideError();
        showLoading();

        // Create FormData
        const formData = new FormData();
        uploadedFiles.forEach(file => {
            formData.append('files', file);
        });
        formData.append('start_date', startDate.toISOString().split('T')[0]);
        formData.append('end_date', endDate.toISOString().split('T')[0]);

        // Send request
        fetch('/analyze', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            
            if (data.success) {
                displayResults(data);
            } else {
                showError(data.error || 'Ein unbekannter Fehler ist aufgetreten.');
            }
        })
        .catch(error => {
            hideLoading();
            showError('Netzwerkfehler: ' + error.message);
        });
    }

    // Display results
    function displayResults(data) {
        // Update date range text
        document.getElementById('dateRangeText').textContent = `Zeitraum: ${data.date_range}`;

        // Update total time
        const totalTime = data.total_time;
        document.getElementById('totalTime').textContent = 
            `${totalTime.hours}h ${totalTime.minutes}m ${totalTime.seconds}s`;

        // Update unique counts
        document.getElementById('uniqueSongs').textContent = data.songs.length;
        document.getElementById('uniqueArtists').textContent = data.artists.length;

        // Display top songs
        const topSongsList = document.getElementById('topSongsList');
        topSongsList.innerHTML = '';
        
        data.songs.forEach(song => {
            const songItem = document.createElement('div');
            songItem.className = 'result-item';
            songItem.innerHTML = `
                <span class="rank">#${song.rank}</span>
                <span class="name">${song.name}</span>
                <span class="time">${song.hours}h ${song.minutes}m</span>
            `;
            topSongsList.appendChild(songItem);
        });

        // Display top artists
        const topArtistsList = document.getElementById('topArtistsList');
        topArtistsList.innerHTML = '';
        
        data.artists.forEach(artist => {
            const artistItem = document.createElement('div');
            artistItem.className = 'result-item';
            artistItem.innerHTML = `
                <span class="rank">#${artist.rank}</span>
                <span class="name">${artist.name}</span>
                <span class="time">${artist.hours}h ${artist.minutes}m</span>
            `;
            topArtistsList.appendChild(artistItem);
        });

        showResults();
    }

    // Show/hide functions
    function showLoading() {
        loadingSection.style.display = 'block';
    }

    function hideLoading() {
        loadingSection.style.display = 'none';
    }

    function showResults() {
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    function hideResults() {
        resultsSection.style.display = 'none';
    }

    function showError(message) {
        document.getElementById('errorMessage').textContent = message;
        errorSection.style.display = 'block';
        errorSection.scrollIntoView({ behavior: 'smooth' });
    }

    function hideError() {
        errorSection.style.display = 'none';
    }

    // Add file size validation
    function validateFileSize(file) {
        const maxSize = 16 * 1024 * 1024; // 16MB
        if (file.size > maxSize) {
            return false;
        }
        return true;
    }

    // Enhanced file handling with size validation
    function handleFiles(files) {
        const validFiles = [];
        const invalidFiles = [];

        Array.from(files).forEach(file => {
            if (file.name.endsWith('.json')) {
                if (validateFileSize(file)) {
                    validFiles.push(file);
                } else {
                    invalidFiles.push(file.name);
                }
            }
        });

        if (invalidFiles.length > 0) {
            showError(`Folgende Dateien sind zu groß (max. 16MB): ${invalidFiles.join(', ')}`);
        }

        uploadedFiles = validFiles;
        displayFileList();
        updateAnalyzeButton();
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to analyze
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (!analyzeBtn.disabled) {
                analyzeBtn.click();
            }
        }
    });

    // Add progress indicator for large files
    function addProgressIndicator() {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.innerHTML = `
            <div class="progress-fill"></div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .progress-bar {
                width: 100%;
                height: 4px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 2px;
                overflow: hidden;
                margin-top: 1rem;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #1db954, #1ed760);
                width: 0%;
                transition: width 0.3s ease;
            }
        `;
        document.head.appendChild(style);
        
        return progressBar;
    }
});

// ===== DOM Elements =====
const form = document.getElementById('votingForm');
const photoUploadBox = document.getElementById('photoUploadBox');
const symbolUploadBox = document.getElementById('symbolUploadBox');
const photoInput = document.getElementById('candidatePhoto');
const symbolInput = document.getElementById('candidateSymbol');
const photoPreview = document.getElementById('photoPreview');
const symbolPreview = document.getElementById('symbolPreview');
const photoPlaceholder = document.getElementById('photoPlaceholder');
const symbolPlaceholder = document.getElementById('symbolPlaceholder');
const previewBtn = document.getElementById('previewBtn');
const previewModal = document.getElementById('previewModal');
const successModal = document.getElementById('successModal');
const closePreview = document.getElementById('closePreview');
const closeSuccess = document.getElementById('closeSuccess');

// ===== Image Data Storage =====
let photoData = null;
let symbolData = null;

// ===== Image Upload Handlers =====
photoUploadBox.addEventListener('click', () => photoInput.click());
symbolUploadBox.addEventListener('click', () => symbolInput.click());

photoInput.addEventListener('change', (e) => handleImageUpload(e, 'photo'));
symbolInput.addEventListener('change', (e) => handleImageUpload(e, 'symbol'));

function handleImageUpload(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    // Compress image before storing
    compressImage(file, 400, 0.7).then(compressedDataUrl => {
        if (type === 'photo') {
            photoData = compressedDataUrl;
            photoPreview.src = compressedDataUrl;
            photoPreview.classList.add('active');
            photoPlaceholder.style.display = 'none';
        } else {
            symbolData = compressedDataUrl;
            symbolPreview.src = compressedDataUrl;
            symbolPreview.classList.add('active');
            symbolPlaceholder.style.display = 'none';
        }
    }).catch(err => {
        console.error('Image compression failed:', err);
        alert('इमेज लोड करण्यात त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    });
}

// Compress image using canvas
function compressImage(file, maxSize, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > height) {
                    if (width > maxSize) {
                        height = Math.round((height * maxSize) / width);
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = Math.round((width * maxSize) / height);
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to compressed JPEG
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ===== Form Submission =====
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const formData = collectFormData();
    saveToLocalStorage(formData);
    showSuccessModal();
});

function validateForm() {
    if (!photoData) {
        alert('कृपया उमेदवाराचा फोटो अपलोड करा!');
        return false;
    }
    if (!symbolData) {
        alert('कृपया निवडणूक चिन्ह अपलोड करा!');
        return false;
    }
    
    const position = parseInt(document.getElementById('candidatePosition').value);
    const total = parseInt(document.getElementById('totalCandidates').value);
    
    if (position > total) {
        alert('उमेदवाराचा क्रमांक एकूण उमेदवारांपेक्षा जास्त असू शकत नाही!');
        return false;
    }
    
    return true;
}

function collectFormData() {
    const votingDate = document.getElementById('votingDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    
    return {
        constituencyName: document.getElementById('constituencyName').value,
        votingDate: votingDate,
        votingDateFormatted: formatDate(votingDate),
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
        candidateName: document.getElementById('candidateName').value,
        totalCandidates: parseInt(document.getElementById('totalCandidates').value),
        candidatePosition: parseInt(document.getElementById('candidatePosition').value),
        symbolName: document.getElementById('symbolName').value,
        candidatePhoto: photoData,
        candidateSymbol: symbolData,
        websiteName: document.getElementById('websiteName').value,
        contactNumber: document.getElementById('contactNumber').value,
        createdAt: new Date().toISOString()
    };
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 
                    'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const period = h >= 12 ? 'सायं.' : 'स.';
    const displayHour = h > 12 ? h - 12 : h;
    return `${period} ${displayHour}.${minutes}`;
}

function toMarathiNumerals(num) {
    const marathiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return num.toString().split('').map(d => marathiDigits[parseInt(d)] || d).join('');
}

function saveToLocalStorage(data) {
    localStorage.setItem('demoVotingData', JSON.stringify(data));
}

// ===== Preview =====
previewBtn.addEventListener('click', () => {
    if (!validateForm()) return;
    
    const formData = collectFormData();
    saveToLocalStorage(formData);
    
    const previewFrame = document.getElementById('previewFrame');
    previewFrame.src = 'index.html?preview=1&t=' + Date.now();
    previewModal.classList.add('active');
});

// ===== Modal Controls =====
closePreview.addEventListener('click', () => {
    previewModal.classList.remove('active');
    document.getElementById('previewFrame').src = '';
});

closeSuccess.addEventListener('click', () => {
    successModal.classList.remove('active');
});

function showSuccessModal() {
    successModal.classList.add('active');
}

// Close modals on outside click
previewModal.addEventListener('click', (e) => {
    if (e.target === previewModal) {
        previewModal.classList.remove('active');
    }
});

successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
        successModal.classList.remove('active');
    }
});

// ===== Load Existing Data (if any) =====
function loadExistingData() {
    const savedData = localStorage.getItem('demoVotingData');
    if (!savedData) return;
    
    try {
        const data = JSON.parse(savedData);
        
        document.getElementById('constituencyName').value = data.constituencyName || '';
        document.getElementById('votingDate').value = data.votingDate || '';
        document.getElementById('candidateName').value = data.candidateName || '';
        document.getElementById('totalCandidates').value = data.totalCandidates || 19;
        document.getElementById('candidatePosition').value = data.candidatePosition || 6;
        document.getElementById('symbolName').value = data.symbolName || '';
        document.getElementById('websiteName').value = data.websiteName || 'votingdemo.in';
        document.getElementById('contactNumber').value = data.contactNumber || '';
        
        if (data.candidatePhoto) {
            photoData = data.candidatePhoto;
            photoPreview.src = data.candidatePhoto;
            photoPreview.classList.add('active');
            photoPlaceholder.style.display = 'none';
        }
        
        if (data.candidateSymbol) {
            symbolData = data.candidateSymbol;
            symbolPreview.src = data.candidateSymbol;
            symbolPreview.classList.add('active');
            symbolPlaceholder.style.display = 'none';
        }
    } catch (e) {
        console.error('Error loading saved data:', e);
    }
}

// Load on page load
document.addEventListener('DOMContentLoaded', loadExistingData);

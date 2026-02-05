// ===== Configuration =====
let votingData = null;
let wrongSound = null;

// ===== Marathi Numerals =====
function toMarathiNumerals(num) {
    const marathiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return num.toString().split('').map(d => {
        const digit = parseInt(d);
        return isNaN(digit) ? d : marathiDigits[digit];
    }).join('');
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    loadVotingData();
    initializeWrongSound();
    setupEventListeners();
});

// ===== Load Data from LocalStorage =====
function loadVotingData() {
    const savedData = localStorage.getItem('demoVotingData');
    
    if (savedData) {
        try {
            votingData = JSON.parse(savedData);
            applyVotingData();
        } catch (e) {
            console.error('Error loading voting data:', e);
            showDefaultDemo();
        }
    } else {
        showDefaultDemo();
    }
}

function showDefaultDemo() {
    // Show default demo data if nothing is configured
    votingData = {
        constituencyName: '५७ बोरामणी जिल्हा परिषद गट',
        candidateName: 'अनिता योगेश माळगे',
        symbolName: 'रिक्षा',
        totalCandidates: 19,
        candidatePosition: 6,
        votingDateFormatted: '५ फेब्रुवारी २०२६',
        startTime: 'स. ७.३०',
        endTime: 'सायं. ५.३०',
        websiteName: 'votingdemo.in',
        contactNumber: '+919359781891',
        candidatePhoto: null,
        candidateSymbol: null
    };
    applyVotingData();
}

function applyVotingData() {
    // Update header
    document.getElementById('constituencyName').textContent = votingData.constituencyName;
    document.getElementById('modalConstituency').textContent = votingData.constituencyName;
    
    // Update instruction banner
    document.getElementById('instructionText').textContent = 
        `डेमो मतदानासाठी ${votingData.symbolName} निशाणी समोरील निळे बटण दाबावे`;
    
    // Update appeal text
    document.getElementById('symbolNameBold').textContent = votingData.symbolName;
    document.getElementById('candidateNameBold').textContent = votingData.candidateName;
    
    // Update info banner
    document.getElementById('symbolNameQuote').textContent = votingData.symbolName;
    
    const dateText = votingData.votingDateFormatted || '५ फेब्रुवारी २०२६';
    const startTime = votingData.startTime || 'स. ७.३०';
    const endTime = votingData.endTime || 'सायं. ५.३०';
    document.getElementById('infoLine2').textContent = 
        `मतदान दिनांक : ${dateText} ${startTime} ते ${endTime} वाजेपर्यंत`;
    
    // Update modal
    document.getElementById('modalSymbolName').textContent = votingData.symbolName;
    document.getElementById('modalRank').textContent = toMarathiNumerals(votingData.candidatePosition);
    
    if (votingData.candidatePhoto) {
        document.getElementById('modalPhoto').src = votingData.candidatePhoto;
    }
    if (votingData.candidateSymbol) {
        document.getElementById('modalSymbol').src = votingData.candidateSymbol;
    }
    
    // Update footer
    document.getElementById('footerWebsite').textContent = votingData.websiteName || 'votingdemo.in';
    document.getElementById('footerPhone').textContent = votingData.contactNumber || '+919359781891';
    document.getElementById('footerPhone').href = 'tel:' + (votingData.contactNumber || '+919359781891');
    
    // Generate candidate table
    generateCandidateTable();
}

// ===== Generate Candidate Table =====
function generateCandidateTable() {
    const tbody = document.getElementById('candidateTableBody');
    tbody.innerHTML = '';
    
    const total = votingData.totalCandidates || 19;
    const ourPosition = votingData.candidatePosition || 6;
    
    for (let i = 1; i <= total; i++) {
        const isOurCandidate = (i === ourPosition);
        const row = document.createElement('tr');
        row.className = 'candidate-row' + (isOurCandidate ? ' highlighted' : '');
        
        // 1. Serial Number (Rank)
        const numCell = document.createElement('td');
        numCell.textContent = toMarathiNumerals(i);
        row.appendChild(numCell);
        
        // 2. Name
        const nameCell = document.createElement('td');
        nameCell.className = 'candidate-name';
        if (isOurCandidate) {
            nameCell.textContent = votingData.candidateName;
        }
        row.appendChild(nameCell);
        
        // 3. Photo
        const photoCell = document.createElement('td');
        photoCell.className = 'photo-cell';
        if (isOurCandidate && votingData.candidatePhoto) {
            const img = document.createElement('img');
            img.src = votingData.candidatePhoto;
            img.className = 'photo-thumbnail';
            img.alt = votingData.candidateName;
            photoCell.appendChild(img);
        }
        row.appendChild(photoCell);
        
        // 4. Symbol
        const symbolCell = document.createElement('td');
        symbolCell.className = 'symbol-cell';
        if (isOurCandidate && votingData.candidateSymbol) {
            const symbolWrapper = document.createElement('div');
            symbolWrapper.className = 'symbol-wrapper';
            const img = document.createElement('img');
            img.src = votingData.candidateSymbol;
            img.className = 'symbol-thumbnail';
            img.alt = votingData.symbolName;
            symbolWrapper.appendChild(img);
            symbolCell.appendChild(symbolWrapper);
        }
        row.appendChild(symbolCell);
        
        // 5. Red Indicator Circle
        const indicatorCell = document.createElement('td');
        indicatorCell.className = 'indicator-cell';
        const indicator = document.createElement('span');
        indicator.className = 'indicator-circle';
        indicatorCell.appendChild(indicator);
        row.appendChild(indicatorCell);
        
        // 6. Vote Button
        const btnCell = document.createElement('td');
        btnCell.className = 'button-cell';
        const btn = document.createElement('button');
        btn.className = 'vote-btn' + (isOurCandidate ? ' our-candidate' : '');
        if (isOurCandidate) {
            btn.textContent = 'बटण दाबा';
        }
        btn.dataset.position = i;
        btn.dataset.isOurCandidate = isOurCandidate;
        
        btn.addEventListener('click', () => handleVoteClick(i, isOurCandidate, btn));
        
        btnCell.appendChild(btn);
        row.appendChild(btnCell);
        
        tbody.appendChild(row);
    }
}

// ===== Vote Button Handler =====
function handleVoteClick(position, isOurCandidate, btn) {
    if (isOurCandidate) {
        playCorrectSound();
        openModal();
    } else {
        playWrongSound();
        btn.classList.add('wrong-pressed');
        setTimeout(() => {
            btn.classList.remove('wrong-pressed');
        }, 500);
    }
}

// ===== Sound Effects =====
let audioContext = null;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// Correct vote sound - pleasant ascending chime
function playCorrectSound() {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        
        // First tone
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523, now); // C5
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc1.start(now);
        osc1.stop(now + 0.15);
        
        // Second tone (higher)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659, now + 0.1); // E5
        gain2.gain.setValueAtTime(0.3, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.25);
        
        // Third tone (highest)
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(784, now + 0.2); // G5
        gain3.gain.setValueAtTime(0.3, now + 0.2);
        gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc3.start(now + 0.2);
        osc3.stop(now + 0.4);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// Wrong vote sound - buzzer
function initializeWrongSound() {
    // Pre-initialize audio context on first user interaction
    try {
        getAudioContext();
        wrongSound = {
            play: function() {
                const ctx = getAudioContext();
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(200, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
                
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.3);
            }
        };
    } catch (e) {
        console.log('Web Audio API not supported');
        wrongSound = { play: () => {} };
    }
}

function playWrongSound() {
    if (wrongSound) {
        wrongSound.play();
    }
}

// ===== Modal Controls =====
const modal = document.getElementById('candidateModal');
const flipCard = document.getElementById('flipCard');
const closeModal = document.getElementById('closeModal');

function openModal() {
    modal.classList.add('active');
    flipCard.classList.add('auto-flip');
}

function closeModalFn() {
    modal.classList.remove('active');
    flipCard.classList.remove('auto-flip');
    flipCard.classList.remove('flipped');
}

closeModal.addEventListener('click', closeModalFn);

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModalFn();
    }
});

// Manual flip on click
flipCard.addEventListener('click', (e) => {
    e.stopPropagation();
    flipCard.classList.remove('auto-flip');
    flipCard.classList.toggle('flipped');
});

// ===== WhatsApp Share =====
function setupEventListeners() {
    document.getElementById('mainShareBtn').addEventListener('click', shareOnWhatsApp);
    document.getElementById('modalShareBtn').addEventListener('click', shareOnWhatsApp);
}

function shareOnWhatsApp() {
    const symbolName = votingData?.symbolName || 'रिक्षा';
    const candidateName = votingData?.candidateName || 'अनिता योगेश माळगे';
    const constituency = votingData?.constituencyName || '५७ बोरामणी जिल्हा परिषद गट';
    
    const message = `🗳️ *${constituency}*\n\n` +
        `मतदानाच्या दिवशी *"${symbolName}"* या चिन्हासमोरील बटण दाबून ` +
        `*${candidateName}* यांना प्रचंड मतांनी विजयी करा!\n\n` +
        `डेमो मतदान करण्यासाठी खालील लिंकवर क्लिक करा:\n` +
        `${window.location.href}`;
    
    const whatsappUrl = 'https://wa.me/?text=' + encodeURIComponent(message);
    window.open(whatsappUrl, '_blank');
}

// ===== Keyboard Controls =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModalFn();
    }
});

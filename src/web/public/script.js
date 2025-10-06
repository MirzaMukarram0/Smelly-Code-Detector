// ===== BACKGROUND ANIMATION SYSTEM =====
class BackgroundAnimation {
    constructor() {
        this.canvas = document.getElementById('backgroundCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.createParticles();
        
        if (!this.reducedMotion) {
            this.animate();
        }
        
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Listen for reduced motion changes
        window.matchMedia('(prefers-reduced-motion: reduce)').addListener((e) => {
            this.reducedMotion = e.matches;
            if (this.reducedMotion && this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            } else if (!this.reducedMotion && !this.animationId) {
                this.animate();
            }
        });
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 20000); // Responsive count
        const maxParticles = Math.min(60, Math.max(20, particleCount));
        
        for (let i = 0; i < maxParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5, // Slow movement (5-15 px/s at 60fps)
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 1.5 + 1, // 1-2.5px radius
                opacity: Math.random() * 0.15 + 0.05 // 0.05-0.2 opacity
            });
        }
    }
    
    animate() {
        if (this.reducedMotion) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(208, 216, 232, ${particle.opacity})`;
            this.ctx.fill();
        });
        
        // Draw connections
        this.drawConnections();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    drawConnections() {
        const connectionDistance = 140; // Distance threshold for connections
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    const opacity = (1 - distance / connectionDistance) * 0.1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(208, 216, 232, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }
    }
}


let selectedFile = null;
let activeSmells = {
    longMethod: true,
    godClass: true,
    duplicatedCode: true,
    largeParameterList: true,
    magicNumbers: true,
    featureEnvy: true
};

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const tabName = this.dataset.tab;
        
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        this.classList.add('active');
        document.getElementById(tabName + '-tab').classList.add('active');
        
        updateAnalyzeButton();
    });
});

// File upload handling
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        selectedFile = file;
        document.querySelector('.upload-area h3').textContent = `Selected: ${file.name}`;
        document.querySelector('.upload-area p').textContent = `File size: ${(file.size / 1024).toFixed(1)} KB`;
        updateAnalyzeButton();
    }
}

// Drag and drop handling
const uploadArea = document.querySelector('.upload-area');

uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', function(e) {
    e.preventDefault();
    this.classList.remove('dragover');
});

uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file) {
        selectedFile = file;
        document.getElementById('file-input').files = e.dataTransfer.files;
        document.querySelector('.upload-area h3').textContent = `Selected: ${file.name}`;
        document.querySelector('.upload-area p').textContent = `File size: ${(file.size / 1024).toFixed(1)} KB`;
        updateAnalyzeButton();
    }
});

// Smell toggle
function toggleSmell(smellType, toggleElement) {
    activeSmells[smellType] = !activeSmells[smellType];
    toggleElement.classList.toggle('active');
    toggleElement.parentElement.parentElement.classList.toggle('active');
}

// Update analyze button state
function updateAnalyzeButton() {
    const activeTab = document.querySelector('.tab.active').dataset.tab;
    const analyzeBtn = document.getElementById('analyze-btn');
    
    if (activeTab === 'upload') {
        analyzeBtn.disabled = !selectedFile;
    } else {
        const codeInput = document.getElementById('code-input').value.trim();
        analyzeBtn.disabled = codeInput.length === 0;
    }
}

// Analyze code
async function analyzeCode() {
    const activeTab = document.querySelector('.tab.active').dataset.tab;
    const analyzeBtn = document.getElementById('analyze-btn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const error = document.getElementById('error');

    // Hide previous results and errors
    results.style.display = 'none';
    error.style.display = 'none';
    loading.style.display = 'block';
    analyzeBtn.disabled = true;

    try {
        const formData = new FormData();
        
        console.log('🔍 Active smells before sending:', activeSmells);
        
        // Add active detectors
        Object.keys(activeSmells).forEach(smell => {
            if (activeSmells[smell]) {
                formData.append('detectors[]', smell);
                console.log('✅ Adding detector:', smell);
            } else {
                console.log('❌ Skipping detector:', smell);
            }
        });

        // Add thresholds
        Object.keys(activeSmells).forEach(smell => {
            const thresholdInput = document.getElementById(`threshold-${smell}`);
            if (thresholdInput) {
                formData.append(`threshold_${smell}`, thresholdInput.value);
                console.log(`📊 Adding threshold ${smell}:`, thresholdInput.value);
            }
        });

        // Log what we're sending
        console.log('📤 FormData entries:');
        for (const [key, value] of formData.entries()) {
            console.log(`  ${key}: ${value}`);
        }

        let response;
        if (activeTab === 'upload' && selectedFile) {
            formData.append('codeFile', selectedFile);
            response = await fetch('/api/analyze-file', {
                method: 'POST',
                body: formData
            });
        } else {
            const code = document.getElementById('code-input').value;
            const language = document.getElementById('language-select').value;
            formData.append('code', code);
            formData.append('language', language);
            response = await fetch('/api/analyze-code', {
                method: 'POST',
                body: formData
            });
        }

        const result = await response.json();

        if (response.ok) {
            displayResults(result);
        } else {
            throw new Error(result.error || 'Analysis failed');
        }
    } catch (err) {
        showError('Error analyzing code: ' + err.message);
    } finally {
        loading.style.display = 'none';
        analyzeBtn.disabled = false;
    }
}

// Display results
function displayResults(result) {
    const results = document.getElementById('results');
    const filename = document.getElementById('analyzed-filename');
    const summary = document.getElementById('summary');
    const smellsList = document.getElementById('smells-list');

    // Set filename
    filename.textContent = result.filename || result.originalFilename || 'Code Analysis';

    // Create summary - handle both old and new result formats
    const smells = result.smells || result.detected || [];
    const totalSmells = smells.length;
    const smellTypes = [...new Set(smells.map(s => s.type))].length;
    const severityCount = {
        high: smells.filter(s => s.severity === 'high').length,
        medium: smells.filter(s => s.severity === 'medium').length,
        low: smells.filter(s => s.severity === 'low').length
    };

    summary.innerHTML = `
        <div class="summary-item">
            <div class="summary-number">${totalSmells}</div>
            <div class="summary-label">Total Issues</div>
        </div>
        <div class="summary-item">
            <div class="summary-number">${smellTypes}</div>
            <div class="summary-label">Smell Types</div>
        </div>
        <div class="summary-item">
            <div class="summary-number">${severityCount.high}</div>
            <div class="summary-label">High Priority</div>
        </div>
        <div class="summary-item">
            <div class="summary-number">${severityCount.medium}</div>
            <div class="summary-label">Medium Priority</div>
        </div>
        <div class="summary-item">
            <div class="summary-number">${severityCount.low}</div>
            <div class="summary-label">Low Priority</div>
        </div>
    `;

    // Create smells list
    if (smells.length === 0) {
        smellsList.innerHTML = '<div class="no-smells">No code smells detected! Your code looks clean.</div>';
    } else {
        smellsList.innerHTML = smells.map(smell => `
            <div class="smell-item severity-${smell.severity || 'medium'}">
                <div class="smell-type">${smell.type}</div>
                <div class="smell-location">${smell.location || smell.lines || 'Unknown location'}</div>
                <div class="smell-description">${smell.description}</div>
                ${smell.details ? `<div class="smell-details">${smell.details}</div>` : ''}
            </div>
        `).join('');
    }

    results.style.display = 'block';
}

// Show error
function showError(message) {
    const error = document.getElementById('error');
    error.textContent = message;
    error.style.display = 'block';
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateAnalyzeButton();
    
    // Initialize background animation
    window.backgroundAnimation = new BackgroundAnimation();
});
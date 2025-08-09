document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const preview = document.getElementById('preview');
    const promptInput = document.getElementById('promptInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const result = document.getElementById('result');
    const codeResult = document.getElementById('codeResult');
    let selectedFile = null;

    // Enhanced notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
    }

    function getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // Add notification styles to head if not already present
    if (!document.querySelector('#notification-styles')) {
        const notificationStyles = document.createElement('style');
        notificationStyles.id = 'notification-styles';
        notificationStyles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-lg);
                padding: var(--space-md);
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--space-md);
                box-shadow: var(--shadow-lg);
                backdrop-filter: blur(20px);
                z-index: 10000;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s ease;
                max-width: 400px;
                min-width: 300px;
            }
            
            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: var(--space-sm);
                flex: 1;
            }
            
            .notification-success {
                border-left: 4px solid var(--accent-success);
            }
            
            .notification-error {
                border-left: 4px solid var(--accent-error);
            }
            
            .notification-warning {
                border-left: 4px solid var(--accent-warning);
            }
            
            .notification-info {
                border-left: 4px solid var(--accent-primary);
            }
            
            .notification-success i {
                color: var(--accent-success);
            }
            
            .notification-error i {
                color: var(--accent-error);
            }
            
            .notification-warning i {
                color: var(--accent-warning);
            }
            
            .notification-info i {
                color: var(--accent-primary);
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--text-muted);
                cursor: pointer;
                padding: var(--space-xs);
                border-radius: var(--radius-sm);
                transition: var(--transition-fast);
            }
            
            .notification-close:hover {
                color: var(--text-primary);
                background: var(--bg-glass);
            }
        `;
        document.head.appendChild(notificationStyles);
    }

    // Add navbar scroll effect
    function handleNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavbarScroll);

    // Add image preview styles
    if (!document.querySelector('#image-preview-styles')) {
        const imagePreviewStyles = document.createElement('style');
        imagePreviewStyles.id = 'image-preview-styles';
        imagePreviewStyles.textContent = `
            .image-preview {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--space-md);
            }
            
            .image-preview img {
                max-width: 100%;
                max-height: 300px;
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-lg);
                border: 1px solid var(--border-color);
                transition: var(--transition-normal);
            }
            
            .image-preview img:hover {
                transform: scale(1.02);
                box-shadow: var(--shadow-glow);
            }
            
            .image-info {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--space-xs);
                padding: var(--space-sm) var(--space-md);
                background: var(--bg-glass);
                border-radius: var(--radius-md);
                border: 1px solid var(--border-color);
            }
            
            .file-name {
                font-weight: 500;
                color: var(--text-primary);
                font-size: 0.9rem;
            }
            
            .file-size {
                color: var(--text-muted);
                font-size: 0.8rem;
            }
        `;
        document.head.appendChild(imagePreviewStyles);
    }

    // Function to set prompt from example chips
    function setPrompt(prompt) {
        const promptInput = document.getElementById('promptInput');
        promptInput.value = prompt;
        promptInput.focus();
        
        // Add a subtle animation to the input
        promptInput.style.transform = 'scale(1.02)';
        setTimeout(() => {
            promptInput.style.transform = 'scale(1)';
        }, 200);
        
        showNotification('Prompt set! You can now analyze your image.', 'success');
    }

    // Make setPrompt function globally available
    window.setPrompt = setPrompt;

    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        handleFile(file);
    });

    // File input handler
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleFile(file);
    });

    // Handle file selection
    function handleFile(file) {
        if (file && file.type.startsWith('image/')) {
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('File size must be less than 5MB', 'error');
                return;
            }
            
            selectedFile = file;
            const reader = new FileReader();
            
            reader.onload = (e) => {
                preview.style.display = 'block';
                preview.innerHTML = `
                    <div class="image-preview">
                        <img src="${e.target.result}" alt="Preview">
                        <div class="image-info">
                            <span class="file-name">${file.name}</span>
                            <span class="file-size">${formatFileSize(file.size)}</span>
                        </div>
                    </div>
                `;
                analyzeBtn.disabled = false;
                showNotification('Image uploaded successfully!', 'success');
            };
            
            reader.readAsDataURL(file);
        } else {
            showNotification('Please select a valid image file', 'error');
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Function to detect and format code blocks
    function formatResponse(text) {
        // Regular expression to match code blocks
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        let formattedText = text;
        let codeBlocks = [];
        let match;
        let index = 0;

        // Find all code blocks
        while ((match = codeBlockRegex.exec(text)) !== null) {
            const language = match[1] || 'javascript';
            const code = match[2].trim();
            const placeholder = `__CODE_BLOCK_${index}__`;
            codeBlocks.push({ language, code });
            formattedText = formattedText.replace(match[0], placeholder);
            index++;
        }

        return { text: formattedText, codeBlocks };
    }

    // Function to format text with proper HTML structure
    function formatText(text) {
        // Split text into paragraphs
        let paragraphs = text.split('\n\n');
        let formattedHTML = '';

        paragraphs.forEach(paragraph => {
            // Skip empty paragraphs
            if (!paragraph.trim()) return;

            // Check for title (text ending with :)
            if (paragraph.trim().endsWith(':')) {
                formattedHTML += `<h3>${paragraph.trim()}</h3>`;
                return;
            }

            // Check for description (text starting with - or •)
            if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•')) {
                formattedHTML += `<p class="description">${paragraph.trim().substring(1).trim()}</p>`;
                return;
            }

            // Check for lists
            if (paragraph.includes('\n-') || paragraph.includes('\n•')) {
                let listItems = paragraph.split('\n').filter(item => item.trim().startsWith('-') || item.trim().startsWith('•'));
                if (listItems.length > 0) {
                    formattedHTML += '<ul>';
                    listItems.forEach(item => {
                        formattedHTML += `<li>${item.trim().substring(1).trim()}</li>`;
                    });
                    formattedHTML += '</ul>';
                    return;
                }
            }

            // Regular paragraph
            formattedHTML += `<p>${paragraph.trim()}</p>`;
        });

        return formattedHTML;
    }

    // Analyze button click handler
    analyzeBtn.addEventListener('click', async () => {
        if (!selectedFile || !promptInput.value.trim()) {
            showNotification('Please select an image and enter a prompt', 'error');
            return;
        }

        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<div class="loading-spinner"></div> Generating Code...';
        result.innerHTML = `
            <div class="placeholder">
                <div class="loading-spinner"></div>
                <span>AI is generating code from your image...</span>
            </div>
        `;
        codeResult.style.display = 'none';

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('prompt', promptInput.value);

            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            const formattedResponse = formatResponse(data.result);

            // Display the formatted text part
            result.innerHTML = formatText(formattedResponse.text);

            // Display code blocks if any
            if (formattedResponse.codeBlocks.length > 0) {
                displayCodeSnippet(formattedResponse.codeBlocks[0].code);
            }
            
            showNotification('Code generated successfully!', 'success');
        } catch (error) {
            result.innerHTML = `<p class="error">Error: ${error.message}</p>`;
            codeResult.style.display = 'none';
            showNotification(`Code generation failed: ${error.message}`, 'error');
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = 'Generate Code';
        }
    });

    function copyCode() {
        const codeElement = document.querySelector('#codeResult pre code');
        if (codeElement && codeElement.textContent.trim() !== '') {
            const codeText = codeElement.textContent;

            // Copy the code text to the clipboard
            navigator.clipboard.writeText(codeText).then(() => {
                const copyButton = document.querySelector('.copy-btn');
                const copyText = copyButton.querySelector('.copy-text');
                const copyIcon = copyButton.querySelector('i');
                
                // Update button appearance
                copyButton.classList.add('copied');
                copyIcon.classList.remove('fa-copy');
                copyIcon.classList.add('fa-check');
                copyText.textContent = 'Copied!';
                
                showNotification('Code copied to clipboard!', 'success');
                
                // Reset the button after 2 seconds
                setTimeout(() => {
                    copyButton.classList.remove('copied');
                    copyIcon.classList.remove('fa-check');
                    copyIcon.classList.add('fa-copy');
                    copyText.textContent = 'Copy Code';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy code: ', err);
                showNotification('Failed to copy code to clipboard', 'error');
            });
        } else {
            showNotification('No code snippet available to copy', 'warning');
        }
    }

    function displayCodeSnippet(code) {
        const codeContainer = document.querySelector('#codeResult');
        const codeElement = codeContainer.querySelector('pre code');
        
        // Update the code snippet
        codeElement.textContent = code;
    
        // Show the code container
        codeContainer.style.display = 'block';
    
        // Re-highlight the code using Prism.js
        Prism.highlightElement(codeElement);
    }

});
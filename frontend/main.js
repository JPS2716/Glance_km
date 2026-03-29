document.addEventListener('DOMContentLoaded', () => {
    // Redirection Buttons
    const uploadRedirectBtn = document.getElementById('upload-redirect-btn');
    if (uploadRedirectBtn) {
        uploadRedirectBtn.addEventListener('click', () => {
            window.location.href = 'upload.html';
        });
    }

    const fileUpload = document.getElementById('file-upload');
    const confSlider = document.getElementById('conf-slider');
    const confDisplay = document.getElementById('conf-display');

    if (confSlider && confDisplay) {
        confSlider.addEventListener('input', (e) => {
            confDisplay.textContent = (e.target.value / 100).toFixed(2);
        });
    }

    const resultsRedirectBtn = document.getElementById('results-redirect-btn');
    if (resultsRedirectBtn && fileUpload) {
        resultsRedirectBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const files = fileUpload.files;
            if (!files || files.length === 0) {
                alert("Please select a file to detect first.");
                return;
            }
            
            const file = files[0];
            const conf = confSlider ? (confSlider.value / 100) : 0.85;
            
            // UI Update
            const originalText = resultsRedirectBtn.textContent;
            resultsRedirectBtn.textContent = 'Processing...';
            resultsRedirectBtn.classList.add('opacity-70', 'cursor-not-allowed', 'animate-pulse');
            resultsRedirectBtn.disabled = true;

            const formData = new FormData();
            formData.append('file', file);
            
            const isVideo = file.type.startsWith('video/');
            const endpoint = isVideo ? 'http://localhost:8000/detect/video' : 'http://localhost:8000/detect/image';
            
            const urlWithParams = new URL(endpoint);
            urlWithParams.searchParams.append('conf', conf);

            try {
                const response = await fetch(urlWithParams, {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Save to sessionStorage
                sessionStorage.setItem('glanceDetectionResults', JSON.stringify({
                    url: data.output_url,
                    time: data.inference_time_s,
                    detections: data.total_detections !== undefined ? data.total_detections : (data.num_detections || 0),
                    frames: data.total_frames || 1,
                    type: isVideo ? 'video' : 'image',
                    originalName: file.name
                }));
                
                if (window.SupabaseAuth && window.SupabaseAuth.getCurrentUser()) {
                    await window.SupabaseAuth.saveActivity(
                        file.name,
                        data.inference_time_s,
                        data.total_detections !== undefined ? data.total_detections : (data.num_detections || 0),
                        data.output_url
                    );
                }
                
                window.location.href = 'results.html';
            } catch (error) {
                console.error('Detection failed:', error);
                alert("Failed to process the file. Make sure the FastAPI backend is running on port 8000.");
                
                // Reset UI
                resultsRedirectBtn.textContent = originalText;
                resultsRedirectBtn.classList.remove('opacity-70', 'cursor-not-allowed', 'animate-pulse');
                resultsRedirectBtn.disabled = false;
            }
        });
    } else if (resultsRedirectBtn && !fileUpload) {
        resultsRedirectBtn.addEventListener('click', () => {
            window.location.href = 'results.html';
        });
    }

    // Results Page Logic
    const isResultsPage = window.location.pathname.includes('results.html');
    if (isResultsPage) {
        const resultsDataRaw = sessionStorage.getItem('glanceDetectionResults');
        if (resultsDataRaw) {
            const data = JSON.parse(resultsDataRaw);

            // Populate metrics
            const filenameEl = document.getElementById('input-filename');
            if (filenameEl) filenameEl.textContent = data.originalName;

            const speedEl = document.getElementById('metric-speed');
            if (speedEl) speedEl.innerHTML = `${data.time}<span class="text-xs font-normal text-on-surface-variant ml-1">s</span>`;

            const detsEl = document.getElementById('metric-detections');
            if (detsEl) detsEl.textContent = data.detections;

            const framesEl = document.getElementById('metric-frames');
            if (framesEl) framesEl.textContent = data.frames;

            const latencyEl = document.getElementById('metric-latency');
            if (latencyEl) latencyEl.textContent = `${data.time}s`;

            // Populate media
            const mediaContainer = document.getElementById('output-media-container');
            if (mediaContainer && data.url) {
                mediaContainer.innerHTML = ''; // clear old setup
                if (data.type === 'video') {
                    const videoEl = document.createElement('video');
                    videoEl.src = data.url;
                    videoEl.controls = true;
                    videoEl.autoplay = true;
                    videoEl.loop = true;
                    videoEl.muted = true;
                    videoEl.className = 'w-full h-auto object-cover rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]';
                    mediaContainer.appendChild(videoEl);
                } else {
                    const imgEl = document.createElement('img');
                    imgEl.src = data.url;
                    imgEl.alt = 'Detection Output';
                    imgEl.className = 'w-full h-auto object-cover rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]';
                    mediaContainer.appendChild(imgEl);
                }
            }

            // Download and Share functionality
            const downloadBtn = document.getElementById('download-btn');
            if (downloadBtn && data.url) {
                downloadBtn.addEventListener('click', async () => {
                    try {
                        // Prevent multiple clicks and show loading state
                        const originalHTML = downloadBtn.innerHTML;
                        downloadBtn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">sync</span>';
                        downloadBtn.disabled = true;

                        // Fetch the file as a Blob to force download without navigating
                        const response = await fetch(data.url);
                        if (!response.ok) throw new Error('Network response was not ok');
                        const blob = await response.blob();
                        const blobUrl = window.URL.createObjectURL(blob);

                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = blobUrl;
                        // Provide a filename based on original or fallback
                        a.download = `Glance_Output_${data.originalName || 'file'}`;
                        
                        // Trigger download
                        document.body.appendChild(a);
                        a.click();
                        
                        // Clean up
                        window.URL.revokeObjectURL(blobUrl);
                        document.body.removeChild(a);

                        // Restore button
                        downloadBtn.innerHTML = originalHTML;
                        downloadBtn.disabled = false;
                    } catch (error) {
                        console.error('Download failed:', error);
                        alert('Download could not be completed automatically. It may be due to cross-origin settings.');
                        
                        // Fallback behavior if fetch fails
                        const a = document.createElement('a');
                        a.href = data.url;
                        a.download = `Glance_Output_${data.originalName || 'file'}`;
                        a.target = '_blank';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);

                        downloadBtn.innerHTML = '<span class="material-symbols-outlined text-sm">download</span>';
                        downloadBtn.disabled = false;
                    }
                });
            }

            const shareBtn = document.getElementById('share-btn');
            if (shareBtn && data.url) {
                shareBtn.addEventListener('click', async () => {
                    try {
                        if (navigator.share) {
                            await navigator.share({
                                title: 'Glance Detection Result',
                                text: 'Check out this detection result from Glance:',
                                url: data.url,
                            });
                        } else {
                            await navigator.clipboard.writeText(data.url);
                            alert('Result URL copied to clipboard!');
                        }
                    } catch (err) {
                        console.error('Error sharing:', err);
                    }
                });
            }
        }
    }

    // Navbar Scroll Spy for index.html
    const uploadSection = document.getElementById('upload-section');
    const contactSection = document.getElementById('contact-section');

    function setActiveNav(targetData) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            // Reset to inactive
            link.classList.remove('font-semibold', 'text-[#a2c9ff]', 'border-[#a2c9ff]/30');
            link.classList.add('hover:text-[#e7e5e5]', 'border-transparent', 'text-[#acabaa]');
            
            // If it's the target, make it active
            if (link.getAttribute('data-target') === targetData) {
                link.classList.remove('hover:text-[#e7e5e5]', 'border-transparent', 'text-[#acabaa]');
                link.classList.add('font-semibold', 'text-[#a2c9ff]', 'border-[#a2c9ff]/30');
            }
        });
    }

    if (uploadSection && contactSection) {
        window.addEventListener('scroll', () => {
            let activeTarget = 'home';
            const uploadTop = uploadSection.offsetTop;
            const contactTop = contactSection.offsetTop;
            const scrollPos = window.scrollY + window.innerHeight / 2.5; // trigger a bit before middle of screen

            if (scrollPos >= contactTop) {
                activeTarget = 'contact';
            } else if (scrollPos >= uploadTop) {
                activeTarget = 'upload';
            }
            
            setActiveNav(activeTarget);
        });
        
        // trigger once on load
        window.dispatchEvent(new Event('scroll'));
    }

    const fileUploadInput = document.getElementById('file-upload');
    const browseBtn = document.getElementById('browse-files-btn');
    const uploadStatusText = document.getElementById('upload-status-text');

    if (fileUploadInput && browseBtn && uploadStatusText) {
        browseBtn.addEventListener('click', () => {
            fileUploadInput.click();
        });
        
        fileUploadInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const fileNames = Array.from(e.target.files).map(f => f.name).join(', ');
                uploadStatusText.textContent = `${e.target.files.length} file(s) selected`;
                uploadStatusText.nextElementSibling.textContent = fileNames;
                browseBtn.textContent = "Change Files";
            } else {
                uploadStatusText.textContent = 'Drop your assets here';
                uploadStatusText.nextElementSibling.textContent = 'Drag and drop high-resolution video or image sequences. Supports .MP4, .MOV, and .TIFF formats.';
                browseBtn.textContent = "Browse Files";
            }
        });
    }

    // Contact form submit logic
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const message = document.getElementById('contact-message').value.trim();

            if (name && email && message) {
                const subject = encodeURIComponent(`Glance Inquiry from ${name}`);
                const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
                
                // Triggers native email client
                window.location.href = `mailto:premsahith.j24@iiits.in?subject=${subject}&body=${body}`;
            }
        });
    }
});

// Demo Image Loader — called when a sample image card is clicked
async function loadDemoImage(imagePath, displayName) {
    const uploadStatusText = document.getElementById('upload-status-text');
    const browseBtn = document.getElementById('browse-files-btn');
    const fileInputEl = document.getElementById('file-upload');

    // Show loading state
    if (uploadStatusText) {
        uploadStatusText.textContent = 'Loading sample...';
        uploadStatusText.style.color = '#a2c9ff';
    }

    try {
        const response = await fetch(imagePath);
        if (!response.ok) throw new Error('Could not fetch demo image.');
        const blob = await response.blob();
        const file = new File([blob], displayName, { type: blob.type || 'image/jpeg' });

        // Inject into the hidden file input using DataTransfer
        const dt = new DataTransfer();
        dt.items.add(file);
        if (fileInputEl) {
            fileInputEl.files = dt.files;
        }

        // Update the UI to reflect the selected file
        if (uploadStatusText) {
            uploadStatusText.textContent = '1 file selected';
            uploadStatusText.style.color = '';
        }
        if (uploadStatusText && uploadStatusText.nextElementSibling) {
            uploadStatusText.nextElementSibling.textContent = displayName;
        }
        if (browseBtn) browseBtn.textContent = 'Change Files';

        // Scroll to the top of the upload zone to show the selection
        const uploadZone = document.querySelector('#browse-files-btn')?.closest('.relative');
        if (uploadZone) uploadZone.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (err) {
        console.error('Demo image load error:', err);
        if (uploadStatusText) {
            uploadStatusText.textContent = 'Failed to load sample. Try browsing manually.';
            uploadStatusText.style.color = '#f87171';
        }
    }
}

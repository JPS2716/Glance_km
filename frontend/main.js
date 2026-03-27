document.addEventListener('DOMContentLoaded', () => {
    // Redirection Buttons
    const uploadRedirectBtn = document.getElementById('upload-redirect-btn');
    if (uploadRedirectBtn) {
        uploadRedirectBtn.addEventListener('click', () => {
            window.location.href = 'upload.html';
        });
    }

    const resultsRedirectBtn = document.getElementById('results-redirect-btn');
    if (resultsRedirectBtn) {
        resultsRedirectBtn.addEventListener('click', () => {
            window.location.href = 'results.html';
        });
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

    // File Upload Functionality for upload.html
    const fileUpload = document.getElementById('file-upload');
    const browseBtn = document.getElementById('browse-files-btn');
    const uploadStatusText = document.getElementById('upload-status-text');

    if (fileUpload && browseBtn && uploadStatusText) {
        browseBtn.addEventListener('click', () => {
            fileUpload.click();
        });
        
        fileUpload.addEventListener('change', (e) => {
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
});

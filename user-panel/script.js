document.addEventListener('DOMContentLoaded', () => {
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    const form = document.getElementById('registrationForm');

    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const successMessage = document.getElementById('successMessage');

    // Navigation
    nextBtn.addEventListener('click', () => {
        // Validate Step 1
        const userName = document.getElementById('userName').value.trim();
        const squadName = document.getElementById('squadName').value.trim();
        const phone = document.getElementById('phoneNumber').value.trim();
        const email = document.getElementById('email').value.trim();

        if (!userName || !squadName || !phone || !email) {
            alert('Please fill all fields in Step 1');
            return;
        }

        // basic email validation
        if (!email.includes('@')) {
            alert('Please enter a valid email ID');
            return;
        }

        step1.classList.remove('active');
        step2.classList.add('active');
    });

    backBtn.addEventListener('click', () => {
        step2.classList.remove('active');
        step1.classList.add('active');
    });

    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!step2.classList.contains('active')) {
            nextBtn.click();
            return;
        }

        const transactionId = document.getElementById('transactionId').value.trim();
        if (!transactionId) {
            alert('Please enter a valid UPI Transaction ID');
            return;
        }

        // Change submit button text while processing
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Processing...';
        submitBtn.disabled = true;

        // Collect all data
        const userData = {
            userName: document.getElementById('userName').value,
            squadName: document.getElementById('squadName').value,
            phone: document.getElementById('phoneNumber').value,
            email: document.getElementById('email').value,
            transactionId: transactionId
        };

        // Define the API URL (works locally or hosted if frontend and backend share same origin/server)
        const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:5000'
            : ''; // For production, assuming backend serves the frontend or they share the same base URL

        try {
            // Send Data to MongoDB Backend
            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const result = await response.json();
                if (response.ok) {
                    // Show Success
                    step2.classList.remove('active');
                    successMessage.classList.add('active');
                } else {
                    alert('Registration failed: ' + (result.error || 'Please try again.'));
                }
            } else {
                const textResult = await response.text();
                console.error("Non-JSON response:", textResult);
                alert(`Server returned an error (${response.status}): ` + textResult.substring(0, 100));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Could not connect to server. Please check your internet or try again later: ' + error.message);
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });

    // Emoji Picker Logic
    const emojiMainBtn = document.getElementById('emojiMainBtn');
    const emojiMenu = document.getElementById('emojiMenu');
    const emojiBtns = document.querySelectorAll('.emoji-btn');

    if (emojiMainBtn && emojiMenu) {
        emojiMainBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            emojiMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!emojiMainBtn.contains(e.target) && !emojiMenu.contains(e.target)) {
                emojiMenu.classList.remove('active');
            }
        });

        emojiBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const emoji = e.target.getAttribute('data-emoji') || e.target.innerText;
                createFlyingEmoji(emoji, e.clientX, e.clientY);
                emojiMenu.classList.remove('active');

                // Optional: set main button icon to last clicked emoji
                const mainIcon = emojiMainBtn.querySelector('.emoji-icon');
                if (mainIcon) mainIcon.innerText = emoji;
            });
        });
    }

    function createFlyingEmoji(emoji, x, y) {
        const flyingEmoji = document.createElement('div');
        flyingEmoji.innerText = emoji;
        flyingEmoji.classList.add('flying-emoji');

        // Randomize slight horizontal movement (-50px to +50px)
        const randomX = (Math.random() - 0.5) * 100;

        flyingEmoji.style.left = `${x}px`;
        flyingEmoji.style.top = `${y}px`;
        flyingEmoji.style.setProperty('--x-move', `${randomX}px`);

        document.body.appendChild(flyingEmoji);

        // Remove element after animation finishes
        setTimeout(() => {
            flyingEmoji.remove();
        }, 1000);
    }
});

// Carousel Slider Logic (Global Scope for onclick accessing)
let slideIndex = 0;
let carouselTimer;

function initCarousel() {
    showSlides(slideIndex);
    startCarouselTimer();
}

function startCarouselTimer() {
    carouselTimer = setInterval(() => {
        moveCarousel(1);
    }, 4000); // Auto-slide every 4 seconds
}

function resetCarouselTimer() {
    clearInterval(carouselTimer);
    startCarouselTimer();
}

function moveCarousel(n) {
    showSlides(slideIndex += n);
    resetCarouselTimer();
}

function currentSlide(n) {
    showSlides(slideIndex = n);
    resetCarouselTimer();
}

function showSlides(n) {
    const slides = document.querySelectorAll(".carousel-item");
    const dots = document.querySelectorAll(".dot");

    if (!slides.length) return;

    if (n >= slides.length) { slideIndex = 0 }
    if (n < 0) { slideIndex = slides.length - 1 }

    slides.forEach(slide => slide.classList.remove("active"));
    dots.forEach(dot => dot.classList.remove("active"));

    slides[slideIndex].classList.add("active");
    if (dots[slideIndex]) dots[slideIndex].classList.add("active");
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    setupNavigation();
    setupHelpForm();
});

// Sidebar and Modal Navigation Logic
function setupNavigation() {
    const menuBtn = document.getElementById('menuToggleBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const sideMenu = document.getElementById('sideNavigation');
    const sideOverlay = document.getElementById('sideMenuOverlay');

    const openBlogBtn = document.getElementById('openBlogModal');
    const openSquadsBtn = document.getElementById('openSquadsModal');
    const openHelpBtn = document.getElementById('openHelpModal');

    // Toggle Menu
    function toggleMenu() {
        sideMenu.classList.toggle('open');
        sideOverlay.classList.toggle('open');
    }

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
    if (sideOverlay) sideOverlay.addEventListener('click', toggleMenu);

    // Modals
    if (openBlogBtn) {
        openBlogBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMenu(); // Close side menu
            document.getElementById('blogModal').classList.add('active');
        });
    }

    if (openSquadsBtn) {
        openSquadsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMenu();
            populateRegisteredSquads();
            document.getElementById('squadsModal').classList.add('active');
        });
    }

    if (openHelpBtn) {
        openHelpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMenu();
            document.getElementById('helpModal').classList.add('active');
        });
    }
}

// Populate the Registered Squads from MongoDB Backend
async function populateRegisteredSquads() {
    const squadListContainer = document.getElementById('registeredSquadsList');
    if (!squadListContainer) return;

    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '';
    squadListContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">Fetching from server...</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/api/squads`);
        const registrations = await response.json();

        squadListContainer.innerHTML = ''; // Clear previous content

        if (!registrations || registrations.length === 0) {
            squadListContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">No squads registered yet. Be the first!</p>';
            return;
        }

        registrations.forEach(reg => {
            const item = document.createElement('div');
            item.classList.add('squad-item');

            let squadName = reg.squadName || 'Unknown Squad';
            let captainName = reg.userName || 'Unknown Captain';

            item.innerHTML = `
                <div class="squad-item-details">
                    <strong>🛡️ ${squadName}</strong>
                    <span>Captain: ${captainName}</span>
                </div>
                <div>
                    <span style="color: var(--primary); font-size: 1.2rem;">✓</span>
                </div>
            `;
            squadListContainer.appendChild(item);
        });
    } catch (error) {
        console.error('Error fetching squads:', error);
        squadListContainer.innerHTML = '<p style="text-align: center; color: red; padding: 20px;">Failed to load squads. Server might be down.</p>';
    }
}

// Blog Media Carousel Logic
let blogSlideIndex = 0;

function showBlogSlides(n) {
    const slides = document.querySelectorAll(".blog-carousel-item");
    if (!slides.length) return;

    if (n >= slides.length) { blogSlideIndex = 0 }
    if (n < 0) { blogSlideIndex = slides.length - 1 }

    slides.forEach(slide => {
        slide.classList.remove("active");
        // Pause video if it's hidden
        if (slide.tagName === 'VIDEO') {
            slide.pause();
        }
    });

    const activeSlide = slides[blogSlideIndex];
    activeSlide.classList.add("active");

    // Play video if it becomes active
    if (activeSlide.tagName === 'VIDEO') {
        activeSlide.currentTime = 0;
        activeSlide.play().catch(e => console.log("Auto-play prevented by browser"));
    }
}

function moveBlogCarousel(n) {
    showBlogSlides(blogSlideIndex += n);
}

document.addEventListener('DOMContentLoaded', () => {
    const blogVideos = document.querySelectorAll(".blog-carousel-item");
    blogVideos.forEach(video => {
        if (video.tagName === 'VIDEO') {
            video.addEventListener('ended', () => {
                moveBlogCarousel(1);
            });
        }
    });
});

// Help Form & Queries Logic
function setupHelpForm() {
    const helpForm = document.getElementById('helpForm');
    if (!helpForm) return;

    helpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('helpName').value.trim();
        const number = document.getElementById('helpNumber').value.trim();
        const query = document.getElementById('helpQuery').value.trim();

        if (!name || !number || !query) return;

        const newQuery = {
            id: Date.now().toString(),
            name: name,
            number: number,
            query: query,
            timestamp: new Date().toLocaleString()
        };

        let queries = JSON.parse(localStorage.getItem('esports_queries')) || [];
        queries.unshift(newQuery); // add to top
        localStorage.setItem('esports_queries', JSON.stringify(queries));

        // Show success, close modal slightly after, and update landing page
        const successMsg = document.getElementById('helpSuccessMsg');
        successMsg.style.display = 'block';

        setTimeout(() => {
            document.getElementById('helpModal').classList.remove('active');
            helpForm.reset();
            successMsg.style.display = 'none';
        }, 1500);
    });
}

// Simple text escape for safety
function htmlEscape(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}


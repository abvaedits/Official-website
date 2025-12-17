document.addEventListener('DOMContentLoaded', () => {

    // --- Core Element Selections ---
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section');
    const homeText = document.querySelector('#home .text');
    const typewriterElement = document.getElementById('expertise-text'); 
    const scrollTopBtn = document.querySelector('.scrolltotop');

    // Mobile Menu elements
    const menuToggle = document.querySelector('.navbar-toggle');
    const navMenu = document.querySelector('.navbar-menu');
    const navLinks = document.querySelectorAll('.navbar-menu a');
    const body = document.body;

    let isScrolling = false; 
    let scrollTicking = false; 

    // ----------------------------------------------------------------------
    // 🖱️ --- Custom Cursor Follower Logic (LIMITED MOVEMENT) --- 🖱️
    // ----------------------------------------------------------------------
    const customCursor = document.getElementById('custom-cursor');
    
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    
    // Easing Factor: 1 (fast tracking)
    const easingFactor = 1; 

    document.addEventListener('mousemove', (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
    });

    function animateCustomCursor() {
        currentX += (targetX - currentX) * easingFactor;
        currentY += (targetY - currentY) * easingFactor;
        
        if (customCursor) {
            // Using translate3d() for hardware acceleration
            customCursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
        }
        
        requestAnimationFrame(animateCustomCursor);
    }

    if (customCursor) {
        animateCustomCursor();
    }
    // ----------------------------------------------------------------------
    
    // ----------------------------------------------------------------------
    // ✨ --- SCROLL JIGGLE / SLIGHT PARALLAX EFFECT --- ✨
    // ----------------------------------------------------------------------
    const applyScrollJiggle = () => {
        if (homeText) {
            const scrollY = window.scrollY; 
            
            // Calculate a small vertical offset (10% of scroll amount)
            const offset = scrollY * 0.1; 
            
            // Limit the movement range to a maximum of 30px
            const limitedOffset = Math.min(Math.max(offset, 0), 30); 

            // Apply the transformation
            homeText.style.transform = `translate3d(0, ${-limitedOffset}px, 0)`;
        }
    };
    
    // ----------------------------------------------------------------------
    
    // --- Glitch Fix: Native Scroll Suppression ---
    const preventNativeScroll = (e) => {
        if (isScrolling) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    const enableNativeScroll = () => {
        document.removeEventListener('wheel', preventNativeScroll, { passive: false });
        document.removeEventListener('touchmove', preventNativeScroll, { passive: false });
        isScrolling = false;
    };

    const disableNativeScroll = () => {
        document.addEventListener('wheel', preventNativeScroll, { passive: false });
        document.addEventListener('touchmove', preventNativeScroll, { passive: false });
        isScrolling = true;
    };

    // ----------------------------------------------------------------------
    // --- 0. Custom Smooth Scroll Function ---
    // ----------------------------------------------------------------------
    const customSmoothScroll = (targetPosition, duration) => {
        if (isScrolling) return;

        disableNativeScroll(); 

        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        let startTime = null;

        // Easing function for Fast Start, Slow End (Ease-Out Cubic)
        const easeOutCubic = (t) => {
            return (--t) * t * t + 1;
        };

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;

            const progress = easeOutCubic(Math.min(1, timeElapsed / duration));

            window.scrollTo(0, startPosition + distance * progress);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                window.scrollTo(0, targetPosition);
                enableNativeScroll(); 
            }
        }
        requestAnimationFrame(animation);
    };

    // --- 1. Initial Home Text Load Animation ---
    if (homeText) {
        setTimeout(() => {
            homeText.classList.add('loaded');
        }, 100);
    }

    // --- 2. Mobile Menu Toggle Logic (Side Drawer) ---
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        body.classList.toggle('menu-open'); // Toggles the body class for the overlay/dimming effect
    });

    // --- 2.1. Navigation Link Click (Custom Scroll) ---
    const scrollDuration = 700; 

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href && href.startsWith('#')) {
                e.preventDefault();

                const targetElement = document.querySelector(href);
                if (targetElement) {
                    const offset = navbar ? navbar.offsetHeight : 80;
                    const targetPosition = targetElement.offsetTop - offset;

                    customSmoothScroll(targetPosition, scrollDuration);
                }
            }

            // Menu closing logic (Only on mobile, check by menu state)
            if (navMenu.classList.contains('active') && window.innerWidth <= 768) {
                // Slight delay to allow smooth scroll start before closing the side menu
                setTimeout(() => {
                        navMenu.classList.remove('active');
                        menuToggle.classList.remove('active');
                        body.classList.remove('menu-open');
                }, 300);
            }
        });
    });

    // ----------------------------------------------------------------------
    // --- 3. Scroll Event Handler (Scroll Spy & Navbar Shadow) ---
    // ----------------------------------------------------------------------
    const handleScrollEvents = () => {
        // A. Scroll Spy Logic
        if (!isScrolling) {
            let current = '';
            const navHeight = navbar ? navbar.offsetHeight : 80;
            sections.forEach(section => {
                const sectionTop = section.offsetTop - navHeight;
                if (window.scrollY >= sectionTop - 1) { 
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(a => {
                a.classList.remove('active');
                if (a.getAttribute('href') && a.getAttribute('href').substring(1) === current) {
                    a.classList.add('active');
                }
            });
        }

        // B. Navbar Scroll Shadow/Top Button Visibility Logic
        if (window.scrollY > 50) {
            navbar && navbar.classList.add('scrolled');
            navMenu && navMenu.classList.add('scrolled');
            scrollTopBtn && scrollTopBtn.classList.add('visible');
        } else {
            navbar && navbar.classList.remove('scrolled');
            navMenu && navMenu.classList.remove('scrolled');
            scrollTopBtn && scrollTopBtn.classList.remove('visible');
        }
        
        // C. Apply the new Scroll Jiggle effect (called on every scroll event)
        applyScrollJiggle();
    };
    
    // FIX: Throttle the scroll listener using requestAnimationFrame
    const throttleScrollEvents = () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                handleScrollEvents();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    };

    window.addEventListener('scroll', throttleScrollEvents);
    handleScrollEvents(); // Initial run on load

    // Scroll-to-Top Button Logic (Uses custom smooth scroll)
    scrollTopBtn?.addEventListener('click', function() {
        customSmoothScroll(0, 500);
    });


    // --- 4. General Scroll Animation Observer ---
    const generalObserverOptions = { threshold: 0.05 };

    const generalObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, generalObserverOptions);

    document.querySelectorAll(
        '.card, .cardo, .leader-card, .service-category, .contact-form, ' +
        '#services h1, .leadership-section h1, .project-gallery-section h2, .gallery-item'
    ).forEach(element => {
        generalObserver.observe(element);
    });

    // --- 5. Typewriter Effect Logic (Core Expertise) ---
    if (typewriterElement) {
        const coreValues = [
            "Front-end Development (HTML/CSS/JS)", 
            "Responsive Web Design", 
            "Advanced Video Editing",
        ];
        let valueIndex = 0;
        const delayBeforeNext = 1500;
        const typingSpeed = 100;
        const deletingSpeed = 50;
        let isTyping = false;
        let observerTriggered = false;
        
        // CSS Class used for the blinking caret effect
        const CARET_CLASS = 'caret-active'; 

        function typeValue(text, callback) {
            let i = 0;
            isTyping = true;
            
            const typingInterval = setInterval(() => {
                if (i < text.length) {
                    typewriterElement.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typingInterval);
                    isTyping = false;
                    setTimeout(callback, delayBeforeNext);
                }
            }, typingSpeed);
        }

        function deleteValue(callback) {
            let text = typewriterElement.textContent;
            isTyping = true;
            
            const deletingInterval = setInterval(() => {
                if (text.length > 0) {
                    text = text.substring(0, text.length - 1);
                    typewriterElement.textContent = text;
                } else {
                    clearInterval(deletingInterval);
                    isTyping = false;
                    setTimeout(callback, 500);
                }
            }, deletingSpeed);
        }

        function startTypewriter() {
            if (!isTyping) {
                // Apply the caret class once at the start to ensure blinking while typing
                typewriterElement.classList.add(CARET_CLASS); 

                const value = coreValues[valueIndex];
                typeValue(value, () => {
                    deleteValue(() => {
                        valueIndex = (valueIndex + 1) % coreValues.length;
                        startTypewriter();
                    });
                });
            }
        }

        // Start the typewriter when the #about section becomes visible
        const typewriterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !observerTriggered) {
                    observerTriggered = true;
                    startTypewriter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        const aboutSection = document.getElementById('about');
        aboutSection && typewriterObserver.observe(aboutSection);
    }

    // ----------------------------------------------------------------------
    // ✋ --- Cursor Expansion on ALL Interactive Elements (FIXED) --- ✋
    // ----------------------------------------------------------------------

    const interactiveElements = document.querySelectorAll(
        'a, button, .home-cta, .card-button, .get-quote-btn, .submit-button, .navbar-toggle'
    );

    // Select the main containers for the bottom of the page
    const contactSection = document.getElementById('contact');
    const footerElement = document.querySelector('footer');

    if (customCursor) {
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                customCursor.classList.add('cursor-expanded');
            });
            element.addEventListener('mouseleave', () => {
                customCursor.classList.remove('cursor-expanded');
            });
        });

        // FIX 1: Add general cleanup listeners to the main bottom sections
        if (contactSection) {
            contactSection.addEventListener('mouseleave', () => {
                customCursor.classList.remove('cursor-expanded');
            });
        }
        if (footerElement) {
            footerElement.addEventListener('mouseleave', () => {
                customCursor.classList.remove('cursor-expanded');
            });
        }

        // FIX 2: Global Body Cleanup Listener (Final Fallback)
        // This checks on mousemove if the cursor is expanded but NOT over an interactive element.
        document.body.addEventListener('mousemove', function(e) {
            // Check if the current target is one of the interactive elements
            const isInteractive = Array.from(interactiveElements).some(el => el.contains(e.target));
            
            // If the cursor is expanded but the mouse is over a non-interactive element, contract it.
            if (!isInteractive && customCursor.classList.contains('cursor-expanded')) {
                customCursor.classList.remove('cursor-expanded');
            }
        });
    }

    // ----------------------------------------------------------------------

});

// ----------------------------------------------------------------------
// --- Anchor Smooth Scrolling for Service Cards (Native Centered View) ---
// ----------------------------------------------------------------------
document.querySelectorAll('.service-detail-link').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    });
});

// --- Footer Year Update ---
document.getElementById('current-year').textContent = new Date().getFullYear();

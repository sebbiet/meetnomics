const addPersonBtn = document.getElementById('add-person');
const nameInput = document.getElementById('name-input');
const attendeesList = document.getElementById('attendees-list');
const hourlyCostSpan = document.getElementById('hourly-cost');
const totalCostSpan = document.getElementById('total-cost');
const sendInviteBtn = document.getElementById('send-invite');
const durationSelect = document.getElementById('duration');
const emptyState = document.getElementById('empty-state');
const clearAllBtn = document.getElementById('clear-all');
const attendeeCountSpan = document.getElementById('attendee-count');

let attendees = [];
let activeToasts = [];

// Mobile detection utility
function isMobile() {
    return window.innerWidth <= 768;
}

const randomNames = [
    'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William',
    'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander',
    'Abigail', 'Michael', 'Emily', 'Elijah', 'Elizabeth', 'Daniel', 'Sofia', 'Matthew', 'Avery', 'Joseph',
    'Ella', 'Jackson', 'Madison', 'David', 'Scarlett', 'Carter', 'Victoria', 'Owen', 'Grace', 'Wyatt',
    'Chloe', 'John', 'Camila', 'Jack', 'Penelope', 'Luke', 'Riley', 'Jayden', 'Layla', 'Dylan',
    'Zoey', 'Grayson', 'Nora', 'Levi', 'Lily', 'Isaac', 'Hannah', 'Gabriel', 'Lillian', 'Julian',
    'Addison', 'Mateo', 'Aubrey', 'Anthony', 'Ellie', 'Jaxon', 'Stella', 'Lincoln', 'Natalie', 'Joshua',
    'Zoe', 'Christopher', 'Leah', 'Andrew', 'Hazel', 'Theodore', 'Violet', 'Caleb', 'Aurora', 'Ryan',
    'Savannah', 'Asher', 'Audrey', 'Nathan', 'Brooklyn', 'Thomas', 'Bella', 'Leo', 'Claire', 'Charles',
    'Skylar', 'Jaxson', 'Lucy', 'Roman', 'Paisley', 'Aaron', 'Everly', 'Oliver', 'Anna', 'Connor'
];

function getRandomHourlyRate() {
    return Math.floor(Math.random() * (245 - 47 + 1)) + 47;
}

function getRandomName() {
    const availableNames = randomNames.filter(name => 
        !attendees.find(a => a.name.toLowerCase() === name.toLowerCase())
    );
    if (availableNames.length === 0) return null;
    return availableNames[Math.floor(Math.random() * availableNames.length)];
}

function getInitials(name) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function showToast(amount, isAddition) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${isAddition ? 'add' : 'remove'}`;
    toast.textContent = `${isAddition ? '+' : '-'}$${amount}`;
    
    // Add screen reader announcement
    const announcement = isAddition 
        ? `Added attendee costing $${amount} per hour` 
        : `Removed attendee saving $${amount} per hour`;
    toast.setAttribute('aria-label', announcement);
    
    // Track active toasts
    activeToasts.push(toast);
    
    // On mobile, limit to 3 toasts
    if (isMobile() && activeToasts.length > 3) {
        const oldestToast = activeToasts.shift();
        if (oldestToast && oldestToast.parentElement) {
            oldestToast.classList.add('fade-out');
            setTimeout(() => {
                oldestToast.remove();
            }, 300);
        }
    }
    
    toastContainer.appendChild(toast);
    
    // Remove toast after animation
    const timeoutId = setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            toast.remove();
            // Remove from active toasts array
            const index = activeToasts.indexOf(toast);
            if (index > -1) {
                activeToasts.splice(index, 1);
            }
        }, 300);
    }, 3000);
    
    // Store timeout ID for potential cleanup
    toast.timeoutId = timeoutId;
}

// Generic toast function for notifications
function showNotification(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.setAttribute('aria-label', message);
    
    // Track active toasts
    activeToasts.push(toast);
    
    // On mobile, limit to 3 toasts
    if (isMobile() && activeToasts.length > 3) {
        const oldestToast = activeToasts.shift();
        if (oldestToast && oldestToast.parentElement) {
            oldestToast.classList.add('fade-out');
            setTimeout(() => {
                oldestToast.remove();
            }, 300);
        }
    }
    
    toastContainer.appendChild(toast);
    
    const timeoutId = setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            toast.remove();
            // Remove from active toasts array
            const index = activeToasts.indexOf(toast);
            if (index > -1) {
                activeToasts.splice(index, 1);
            }
        }, 300);
    }, 3000);
    
    // Store timeout ID for potential cleanup
    toast.timeoutId = timeoutId;
}

function addAttendee(name) {
    const attendee = {
        id: Date.now(),
        name: name,
        hourlyRate: getRandomHourlyRate()
    };
    attendees.push(attendee);
    showToast(attendee.hourlyRate, true);
    renderAttendees();
    updateCost();
    
    // Track attendee added
    pushAnalyticsEvent('attendee_added', {
        'attendee_count': attendees.length,
        'hourly_rate': attendee.hourlyRate,
        'is_random_name': !nameInput.value.trim()
    });
}

function removeAttendee(id) {
    const attendee = attendees.find(a => a.id === id);
    if (attendee) {
        showToast(attendee.hourlyRate, false);
    }
    attendees = attendees.filter(a => a.id !== id);
    renderAttendees();
    updateCost();
    
    // Track attendee removed
    pushAnalyticsEvent('attendee_removed', {
        'attendee_count': attendees.length,
        'hourly_rate': attendee ? attendee.hourlyRate : 0
    });
}

function renderAttendees() {
    attendeesList.innerHTML = '';
    
    // Update attendee count
    if (attendees.length > 0) {
        attendeeCountSpan.textContent = `(${attendees.length})`;
    } else {
        attendeeCountSpan.textContent = '';
    }
    
    if (attendees.length === 0) {
        emptyState.style.display = 'block';
        clearAllBtn.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        clearAllBtn.style.display = 'block';
        
        attendees.forEach(attendee => {
            const card = document.createElement('div');
            card.className = 'attendee-card';
            
            const avatar = document.createElement('div');
            avatar.className = 'attendee-avatar';
            avatar.textContent = getInitials(attendee.name);
            
            const info = document.createElement('div');
            info.className = 'attendee-info';
            
            const name = document.createElement('div');
            name.className = 'attendee-name';
            name.textContent = attendee.name;
            
            const rate = document.createElement('div');
            rate.className = 'attendee-rate';
            rate.textContent = `$${attendee.hourlyRate}/hour`;
            
            info.appendChild(name);
            info.appendChild(rate);
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.setAttribute('aria-label', `Remove ${attendee.name} from meeting`);
            removeBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            `;
            removeBtn.onclick = () => removeAttendee(attendee.id);
            
            card.appendChild(avatar);
            card.appendChild(info);
            card.appendChild(removeBtn);
            
            attendeesList.appendChild(card);
        });
    }
}

let lastMilestone = 0;

function getMilestoneMessage() {
    const messages = [
        'Ouch! 😱',
        'Oomph! 😵',
        'Oh my lawd! 🤯',
        'Yikes! 😬',
        'Holy moly! 😲',
        'Good grief! 😰',
        'Sweet mercy! 😅',
        'Heavens! 🫨'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

function checkMilestone(totalCost) {
    const milestone = Math.floor(totalCost / 500) * 500;
    if (milestone > lastMilestone && milestone > 0) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast milestone';
        toast.innerHTML = `${getMilestoneMessage()} <span class="milestone-amount">$${milestone.toLocaleString()}</span>`;
        
        // Add screen reader announcement for milestone
        toast.setAttribute('aria-label', `Meeting cost milestone reached: $${milestone.toLocaleString()}`);
        
        // Track active toasts for milestones
        activeToasts.push(toast);
        
        // On mobile, limit to 3 toasts
        if (isMobile() && activeToasts.length > 3) {
            const oldestToast = activeToasts.shift();
            if (oldestToast && oldestToast.parentElement) {
                oldestToast.classList.add('fade-out');
                setTimeout(() => {
                    oldestToast.remove();
                }, 300);
            }
        }
        
        toastContainer.appendChild(toast);
        
        const timeoutId = setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                toast.remove();
                // Remove from active toasts array
                const index = activeToasts.indexOf(toast);
                if (index > -1) {
                    activeToasts.splice(index, 1);
                }
            }, 300);
        }, 3500);
        
        // Store timeout ID for potential cleanup
        toast.timeoutId = timeoutId;
        
        lastMilestone = milestone;
        
        // Track milestone reached
        pushAnalyticsEvent('milestone_reached', {
            'milestone_amount': milestone,
            'attendee_count': attendees.length,
            'meeting_duration': parseFloat(durationSelect.value)
        });
    } else if (totalCost < lastMilestone - 500) {
        lastMilestone = Math.floor(totalCost / 500) * 500;
    }
}

function updateCost() {
    const hourlyCost = attendees.reduce((sum, attendee) => sum + attendee.hourlyRate, 0);
    const duration = parseFloat(durationSelect.value);
    const totalCost = hourlyCost * duration;
    
    hourlyCostSpan.textContent = hourlyCost.toLocaleString();
    totalCostSpan.textContent = totalCost.toLocaleString();
    
    checkMilestone(totalCost);
}

addPersonBtn.addEventListener('click', () => {
    let name = nameInput.value.trim();
    const wasEmpty = !name;  // Track if input was empty
    
    // If no name entered, pick a random one
    if (!name) {
        name = getRandomName();
        if (!name) {
            showNotification('All names have been used! Please enter a custom name.', 'warning');
            return;
        }
    }
    
    // Check for duplicates
    if (attendees.find(a => a.name.toLowerCase() === name.toLowerCase())) {
        // Show duplicate warning toast
        showNotification(`${name} is already in the meeting!`, 'warning');
        
        nameInput.value = '';
        nameInput.focus();  // Keep focus here since it's an error case
    } else {
        addAttendee(name);
        nameInput.value = '';
        // Only focus if user had typed something OR if on desktop
        if (!wasEmpty || !isMobile()) {
            nameInput.focus();
        }
    }
});

nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addPersonBtn.click();
    }
});

durationSelect.addEventListener('change', () => {
    const previousDuration = durationSelect.dataset.previousValue || '1';
    const newDuration = durationSelect.value;
    
    updateCost();
    
    // Track duration change
    pushAnalyticsEvent('duration_changed', {
        'previous_duration': parseFloat(previousDuration),
        'new_duration': parseFloat(newDuration),
        'attendee_count': attendees.length,
        'total_cost': attendees.reduce((sum, a) => sum + a.hourlyRate, 0) * parseFloat(newDuration)
    });
    
    // Store the new value as previous for next change
    durationSelect.dataset.previousValue = newDuration;
});

// Drawer functionality
const drawer = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const drawerCostSpan = document.getElementById('drawer-cost');
const sendAnywayBtn = document.getElementById('send-anyway');
const emailBestBtn = document.getElementById('email-best');
const closeDrawerBtn = document.getElementById('close-drawer');
const closeSuccessBtn = document.getElementById('close-success');
const warningView = document.getElementById('warning-view');
const toolsView = document.getElementById('tools-view');
const successView = document.getElementById('success-view');

// Privacy drawer elements (declared early for escape key handler)
let privacyDrawer, privacyDrawerOverlay;

function showDrawer() {
    drawer.classList.add('active');
    drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus management for accessibility
    const firstButton = drawer.querySelector('button:not([disabled])');
    if (firstButton) {
        setTimeout(() => firstButton.focus(), 100);
    }
}

function hideDrawer() {
    drawer.classList.remove('active');
    drawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
    // Reset to warning view for next time
    setTimeout(() => {
        warningView.classList.remove('hidden');
        toolsView.classList.add('hidden');
        successView.classList.add('hidden');
    }, 300);
    
    // Return focus to the send invite button
    sendInviteBtn.focus();
}

// Add escape key handler for drawers
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (drawer.classList.contains('active')) {
            hideDrawer();
        } else if (privacyDrawer.classList.contains('active')) {
            hidePrivacyDrawer();
        }
    }
});

function showView(viewToShow) {
    [warningView, toolsView, successView].forEach(view => {
        view.classList.add('hidden');
    });
    viewToShow.classList.remove('hidden');
}

sendInviteBtn.addEventListener('click', () => {
    if (attendees.length === 0) {
        showNotification('Please add at least one attendee!', 'warning');
        return;
    }
    
    const duration = parseFloat(durationSelect.value);
    const totalCost = attendees.reduce((sum, attendee) => sum + attendee.hourlyRate, 0) * duration;
    
    drawerCostSpan.textContent = totalCost.toLocaleString();
    showDrawer();
    
    // Track schedule meeting clicked
    pushAnalyticsEvent('schedule_meeting_clicked', {
        'total_cost': totalCost,
        'attendee_count': attendees.length,
        'meeting_duration': duration
    });
});

sendAnywayBtn.addEventListener('click', () => {
    showView(successView);
    
    // Track send anyway clicked
    const duration = parseFloat(durationSelect.value);
    const totalCost = attendees.reduce((sum, attendee) => sum + attendee.hourlyRate, 0) * duration;
    
    pushAnalyticsEvent('send_anyway_clicked', {
        'total_cost': totalCost,
        'attendee_count': attendees.length,
        'meeting_duration': duration
    });
});

emailBestBtn.addEventListener('click', () => {
    showView(toolsView);
    
    // Track email better clicked
    const duration = parseFloat(durationSelect.value);
    const totalCost = attendees.reduce((sum, attendee) => sum + attendee.hourlyRate, 0) * duration;
    
    pushAnalyticsEvent('email_better_clicked', {
        'total_cost': totalCost,
        'attendee_count': attendees.length,
        'meeting_duration': duration
    });
});

closeDrawerBtn.addEventListener('click', hideDrawer);
closeSuccessBtn.addEventListener('click', hideDrawer);
drawerOverlay.addEventListener('click', hideDrawer);

// Prevent drawer close when clicking inside
drawer.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Accordion functionality
function toggleAccordion(button) {
    const faqItem = button.parentElement;
    const allItems = document.querySelectorAll('.faq-item');
    const isExpanded = faqItem.classList.contains('active');
    
    // Close all other accordions
    allItems.forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('active');
            item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        }
    });
    
    // Toggle current accordion
    faqItem.classList.toggle('active');
    button.setAttribute('aria-expanded', !isExpanded);
    
    // Track FAQ accordion interaction
    if (!isExpanded) {
        const questionText = button.querySelector('span').textContent;
        pushAnalyticsEvent('faq_expanded', {
            'question': questionText
        });
    }
}

// Add keyboard support for accordions
document.addEventListener('DOMContentLoaded', () => {
    // Set initial ARIA states for accordions
    document.querySelectorAll('.faq-question').forEach(button => {
        button.setAttribute('aria-expanded', 'false');
        
        // Add keyboard event handling
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleAccordion(button);
            }
        });
    });
});

// Testimonials
const testimonials = [
    { quote: "Saved $50K by replacing our daily standups with a Slack emoji", author: "- Tech Lead" },
    { quote: "Now I calculate meeting costs before accepting. My calendar is finally empty!", author: "- Senior Developer" },
    { quote: "Discovered our 'quick sync' costs more than my car payment", author: "- Project Manager" },
    { quote: "Showed this to my boss. Now we have 'no meeting Fridays'", author: "- Team Lead" },
    { quote: "Our 2-hour sprint planning was costing $3,200. Now it's 30 minutes.", author: "- Scrum Master" },
    { quote: "Cancelled our weekly all-hands. Bought a coffee machine instead. Team morale up 300%", author: "- CEO" },
    { quote: "Realised I was in $10K worth of meetings per week. I quit. Best decision ever.", author: "- Ex-Middle Manager" },
    { quote: "We now charge meeting costs to project budgets. Meetings down 67%", author: "- Finance Director" },
    { quote: "My 'quick question' meetings were costing $400. Now I use Slack.", author: "- Junior Developer" },
    { quote: "Implemented meeting budgets. Suddenly everyone loves async communication.", author: "- VP Engineering" },
    { quote: "Our daily standup cost analysis made us switch to written updates", author: "- Product Owner" },
    { quote: "Turns out our brainstorming sessions cost more than hiring consultants", author: "- Creative Director" },
    { quote: "Meeting-free Mondays saved us $200K annually. Who knew?", author: "- COO" },
    { quote: "Now I send meeting cost estimates with calendar invites. 80% get declined.", author: "- Executive Assistant" },
    { quote: "Our retrospectives were costing $1,500. Now we do surveys.", author: "- Agile Coach" },
    { quote: "Replaced status meetings with a dashboard. Saved 400 hours per month.", author: "- Operations Manager" },
    { quote: "The quarterly planning meeting was $25K. We switched to Notion.", author: "- Strategy Lead" },
    { quote: "My team's 'coffee chats' were costing $300 each. We just get coffee now.", author: "- HR Manager" },
    { quote: "Discovered we spent $85K last year deciding on a $10K project", author: "- PMO Director" },
    { quote: "Cut meeting times by 50%. Productivity up 200%. Math checks out.", author: "- Data Analyst" },
    { quote: "Our 'alignment meetings' cost more than our misalignment ever did", author: "- Department Head" },
    { quote: "Started billing internal meetings. Meeting requests dropped 90%.", author: "- IT Director" },
    { quote: "The irony: spent $5K in meetings to save $500 on software", author: "- Procurement Manager" },
    { quote: "Now every meeting needs a cost-benefit analysis. Spoiler: most fail.", author: "- CFO" },
    { quote: "Replaced our 1-on-1s with walking meetings. Cheaper and healthier.", author: "- Team Manager" },
    { quote: "Our 'quick huddles' were $600. Quick indeed.", author: "- Sales Manager" },
    { quote: "Meeting FOMO cured after seeing the price tag", author: "- Marketing Coordinator" },
    { quote: "We gamified meeting reduction. Winner gets the savings as bonus.", author: "- Startup Founder" },
    { quote: "Client meetings only now. Internal meetings are emails.", author: "- Consultant" },
    { quote: "Mandatory meeting cost field in our booking system. Game changer.", author: "- Office Manager" },
    { quote: "Our architecture review meetings cost more than rebuilding the system", author: "- Principal Engineer" },
    { quote: "15-minute default meeting length. Saved a fortune.", author: "- Time Management Coach" },
    { quote: "Meeting budget tied to performance reviews. Behavior changed overnight.", author: "- HR Director" },
    { quote: "Async-first policy after seeing meeting costs. Never going back.", author: "- Remote Team Lead" },
    { quote: "We were literally meeting ourselves into bankruptcy", author: "- Startup CTO" },
    { quote: "Now I ask: 'Is this meeting worth $X?' The answer is usually no.", author: "- Project Coordinator" },
    { quote: "Replaced demos with recorded videos. Saved $30K quarterly.", author: "- Sales Engineer" },
    { quote: "Our decision-making meetings cost more than the decisions", author: "- Board Member" },
    { quote: "Meeting-cost awareness training mandatory. Calendars cleared up fast.", author: "- L&D Manager" },
    { quote: "The real MVP: whoever invented the decline button", author: "- Developer" },
    { quote: "Status meetings banned. Status is now a Slack channel.", author: "- Engineering Manager" },
    { quote: "We spent $12K deciding on free pizza vs free bagels", author: "- Admin Assistant" },
    { quote: "Introduced 'meeting bankruptcy' - cancel everything and start fresh", author: "- Productivity Consultant" },
    { quote: "Our kickoff meeting cost more than the project budget", author: "- Freelancer" },
    { quote: "Now we calculate ROI before scheduling. Most meetings don't have one.", author: "- Business Analyst" },
    { quote: "Meeting-free mornings = 40% productivity boost", author: "- Research Lead" },
    { quote: "Discovered our sync meetings were very out of sync with our budget", author: "- Finance Analyst" },
    { quote: "Replaced committee meetings with a shared doc. Decisions 10x faster.", author: "- Director" },
    { quote: "Meeting cost awareness: the best productivity hack since coffee", author: "- Startup Employee" },
    { quote: "We were having meetings about having too many meetings. The irony.", author: "- Self-Aware Manager" }
];

let currentTestimonialIndex = 0;

function showNextTestimonial() {
    const testimonialElement = document.getElementById('testimonial');
    const quoteElement = testimonialElement.querySelector('.testimonial-quote');
    const authorElement = testimonialElement.querySelector('.testimonial-author');
    
    // Exit animation
    testimonialElement.classList.add('exit');
    testimonialElement.classList.remove('active');
    
    setTimeout(() => {
        // Update content
        const testimonial = testimonials[currentTestimonialIndex];
        quoteElement.textContent = `"${testimonial.quote}"`;
        authorElement.textContent = testimonial.author;
        
        // Reset position and enter
        testimonialElement.classList.remove('exit');
        setTimeout(() => {
            testimonialElement.classList.add('active');
        }, 50);
        
        // Move to next testimonial
        currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
    }, 600);
}

// Start testimonial rotation
setTimeout(() => {
    showNextTestimonial();
    setInterval(showNextTestimonial, 5000);
}, 1000);

// Clear all button functionality
clearAllBtn.addEventListener('click', () => {
    if (attendees.length > 0) {
        const confirmMessage = `Clear all ${attendees.length} attendees? This will remove $${attendees.reduce((sum, a) => sum + a.hourlyRate, 0).toLocaleString()}/hour from the meeting cost.`;
        
        // Create a custom confirmation toast
        const toastContainer = document.getElementById('toast-container');
        const confirmToast = document.createElement('div');
        confirmToast.className = 'toast confirm';
        confirmToast.innerHTML = `
            <div class="confirm-message">${confirmMessage}</div>
            <div class="confirm-buttons">
                <button class="confirm-yes">Yes, Clear All</button>
                <button class="confirm-no">Cancel</button>
            </div>
        `;
        
        toastContainer.appendChild(confirmToast);
        
        const yesBtn = confirmToast.querySelector('.confirm-yes');
        const noBtn = confirmToast.querySelector('.confirm-no');
        
        yesBtn.addEventListener('click', () => {
            // Calculate total cost being removed
            const totalRemoved = attendees.reduce((sum, a) => sum + a.hourlyRate, 0);
            const attendeeCount = attendees.length;
            
            // Clear all attendees
            attendees = [];
            renderAttendees();
            updateCost();
            
            // Show removal toast
            showToast(totalRemoved, false);
            
            // Track clear all clicked
            pushAnalyticsEvent('clear_all_clicked', {
                'attendees_cleared': attendeeCount,
                'total_hourly_cost_cleared': totalRemoved
            });
            
            // Remove confirmation toast
            confirmToast.remove();
        });
        
        noBtn.addEventListener('click', () => {
            confirmToast.remove();
        });
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (confirmToast.parentElement) {
                confirmToast.remove();
            }
        }, 10000);
    }
});

// Mobile menu functionality
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileNav = document.getElementById('mobile-nav');

mobileMenuToggle.addEventListener('click', () => {
    mobileNav.classList.toggle('active');
    const isExpanded = mobileNav.classList.contains('active');
    mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
    
    // Update icon
    const svg = mobileMenuToggle.querySelector('svg path');
    if (isExpanded) {
        svg.setAttribute('d', 'M6 6L18 18M18 6L6 18');
    } else {
        svg.setAttribute('d', 'M3 12H21M3 6H21M3 18H21');
    }
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
    });
});

// Footer link smooth scrolling
document.querySelectorAll('.footer-link, .footer-cta-button').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                // Calculate the target position accounting for header
                const headerHeight = document.querySelector('header.header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                // Disable observer temporarily to prevent conflicts
                if (statsObserver && footerStats) {
                    statsObserver.unobserve(footerStats);
                }
                
                // Scroll to the target
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Re-enable observer after scrolling is complete
                setTimeout(() => {
                    if (statsObserver && footerStats) {
                        statsObserver.observe(footerStats);
                    }
                }, 1000);
            }
        }
    });
});

// Animate footer stat counter
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = `$${(current / 1000000).toFixed(1)}M`;
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = `$${(target / 1000000).toFixed(1)}M`;
        }
    };
    
    updateCounter();
}

// Animate stats when footer comes into view
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

// Make these variables available globally for the footer link handler
let statsObserver;
let footerStats;

statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.stat-number');
            if (statNumber && !statNumber.animated) {
                statNumber.animated = true;
                animateCounter(statNumber, 2500000); // $2.5M
            }
        }
    });
}, observerOptions);

footerStats = document.querySelector('.footer-stats');
if (footerStats) {
    statsObserver.observe(footerStats);
}

// Cookie Consent and Analytics
const cookieConsent = document.getElementById('cookie-consent');
const acceptBtn = document.getElementById('accept-cookies');
const declineBtn = document.getElementById('decline-cookies');
const cookieSettingsLink = document.getElementById('cookie-settings');
const privacyLink = document.getElementById('privacy-link');

// Check if user has already made a choice
function checkConsent() {
    const consent = localStorage.getItem('analytics-consent');
    const hasSeenBanner = localStorage.getItem('consent-banner-seen');
    
    // Only show banner if user hasn't seen it before and hasn't made a choice
    if (!hasSeenBanner && !consent && !navigator.doNotTrack && !window.doNotTrack) {
        cookieConsent.classList.add('show');
    }
}

// Initialize dataLayer if it doesn't exist
window.dataLayer = window.dataLayer || [];

// Push events to dataLayer (works even if GTM isn't loaded)
function pushAnalyticsEvent(eventName, parameters = {}) {
    if (localStorage.getItem('analytics-consent') === 'accepted') {
        window.dataLayer.push({
            'event': eventName,
            ...parameters
        });
    }
}

// Handle accept
acceptBtn.addEventListener('click', () => {
    localStorage.setItem('analytics-consent', 'accepted');
    localStorage.setItem('consent-banner-seen', 'true');
    cookieConsent.classList.remove('show');
    
    // Reload page to load GTM
    window.location.reload();
});

// Handle decline
declineBtn.addEventListener('click', () => {
    localStorage.setItem('analytics-consent', 'declined');
    localStorage.setItem('consent-banner-seen', 'true');
    cookieConsent.classList.remove('show');
});

// Handle cookie settings
if (cookieSettingsLink) {
    cookieSettingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        cookieConsent.classList.add('show');
    });
}

// Privacy Drawer functionality
privacyDrawer = document.getElementById('privacy-drawer');
privacyDrawerOverlay = document.getElementById('privacy-drawer-overlay');
const poemContent = document.getElementById('poem-content');
const privacyRefreshBtn = document.getElementById('privacy-refresh');
const closePrivacyBtn = document.getElementById('close-privacy');

// Privacy poems collection
const privacyPoems = [
    {
        type: 'haiku',
        content: `Counting visitors,<br>
                 No names, just happy numbers,<br>
                 Your secrets are safe.`
    },
    {
        type: 'limerick',
        content: `There once was a site tracking views,<br>
                 Just numbers, no personal clues,<br>
                 We count every click,<br>
                 But nothing too slick,<br>
                 Just seeing who loves to peruse!`
    },
    {
        type: 'modern',
        content: `We track, but we're not creepy,<br>
                 Just counting sheep (visitors) to stay sleepy,<br>
                 Page views and button clicks,<br>
                 That's all our analytics picks,<br>
                 Your data stays yours to keep-y!`
    },
    {
        type: 'haiku',
        content: `Analytics here,<br>
                 Like counting stars, not stalking,<br>
                 Just pure visitor joy.`
    },
    {
        type: 'rhyme',
        content: `Roses are red,<br>
                 Violets are blue,<br>
                 We count our visitors,<br>
                 But we don't track YOU!`
    },
    {
        type: 'modern',
        content: `Dear visitor, please don't stress,<br>
                 Our tracking is minimal, we confess,<br>
                 Just tallying views to impress,<br>
                 The VCs who fund this beautiful mess!`
    },
    {
        type: 'haiku',
        content: `Numbers dancing high,<br>
                 Anonymous and carefree,<br>
                 Privacy intact.`
    },
    {
        type: 'limerick',
        content: `A tracker that's not very nosy,<br>
                 Makes analytics seem quite cosy,<br>
                 We just count the crowd,<br>
                 Nothing creepy allowed,<br>
                 Your browsing stays private and rosy!`
    },
    {
        type: 'modern',
        content: `We're watching... your page views! 👀<br>
                 Not your shopping, not your news,<br>
                 Just simple stats to make us smile,<br>
                 "Look mum, visitors!" once in a while.`
    },
    {
        type: 'haiku',
        content: `GTM loads light,<br>
                 Only with your permission,<br>
                 Consent is our way.`
    }
];

let currentPoemIndex = Math.floor(Math.random() * privacyPoems.length);

function showPrivacyPoem() {
    const poem = privacyPoems[currentPoemIndex];
    poemContent.innerHTML = poem.content;
    poemContent.className = `poem-content ${poem.type}`;
    
    // Animate the change
    poemContent.style.animation = 'none';
    setTimeout(() => {
        poemContent.style.animation = 'fadeInPoem 0.5s ease';
    }, 10);
}

function showPrivacyDrawer() {
    privacyDrawer.classList.add('active');
    privacyDrawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    showPrivacyPoem();
    
    // Focus management
    setTimeout(() => closePrivacyBtn.focus(), 100);
}

function hidePrivacyDrawer() {
    privacyDrawer.classList.remove('active');
    privacyDrawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Handle privacy link
if (privacyLink) {
    privacyLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPrivacyDrawer();
        
        // Track privacy drawer opened
        pushAnalyticsEvent('privacy_drawer_opened', {
            'poem_shown': privacyPoems[currentPoemIndex].type
        });
    });
}

// Handle refresh poem button
privacyRefreshBtn.addEventListener('click', () => {
    currentPoemIndex = (currentPoemIndex + 1) % privacyPoems.length;
    showPrivacyPoem();
    
    // Track poem refresh
    pushAnalyticsEvent('privacy_poem_refreshed', {
        'new_poem_type': privacyPoems[currentPoemIndex].type
    });
});

// Handle close button
closePrivacyBtn.addEventListener('click', hidePrivacyDrawer);
privacyDrawerOverlay.addEventListener('click', hidePrivacyDrawer);

// Prevent drawer close when clicking inside
privacyDrawer.addEventListener('click', (e) => {
    e.stopPropagation();
});


// Check consent on load
checkConsent();

// Track page view
pushAnalyticsEvent('page_view', {
    'page_title': document.title,
    'page_location': window.location.href
});

// Handle window resize to adjust toast behavior
let previousIsMobile = isMobile();
window.addEventListener('resize', () => {
    const currentIsMobile = isMobile();
    if (previousIsMobile !== currentIsMobile) {
        // Clear all toasts when switching between mobile and desktop
        activeToasts.forEach(toast => {
            if (toast && toast.parentElement) {
                clearTimeout(toast.timeoutId);
                toast.remove();
            }
        });
        activeToasts = [];
        previousIsMobile = currentIsMobile;
    }
});

// Initialize
renderAttendees();
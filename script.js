function toggleConditionalInput(fieldName) {
    const conditionalDiv = document.getElementById(fieldName + '-conditional');
    if (conditionalDiv) {
        const yesOption = document.getElementById(fieldName + '-yes');
        const otherOption = document.getElementById('plan-other');
        
        if ((yesOption && yesOption.checked) || (otherOption && otherOption.checked)) {
            conditionalDiv.style.display = 'block';
            
            // Make the explanation textareas required when "Evet" or "Başka bir planım var" is selected
            const textArea = conditionalDiv.querySelector('textarea');
            if (textArea) {
                textArea.setAttribute('required', 'required');
            }
        } else {
            conditionalDiv.style.display = 'none';
            
            // Remove required attribute when other options are selected
            const textArea = conditionalDiv.querySelector('textarea');
            if (textArea) {
                textArea.removeAttribute('required');
            }
        }
    }
}

// Function to navigate between pages
function goToPage(pageId, fromModal = false) {
    const currentPage = document.querySelector('.form-page.active');
    const nextPage = document.getElementById(pageId);
    
    if (currentPage && nextPage) {
        // Show modal for pages after page2, but only if not coming from modal and not on the last page
        if (parseInt(currentPage.id.replace('page', '')) >= 2 && !fromModal && nextPage.id !== 'thank-you-page') {
            showModal(pageId);
        } else {
            currentPage.classList.remove('active');
            nextPage.classList.add('active');
            window.scrollTo(0, 0);
        }
    }
}

// Function to validate a form page
function validatePage(pageId) {
    const page = document.getElementById(pageId);
    if (!page) return true; // If page doesn't exist, consider it valid
    
    const requiredInputs = page.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    requiredInputs.forEach(input => {
        const errorMsgId = input.name + '-error';
        const errorMsg = document.getElementById(errorMsgId);
        
        // Check if radio group is selected
        if (input.type === 'radio') {
            const radioGroup = document.getElementsByName(input.name);
            let radioSelected = false;
            
            for (let radio of radioGroup) {
                if (radio.checked) {
                    radioSelected = true;
                    break;
                }
            }
            
            if (!radioSelected) {
                isValid = false;
                if (errorMsg) errorMsg.style.display = 'block';
            } else {
                if (errorMsg) errorMsg.style.display = 'none';
            }
        } 
        // Check if text input or textarea is filled
        else if ((input.type === 'text' || input.tagName === 'TEXTAREA') && !input.value.trim()) {
            isValid = false;
            if (errorMsg) errorMsg.style.display = 'block';
        } else {
            if (errorMsg) errorMsg.style.display = 'none';
        }
    });
    
    // Special validation for repeat questions
    if (pageId === 'page2') {
        const repeatYes = document.getElementById('repeat-yes');
        if (repeatYes && repeatYes.checked) {
            const yearRepeatSelected = document.querySelector('input[name="year-repeat"]:checked');
            const internshipRepeatSelected = document.querySelector('input[name="internship-repeat"]:checked');
            
            if (!yearRepeatSelected && !internshipRepeatSelected) {
                isValid = false;
                const repeatError = document.getElementById('repeat-error');
                if (repeatError) {
                    repeatError.textContent = 'Lütfen en az bir tekrar seçeneğini işaretleyiniz.';
                    repeatError.style.display = 'block';
                }
            } else {
                const repeatError = document.getElementById('repeat-error');
                if (repeatError) {
                    repeatError.style.display = 'none';
                }
            }
        }
    }
    
    // Special validation for Likert scale on page 3
    if (pageId === 'page3') {
        const scaleItems = page.querySelectorAll('.scale-item:not(.scale-header)');
        let scaleValid = true;
        
        scaleItems.forEach(item => {
            const radioInputs = item.querySelectorAll('input[type="radio"]');
            const radioName = radioInputs.length > 0 ? radioInputs[0].name : null;
            
            if (radioName) {
                const radioGroup = document.getElementsByName(radioName);
                let radioSelected = false;
                
                for (let radio of radioGroup) {
                    if (radio.checked) {
                        radioSelected = true;
                        break;
                    }
                }
                
                if (!radioSelected) {
                    scaleValid = false;
                }
            }
        });
        
        const scaleError = document.getElementById('scale-error');
        if (!scaleValid) {
            isValid = false;
            if (scaleError) scaleError.style.display = 'block';
        } else {
            if (scaleError) scaleError.style.display = 'none';
        }
    }

    // Special validation for manager question on page 5
    if (pageId === 'page5') {
        const managerYes = document.getElementById('manager-yes');
        if (managerYes && managerYes.checked) {
            const managerConfidenceSelected = document.querySelector('input[name="manager-confidence"]:checked');
            if (!managerConfidenceSelected) {
                isValid = false;
                const managerError = document.getElementById('manager-error');
                if (managerError) {
                    managerError.textContent = 'Lütfen seçeneklerden birini seçiniz.';
                    managerError.style.display = 'block';
                }
            } else {
                const managerError = document.getElementById('manager-error');
                if (managerError) {
                    managerError.style.display = 'none';
                }
            }
        }
    }
    
    return isValid;
}

// Define the conditional fields (was missing)
const conditionalFields = [
    'repeat',
    'personal-dev',
    'volunteer',
    'positive-role',
    'negative-role',
    'positive-comm',
    'negative-comm',
    'future-plan',
    'manager'
];

// Set up deselectable radio buttons
function setupDeselectableRadios() {
    // For year repeat radios
    const yearRepeatOptions = document.querySelectorAll('input[name="year-repeat"]');
    yearRepeatOptions.forEach(radio => {
        radio.addEventListener('click', function() {
            if (this.getAttribute('data-checked') === 'true') {
                this.checked = false;
                this.setAttribute('data-checked', 'false');
            } else {
                // Clear data-checked attribute from all options in the group
                yearRepeatOptions.forEach(r => r.setAttribute('data-checked', 'false'));
                this.setAttribute('data-checked', 'true');
            }
        });
    });
    
    const internshipRepeatOptions = document.querySelectorAll('input[name="internship-repeat"]');
    internshipRepeatOptions.forEach(radio => {
        radio.addEventListener('click', function() {
            if (this.getAttribute('data-checked') === 'true') {
                this.checked = false;
                this.setAttribute('data-checked', 'false');
            } else {
                // Clear data-checked attribute from all options in the group
                internshipRepeatOptions.forEach(r => r.setAttribute('data-checked', 'false'));
                this.setAttribute('data-checked', 'true');
            }
        });
    });
}

// Form progress functions
function saveFormProgress() {
    const formData = {
        currentPage: document.querySelector('.form-page.active').id,
        answers: {}
    };

    // Save all radio button answers
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        if (radio.checked) {
            formData.answers[radio.name] = radio.value;
        }
    });

    // Save all text inputs and textareas
    document.querySelectorAll('input[type="text"], textarea').forEach(input => {
        if (input.value) {
            formData.answers[input.name] = input.value;
        }
    });

    localStorage.setItem('formProgress', JSON.stringify(formData));
}

function restoreFormProgress() {
    const savedProgress = localStorage.getItem('formProgress');
    if (!savedProgress) return;

    const formData = JSON.parse(savedProgress);

    // Restore radio button answers
    Object.entries(formData.answers).forEach(([name, value]) => {
        const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
        if (input && input.type === 'radio') {
            input.checked = true;
            // Trigger change event for conditional inputs
            if (conditionalFields.includes(name)) {
                toggleConditionalInput(name);
            }
        }
    });

    // Restore text inputs and textareas
    Object.entries(formData.answers).forEach(([name, value]) => {
        const input = document.querySelector(`input[name="${name}"][type="text"], textarea[name="${name}"]`);
        if (input) {
            input.value = value;
        }
    });

    // Go to last active page
    if (formData.currentPage) {
        goToPage(formData.currentPage);
    }

    // Update scale progress if on scale page
    if (formData.currentPage === 'page3') {
        updateScaleProgress();
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Set up deselectable radio buttons
    setupDeselectableRadios();

    // Restore form progress
    restoreFormProgress();

    // Set up page navigation
    document.getElementById('page1Next').addEventListener('click', function() {
        if (validatePage('page1')) {
            const consentNo = document.getElementById('consent-no');
            if (consentNo && consentNo.checked) {
                alert('Ankete devam etmek için katılım onayı vermeniz gerekmektedir.');
                return;
            }
            goToPage('page2');
            saveFormProgress();
        }
    });
    
    document.getElementById('page2Next').addEventListener('click', function() {
        if (validatePage('page2')) {
            goToPage('page3');
            saveFormProgress();
        }
    });
    
    document.getElementById('page3Next').addEventListener('click', function() {
        if (validatePage('page3')) {
            goToPage('page4');
            saveFormProgress();
        }
    });
    
    document.getElementById('page4Next').addEventListener('click', function() {
        if (validatePage('page4')) {
            goToPage('page5');
            saveFormProgress();
        }
    });
    
    document.getElementById('page5Next').addEventListener('click', function() {
        if (validatePage('page5')) {
            goToPage('page6');
            saveFormProgress();
        }
    });

    // Set up radio button change listeners for conditional inputs
    conditionalFields.forEach(field => {
        const radioButtons = document.querySelectorAll(`input[name="${field}"]`);
        radioButtons.forEach(radio => {
            radio.addEventListener('change', function() {
                toggleConditionalInput(field);
                saveFormProgress();
            });
        });
    });

    // Save progress when radio buttons change
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', saveFormProgress);
    });

    // Save progress when text inputs change
    document.querySelectorAll('input[type="text"], textarea').forEach(input => {
        input.addEventListener('change', saveFormProgress);
        input.addEventListener('input', saveFormProgress);
    });

    // Clear saved progress when form is submitted successfully
    document.getElementById('surveyForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validatePage('page6')) {
            alert("Lütfen tüm gerekli alanları doldurunuz.");
            return;
        }
        
        const submitButton = document.getElementById('submitButton');
        submitButton.textContent = "Gönderiliyor...";
        submitButton.disabled = true;
        
        let iframe = document.createElement('iframe');
        iframe.name = 'submit-iframe';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        this.target = 'submit-iframe';
        this.action = "https://script.google.com/macros/s/AKfycbxz9qZB3XQG2EcEIxSCAIMOFxuQ0MH7-135fHBtufbFmEZHUAfWkjLEk-932qQp84UAoQ/exec";
        this.method = 'post';
        
        this.submit();
        
        setTimeout(function() {
            localStorage.removeItem('formProgress');
            goToPage('thank-you-page');
        }, 2000);
    });

    // Set up scale progress tracking
    const scaleRadios = document.querySelectorAll('.scale-item:not(.scale-header) input[type="radio"]');
    scaleRadios.forEach(radio => {
        radio.addEventListener('change', updateScaleProgress);
    });
    
    // Initialize progress
    updateScaleProgress();

    // Set up keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);

    // Set up question navigation
    setupQuestionNavigation();
});

// Add this new function to track progress
function updateScaleProgress() {
    const totalQuestions = 40;
    const answeredQuestions = document.querySelectorAll('.scale-item:not(.scale-header) input[type="radio"]:checked').length;
    const progressElement = document.getElementById('scaleProgress');
    if (progressElement) {
        progressElement.textContent = `${answeredQuestions}/${totalQuestions} soru cevaplandı`;
    }
}

// Add event listeners for radio buttons
document.addEventListener('DOMContentLoaded', function() {
    const scaleRadios = document.querySelectorAll('.scale-item:not(.scale-header) input[type="radio"]');
    scaleRadios.forEach(radio => {
        radio.addEventListener('change', updateScaleProgress);
    });
    
    // Initialize progress
    updateScaleProgress();
});

// Update the progress tracking function
function updateScaleProgress() {
    const totalQuestions = 40;
    const answeredQuestions = document.querySelectorAll('.scale-item:not(.scale-header) input[type="radio"]:checked').length;
    const progressElement = document.getElementById('scaleProgress');
    if (progressElement) {
        progressElement.textContent = `${answeredQuestions}/${totalQuestions} soru cevaplandı`;
    }
}

// Add keyboard navigation
function handleKeyboardNavigation(e) {
    const currentQuestion = document.querySelector('.scale-item:not(.scale-header) input[type="radio"]:focus');
    if (!currentQuestion) return;

    const questionContainer = currentQuestion.closest('.scale-item');
    const radioGroup = questionContainer.querySelectorAll('input[type="radio"]');
    const currentIndex = Array.from(radioGroup).indexOf(currentQuestion);

    if (e.key === 'ArrowLeft' && currentIndex > 0) {
        radioGroup[currentIndex - 1].focus();
    } else if (e.key === 'ArrowRight' && currentIndex < radioGroup.length - 1) {
        radioGroup[currentIndex + 1].focus();
    }
}

// Add question navigation
function setupQuestionNavigation() {
    const questions = document.querySelectorAll('.scale-item:not(.scale-header)');
    let currentQuestionIndex = 0;

    function scrollToQuestion(index) {
        questions[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        questions[index].querySelector('input[type="radio"]').focus();
    }

    document.getElementById('prevQuestion').addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            scrollToQuestion(currentQuestionIndex);
        }
    });

    document.getElementById('nextQuestion').addEventListener('click', () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            scrollToQuestion(currentQuestionIndex);
        }
    });

    // Update navigation buttons state
    function updateNavigationButtons() {
        const prevButton = document.getElementById('prevQuestion');
        const nextButton = document.getElementById('nextQuestion');
        
        prevButton.disabled = currentQuestionIndex === 0;
        nextButton.disabled = currentQuestionIndex === questions.length - 1;
    }

    updateNavigationButtons();
}

// Modal functionality
const modal = document.getElementById('confirmationModal');
const modalEditBtn = document.getElementById('modalEditBtn');
const modalProceedBtn = document.getElementById('modalProceedBtn');
let nextPageId = '';

function showModal(pageId) {
    modal.style.display = 'block';
    nextPageId = pageId;
}

function hideModal() {
    modal.style.display = 'none';
}

modalEditBtn.addEventListener('click', hideModal);

modalProceedBtn.addEventListener('click', () => {
    hideModal();
    goToPage(nextPageId, true); // Pass true to indicate this is coming from modal
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        hideModal();
    }
});


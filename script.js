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
function goToPage(pageId) {
    const currentPage = document.querySelector('.form-page.active');
    const nextPage = document.getElementById(pageId);
    
    if (currentPage && nextPage) {
        currentPage.classList.remove('active');
        nextPage.classList.add('active');
        window.scrollTo(0, 0);
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

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Set up deselectable radio buttons
    setupDeselectableRadios();

    // Set up page navigation
    document.getElementById('page1Next').addEventListener('click', function() {
        if (validatePage('page1')) {
            const consentNo = document.getElementById('consent-no');
            if (consentNo && consentNo.checked) {
                alert('Ankete devam etmek için katılım onayı vermeniz gerekmektedir.');
                return;
            }
            goToPage('page2');
        }
    });
    
    document.getElementById('page2Next').addEventListener('click', function() {
        if (validatePage('page2')) {
            goToPage('page3');
        }
    });
    
    document.getElementById('page3Next').addEventListener('click', function() {
        if (validatePage('page3')) {
            goToPage('page4');
        }
    });
    
    document.getElementById('page4Next').addEventListener('click', function() {
        if (validatePage('page4')) {
            goToPage('page5');
        }
    });
    
    document.getElementById('page5Next').addEventListener('click', function() {
        if (validatePage('page5')) {
            goToPage('page6');
        }
    });
    
    // Set up radio button change listeners for conditional inputs
    conditionalFields.forEach(field => {
        const radioButtons = document.querySelectorAll(`input[name="${field}"]`);
        radioButtons.forEach(radio => {
            radio.addEventListener('change', function() {
                toggleConditionalInput(field);
            });
        });
    });

    document.getElementById('surveyForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!validatePage('page6')) {
        alert("Lütfen tüm gerekli alanları doldurunuz.");
        return;
    }
    
    // Show loading indicator or message
    const submitButton = document.getElementById('submitButton');
    submitButton.textContent = "Gönderiliyor...";
    submitButton.disabled = true;
    
    // Create a hidden iframe
    let iframe = document.createElement('iframe');
    iframe.name = 'submit-iframe';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Set form target to iframe
    this.target = 'submit-iframe';
    this.action = "https://script.google.com/macros/s/AKfycbxj3Z88aJpJSUNkMiMNpWRF68cwqqvi_r2ralHTOc0JpVOOQlB7D_TEDmJHM4D4PEKyEA/exec"; 
    
    // Add method attribute
    this.method = 'post';
    
    // Submit the form
    this.submit();
    
    // Show thank you page after a short delay
    setTimeout(function() {
        goToPage('thank-you-page');
    }, 2000);
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

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Set up progress tracking
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
});
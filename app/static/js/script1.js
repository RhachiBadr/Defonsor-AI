// Attendre que le DOM soit complètement chargé avant d'exécuter le script
document.addEventListener('DOMContentLoaded', () => {
  // Fonctions utilitaires
  const throttle = (func, limit) => {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  // Fonction pour échapper les caractères HTML
  const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  // Mise en cache des éléments DOM
  const header = document.getElementById('header');
  const startBtn = document.getElementById('start-btn');
  const backToTopBtn = document.createElement('button');
  const toggleDarkModeBtn = document.createElement('button');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const fileInput = document.getElementById('file-input');
  const uploadArea = document.getElementById('upload-area');
  const fileInfo = document.getElementById('file-info');
  const fileNameSpan = document.getElementById('file-name');
  const clearFileBtn = document.getElementById('clear-file');
  const textInput = document.getElementById('text-input');
  const clearTextBtn = document.getElementById('clear-text');
  const analyzeBtn = document.getElementById('analyze-btn');
  const analyzeBtnThanks = document.getElementById('analyze-btn-thanks');
  const analysisResult = document.getElementById('analysis-result');
  const resultContent = document.getElementById('result-content');
  const logoutBtn = document.getElementById('logout-btn');
  const refreshBtn = document.getElementById('refresh-btn');
  const xssSubmitButton = document.getElementById('xss-submit');
  const xssInput = document.getElementById('xss-input');
  const xssResult = document.getElementById('xss-result');
  const countdownElement = document.getElementById('countdown');

  // Gestion des modales
  const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('modal-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) firstFocusable.focus();
    }
  };

  const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('modal-close');
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('modal-close', 'modal-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
      }, 300);
    }
  };

  [document.getElementById('open-login-modal'), document.getElementById('open-signup-modal')].forEach(btn => {
    if (btn) btn.addEventListener('click', () => {
      const modalId = btn.id.replace('open-', '');
      openModal(modalId);
    });
  });

  [document.getElementById('close-login-modal'), document.getElementById('close-signup-modal')].forEach(btn => {
    if (btn) btn.addEventListener('click', () => {
      const modalId = btn.id.replace('close-', '');
      closeModal(modalId);
    });
  });

  window.addEventListener('click', (event) => {
    const modals = document.getElementsByClassName('modal');
    for (let i = 0; i < modals.length; i++) {
      if (event.target === modals[i]) closeModal(modals[i].id);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modals = document.getElementsByClassName('modal');
      for (let i = 0; i < modals.length; i++) {
        if (modals[i].style.display === 'flex') closeModal(modals[i].id);
      }
    }
  });

  // Fonctionnalités de défilement et d'animation
  if (header) {
    window.addEventListener('scroll', throttle(() => {
      header.classList.toggle('shrink', window.scrollY > 50);
    }, 100));
  }

  const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
  smoothScrollLinks.forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        window.scrollTo({ top: targetElement.offsetTop - 80, behavior: 'smooth' });
      }
    });
  });

  backToTopBtn.id = 'back-to-top';
  backToTopBtn.title = 'Retour en haut';
  backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  document.body.appendChild(backToTopBtn);
  window.addEventListener('scroll', throttle(() => {
    backToTopBtn.style.opacity = window.scrollY > 200 ? '1' : '0';
    backToTopBtn.style.visibility = window.scrollY > 200 ? 'visible' : 'hidden';
  }, 100));
  backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const animateOnScroll = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('section').forEach(section => observer.observe(section));
  };
  animateOnScroll();

  // Mode sombre
  toggleDarkModeBtn.id = 'dark-mode-toggle';
  toggleDarkModeBtn.title = 'Activer le mode sombre';
  toggleDarkModeBtn.innerHTML = '<i class="fas fa-moon"></i>';
  document.body.appendChild(toggleDarkModeBtn);
  toggleDarkModeBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    toggleDarkModeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    toggleDarkModeBtn.title = isDark ? 'Désactiver le mode sombre' : 'Activer le mode sombre';
    localStorage.setItem('darkMode', isDark);
  });
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    toggleDarkModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    toggleDarkModeBtn.title = 'Désactiver le mode sombre';
  }

  // Validation et gestion des formulaires
  const showError = (input, message) => {
    const formGroup = input.parentElement.parentElement;
    let error = formGroup.querySelector('.error-message');
    if (!error) {
      error = document.createElement('span');
      error.className = 'error-message';
      error.style.cssText = 'color: #e74c3c; font-size: 0.9rem; display: block; margin-top: 5px';
      formGroup.appendChild(error);
    }
    error.textContent = message;
    input.setAttribute('aria-invalid', 'true');
  };

  const clearError = (input) => {
    const formGroup = input.parentElement.parentElement;
    const error = formGroup.querySelector('.error-message');
    if (error) error.remove();
    input.setAttribute('aria-invalid', 'false');
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 8 && password.length <= 12;
  const validateAcademicEmail = (email) => ['univ.fr', 'edu', 'ac.uk'].some(domain => email.split('@')[1].endsWith(domain));

  const showSuccessMessage = (form, message) => {
    let success = form.querySelector('.success-message');
    if (!success) {
      success = document.createElement('span');
      success.className = 'success-message';
      success.style.cssText = 'color: #43A047; font-size: 0.9rem; display: block; margin-top: 10px';
      form.appendChild(success);
    }
    success.textContent = message;
    setTimeout(() => success.remove(), 3000);
  };

  // Formulaire de connexion
  const loginForms = document.querySelectorAll('#connexion .contact-form, #login-form');
  loginForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.querySelector('#email, #login-email');
      const password = form.querySelector('#password, #login-password');
      let isValid = true;

      [email, password].forEach(input => clearError(input));

      if (!email.value.trim()) {
        showError(email, 'L’email est requis.');
        isValid = false;
      } else if (!validateEmail(email.value.trim())) {
        showError(email, 'Veuillez entrer un email valide.');
        isValid = false;
      }
      if (!password.value.trim()) {
        showError(password, 'Le mot de passe est requis.');
        isValid = false;
      } else if (!validatePassword(password.value.trim())) {
        showError(password, 'Le mot de passe doit avoir entre 8 et 12 caractères.');
        isValid = false;
      }

      if (isValid) {
        const formData = new FormData(form);
        try {
          const response = await fetch('/login', {
            method: 'POST',
            body: formData
          });
          const result = await response.json();
          if (result.success) {
            showSuccessMessage(form, result.message + ' Redirection...');
            if (form.closest('.modal')) closeModal(form.closest('.modal').id);
            setTimeout(() => window.location.href = '/dashboard', 1000);
          } else {
            showError(email, result.message);
          }
        } catch (error) {
          showError(email, 'Erreur serveur.');
        }
      }
    });
  });

  // Formulaire d'inscription
  const signupForms = document.querySelectorAll('#inscription .contact-form, #signup-form');
  signupForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nom = form.querySelector('#nom, #signup-nom');
      const prenom = form.querySelector('#prenom, #signup-prenom');
      const email = form.querySelector('#email-inscription, #signup-email');
      const password = form.querySelector('#password-inscription, #signup-password');
      const confirmPassword = form.querySelector('#confirm-password, #signup-confirm-password');
      let isValid = true;

      [nom, prenom, email, password, confirmPassword].forEach(input => clearError(input));

      if (!nom.value.trim()) {
        showError(nom, 'Le nom est requis.');
        isValid = false;
      }
      if (!prenom.value.trim()) {
        showError(prenom, 'Le prénom est requis.');
        isValid = false;
      }
      if (!email.value.trim()) {
        showError(email, 'L’email est requis.');
        isValid = false;
      } else if (!validateEmail(email.value.trim())) {
        showError(email, 'Veuillez entrer un email valide.');
        isValid = false;
      }
      if (!password.value.trim()) {
        showError(password, 'Le mot de passe est requis.');
        isValid = false;
      } else if (!validatePassword(password.value.trim())) {
        showError(password, 'Le mot de passe doit avoir entre 8 et 12 caractères.');
        isValid = false;
      }
      if (!confirmPassword.value.trim()) {
        showError(confirmPassword, 'La confirmation du mot de passe est requise.');
        isValid = false;
      } else if (password.value.trim() !== confirmPassword.value.trim()) {
        showError(confirmPassword, 'Les mots de passe ne correspondent pas.');
        isValid = false;
      }

      if (isValid) {
        const formData = new FormData(form);
        try {
          const response = await fetch('/signup', {
            method: 'POST',
            body: formData
          });
          const result = await response.json();
          if (result.success) {
            showSuccessMessage(form, result.message);
            if (form.closest('.modal')) closeModal(form.closest('.modal').id);
            form.reset();
            setTimeout(() => window.location.href = '/thanks', 1000);
          } else {
            showError(email, result.message);
          }
        } catch (error) {
          showError(email, 'Erreur serveur.');
        }
      }
    });
  });

  // Chargement paresseux des images
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    });
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          observer.unobserve(img);
        }
      });
    });
    document.querySelectorAll('img').forEach(img => {
      img.dataset.src = img.src;
      img.src = '';
      observer.observe(img);
    });
  }

  // Fonctionnalités du tableau de bord et d'analyse
  if (tabButtons.length && tabContents.length) {
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.getAttribute('data-tab')).classList.add('active');
        if (analyzeBtn) {
          analyzeBtn.disabled = true;
          analysisResult.style.display = 'none';
          if (button.getAttribute('data-tab') === 'file-tab' && fileInput?.files.length > 0) analyzeBtn.disabled = false;
          else if (button.getAttribute('data-tab') === 'text-tab' && textInput?.value.trim()) analyzeBtn.disabled = false;
        }
      });
    });
  }

  if (uploadArea) {
    uploadArea.addEventListener('click', (e) => {
      if (e.target.classList.contains('choose-file')) fileInput.click();
    });
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => fileInput.files[0] && handleFile(fileInput.files[0]));
    clearFileBtn.addEventListener('click', () => {
      fileInput.value = '';
      fileInfo.style.display = 'none';
      if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analysisResult.style.display = 'none';
      }
    });
    uploadArea.addEventListener('keydown', (e) => {
      if (e.target.classList.contains('choose-file') && (e.key === 'Enter' || e.key === ' ')) fileInput.click();
    });
  }

  if (textInput) {
    textInput.addEventListener('input', () => {
      if (analyzeBtn) analyzeBtn.disabled = !textInput.value.trim();
    });
    clearTextBtn.addEventListener('click', () => {
      textInput.value = '';
      if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analysisResult.style.display = 'none';
      }
    });
  }

  // Gestion du bouton d'analyse dans dashboard.html
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Analyze button clicked', {
        dataHref: analyzeBtn.getAttribute('data-href'),
        hasDefault: e.defaultPrevented
      });
      const activeTab = document.querySelector('.tab-content.active');
      if (activeTab?.id === 'file-tab' && fileInput?.files.length) {
        simulateFileAnalysis(fileInput.files[0]);
      } else if (activeTab?.id === 'text-tab' && textInput?.value.trim()) {
        analyzeTextWithAPIs(textInput.value.trim());
      } else {
        console.log('Aucune entrée valide pour l\'analyse');
      }
    });
  }

  // Gestion du bouton d'analyse dans thanks.html (redirection)
  if (analyzeBtnThanks) {
    analyzeBtnThanks.addEventListener('click', (e) => {
      e.preventDefault();
      const href = analyzeBtnThanks.getAttribute('data-href');
      if (href) window.location.href = href;
      else console.log('Aucun data-href défini pour analyzeBtnThanks');
    });
  }

  const handleFile = (file) => {
    fileNameSpan.textContent = file.name;
    fileInfo.style.display = 'flex';
    if (analyzeBtn) {
      analyzeBtn.disabled = false;
      analysisResult.style.display = 'none';
    }
  };

  const simulateFileAnalysis = (file) => {
    if (analyzeBtn) {
      analyzeBtn.disabled = true;
      analyzeBtn.innerHTML = 'Analyse en cours... <span class="spinner"></span>';
    }
    resultContent.innerHTML = '';
    setTimeout(() => {
      const isThreat = Math.random() > 0.7;
      resultContent.innerHTML = `
        <p><strong>Nom :</strong> ${file.name}</p>
        <p><strong>Taille :</strong> ${(file.size / 1024).toFixed(2)} KB</p>
        <p><strong>Type :</strong> ${file.type || 'Inconnu'}</p>
        <p class="${isThreat ? 'threat' : 'safe'}">
          ${isThreat ? 'Menace détectée !' : 'Aucun danger détecté.'}
        </p>
      `;
      analysisResult.style.display = 'block';
      if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = 'Analyser';
      }
    }, 2000);
  };

  const analyzeTextWithAPIs = async (text) => {
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = 'Analyse en cours... <span class="spinner"></span>';
    }
    resultContent.innerHTML = '';
    const textType = determineTextType(text);
    const apiEndpoints = [
        { url: '/analyze/xss/analyze', type: 'XSS', key: 'text', resultKey: 'xss', threatValue: 'XSS', confidenceKey: 'confidence' },
        { url: '/analyze/sql_injection/analyze', type: 'SQL Injection', key: 'text', resultKey: 'label', threatValue: 'SQL Injection', confidenceKey: 'confidence' },
        ...(textType === 'URL' ? [
            { url: '/analyze/phishing/analyze', type: 'Phishing', key: 'url', resultKey: 'phishing', threatValue: 'Phishing', confidenceKey: 'confidence' }
        ] : []),
    ];

    try {
        const results = [];
        for (const endpoint of apiEndpoints) {
            const payload = { [endpoint.key]: text };
            const response = await fetch(endpoint.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (response.ok) {
                results.push({
                    type: endpoint.type,
                    threat: result[endpoint.resultKey] === endpoint.threatValue,
                    label: result[endpoint.resultKey],
                    confidence: result[endpoint.confidenceKey] || 0,
                });
            } else {
                throw new Error(result.error || 'Erreur lors de l\'analyse');
            }
        }

        if (textType !== 'URL') {
            results.push({
                type: 'Phishing',
                threat: false,
                label: 'Non applicable (entrée non-URL)',
                confidence: 0,
            });
        }

        const escapedText = escapeHTML(text);
        let resultHTML = `<p><strong>Entrée :</strong> ${escapedText}</p>`;
        resultHTML += `<p><strong>Type :</strong> ${textType}</p>`;
        resultHTML += '<ul>';
        let hasThreat = false;
        results.forEach(({ type, threat, label, confidence }) => {
            const threatClass = threat ? `threat-${type.toLowerCase().replace(' ', '-')}` : 'safe';
            hasThreat = hasThreat || threat;
            resultHTML += `
                <li class="${threatClass}">
                    ${type} : ${label} ${confidence ? `(Confiance : ${(confidence * 100).toFixed(2)}%)` : ''}
                </li>
            `;
        });
        resultHTML += '</ul>';
        resultHTML += `<p class="${hasThreat ? 'threat' : 'safe'}">${hasThreat ? 'Menace détectée !' : 'Aucun danger détecté.'}</p>`;

        resultContent.innerHTML = resultHTML;
        analysisResult.style.display = 'block';
    } catch (error) {
        resultContent.innerHTML = `<p class="threat">Erreur : ${error.message}</p>`;
        analysisResult.style.display = 'block';
    } finally {
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = 'Analyser';
        }
    }
  };

  const determineTextType = (text) => {
    if (/^(https?:\/\/)?(www\.)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i.test(text)) return 'URL';
    if (/^(SELECT|INSERT|UPDATE|DELETE)/i.test(text)) return 'Requête SQL';
    if (/^(script)/i.test(text)) return 'cross-site scripting';
    if (text.includes('function') || text.includes('var') || text.includes('let') || text.includes('const')) return 'Script JavaScript';
    return 'Texte inconnu';
  };

  // Gestion de la déconnexion
  if (logoutBtn) logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      if (result.success) {
        window.location.href = '/';
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  });

  if (refreshBtn) refreshBtn.addEventListener('click', () => {
    window.location.href = refreshBtn.getAttribute('data-href');
  });

  if (xssSubmitButton && xssInput && xssResult) {
    xssSubmitButton.addEventListener('click', async () => {
      const text = xssInput.value.trim();
      xssResult.textContent = text ? 'Analyse en cours...' : 'Veuillez entrer un texte à analyser.';
      xssResult.className = 'xss-result';
      if (text) {
        try {
          const response = await fetch('/analyze/xss/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          });
          const result = await response.json();
          xssResult.textContent = response.ok ? `Résultat : ${result.xss} (Confiance : ${(result.confidence * 100).toFixed(2)}%)` : `Erreur : ${result.error}`;
          xssResult.className = `xss-result ${result.xss === 'XSS' ? 'danger' : 'success'}`;
        } catch (error) {
          xssResult.textContent = `Erreur : ${error.message}`;
          xssResult.className = 'xss-result danger';
        }
      }
    });
  }

  if (countdownElement) {
    let countdown = 15;
    countdownElement.textContent = countdown;
    const redirectInterval = setInterval(() => {
      countdown--;
      countdownElement.textContent = countdown;
      if (countdown <= 0) {
        clearInterval(redirectInterval);
        window.location.href = '/dashboard';
      }
    }, 1000);
  }

  if (startBtn) startBtn.addEventListener('click', () => {
    window.location.href = startBtn.getAttribute('data-href');
  });
});
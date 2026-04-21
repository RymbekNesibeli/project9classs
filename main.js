document.addEventListener('DOMContentLoaded', () => {
    // ---- Routing / View switching ----
    const viewButtons = document.querySelectorAll('[data-target]');
    const views = document.querySelectorAll('.view-section');
    const headerLinks = document.querySelectorAll('.header .nav-link');

    function switchView(targetId) {
        // Hide all views
        views.forEach(v => v.classList.remove('active'));
        // Show target view
        const targetView = document.getElementById(targetId);
        if (targetView) targetView.classList.add('active');
        
        // Update menu active state
        headerLinks.forEach(hl => {
            hl.classList.remove('active');
            if(hl.getAttribute('data-target') === targetId) {
                hl.classList.add('active');
            } else if (targetId === 'home-view' && hl.getAttribute('href') === '#') {
                hl.classList.add('active');
            }
        });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Check hash on load to open the right view automatically
    const initialHash = window.location.hash;
    if (initialHash) {
        // Find a button that has a href matching the hash
        const targetBtn = Array.from(viewButtons).find(btn => btn.getAttribute('href') === initialHash);
        if (targetBtn) {
            const tgtId = targetBtn.getAttribute('data-target');
            if (tgtId) {
                switchView(tgtId);
            }
        }
    }

    viewButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.getAttribute('data-target');
            if (targetId) {
                if (btn.tagName === 'A') e.preventDefault();
                
                // If it's a topic card
                if (btn.hasAttribute('data-topic')) {
                    loadTopic(btn.getAttribute('data-topic'));
                }
                
                // If entering quiz, reset it
                if (targetId === 'test-view' && btn.tagName === 'A') {
                    initQuiz();
                }

                switchView(targetId);
            }
        });
    });

    // ---- Flashcards Logic ----
    const cardsData = [
        {
            front: "Қарсылықты салалас",
            back: "Екі жай сөйлемнің мағынасы бір-біріне қарсы қойылып байланысады.",
            example: "Күн суытты, бірақ біз далаға шықтық."
        },
        { front: "Ыңғайлас салалас", back: "Оқиғаның, іс-әрекеттің мезгілдес, бағыттас екенін білдіреді.", example: "Жел басылды, күн ашылды." },
        { front: "Себеп-салдар салалас", back: "Бірінші сөйлем екінші сөйлемнің себебін білдіреді.", example: "Жаңбыр жауды, сондықтан жер су болды." },
        { front: "Талғаулы салалас", back: "Іс-әрекеттің біреуі ғана іске асатынын білдіреді.", example: "Не мен барамын, не сен барасың." },
        { front: "Кезектес салалас", back: "Іс-әрекеттің кезекпен орындалатынын білдіреді.", example: "Бірде жаңбыр жауады, бірде қар жауады." }
    ];

    let currentCardIndex = 0;
    
    const elementsCard = {
        container: document.getElementById('flashcard'),
        word: document.getElementById('fc-word'),
        def: document.getElementById('fc-def'),
        example: document.getElementById('fc-example'),
        counter: document.getElementById('fc-counter'),
        btnNext: document.getElementById('fc-next'),
        btnPrev: document.getElementById('fc-prev')
    };

    function updateCard() {
        elementsCard.container.classList.remove('is-flipped');
        setTimeout(() => {
            const data = cardsData[currentCardIndex];
            elementsCard.word.textContent = data.front;
            elementsCard.def.textContent = data.back;
            elementsCard.example.innerHTML = `<em>${data.example}</em>`;
            elementsCard.counter.textContent = `${currentCardIndex + 1} / ${cardsData.length}`;
        }, 150);
    }

    if (elementsCard.container) {
        elementsCard.container.addEventListener('click', () => {
            elementsCard.container.classList.toggle('is-flipped');
        });

        elementsCard.btnNext?.addEventListener('click', () => {
            currentCardIndex = (currentCardIndex + 1) % cardsData.length;
            updateCard();
        });

        elementsCard.btnPrev?.addEventListener('click', () => {
            currentCardIndex = (currentCardIndex - 1 + cardsData.length) % cardsData.length;
            updateCard();
        });

        updateCard();
    }

    // ---- Dictionary Logic ----
    const dictionaryData = [
        { kz: "Білім", ru: "Знание" }, { kz: "Оқушы", ru: "Ученик" },
        { kz: "Мұғалім", ru: "Учитель" }, { kz: "Мектеп", ru: "Школа" },
        { kz: "Жалғаулық", ru: "Союз (в грамматике)" }, { kz: "Құрмалас сөйлем", ru: "Сложное предложение" },
        { kz: "Қарсылықты салалас", ru: "Противительное сложносочиненное" }, { kz: "Ыңғайлас салалас", ru: "Соединительное сложносочиненное" },
        { kz: "Себеп-салдар", ru: "Причинно-следственный" }, { kz: "Талғаулы салалас", ru: "Разделительное сложносочиненное" },
        { kz: "Біріккен сөз", ru: "Единое (слитное) слово" }, { kz: "Күрделі сөз", ru: "Сложное слово" },
        { kz: "Нақ осы шақ", ru: "Собственно-настоящее время" }, { kz: "Көмекші етістік", ru: "Вспомогательный глагол" },
        { kz: "Жинақтық сан есім", ru: "Собирательное числительное" }, { kz: "Реттік сан есім", ru: "Порядковое числительное" },
        { kz: "Тағам", ru: "Пища, еда" }, { kz: "Қолөнер", ru: "Ремесло" },
        { kz: "Зергер", ru: "Ювелир" }, { kz: "Сәулет", ru: "Архитектура" },
        { kz: "Бейнелеу өнері", ru: "Изобразительное искусство" }, { kz: "Кесене", ru: "Мавзолей, гробница" }
    ];
    // Sort dictionary alphabetically over kz
    dictionaryData.sort((a,b) => a.kz.localeCompare(b.kz));

    const dictList = document.getElementById('dict-list');
    const dictSearch = document.getElementById('dict-search');

    function renderDictionary(filter = "") {
        if(!dictList) return;
        dictList.innerHTML = "";
        const lowerFilter = filter.toLowerCase();
        
        const filtered = dictionaryData.filter(item => 
            item.kz.toLowerCase().includes(lowerFilter) || 
            item.ru.toLowerCase().includes(lowerFilter)
        );

        if(filtered.length === 0) {
            dictList.innerHTML = "<p style='grid-column: 1/-1; text-align:center; color:#666; width:100%;'>Сөз табылған жоқ (Не найдено)</p>";
            return;
        }

        filtered.forEach(item => {
            const div = document.createElement('div');
            div.className = 'dict-item';
            div.innerHTML = `<span class="dict-kz">${item.kz}</span> <span class="dict-ru">${item.ru}</span>`;
            dictList.appendChild(div);
        });
    }

    if (dictSearch) {
        renderDictionary();
        dictSearch.addEventListener('input', (e) => {
            renderDictionary(e.target.value);
        });
    }

    // ---- Interactive Test Logic ----
    const quizData = [
        {
            q: "«Қарсылықты салалас құрмалас сөйлемнің» жалғаулықтарын табыңыз:",
            options: ["бірақ, алайда, дегенмен, әйтсе де", "және, әрі, мен, бен, пен", "өйткені, себебі, сондықтан", "не, немесе, я, яки"],
            correct: 0
        },
        {
            q: "Ыңғайлас салалас құрмалас сөйлемді көрсетіңіз:",
            options: ["Күн суытты, бірақ біз далаға шықтық.", "Көктем келді, және құстар ұшып келді.", "Ол сабаққа келмеді, себебі ауырып қалды.", "Не сен барасың, не мен барамын."],
            correct: 1
        },
        {
            q: "«Жинақтық сан есімді» табыңыз:",
            options: ["Бесінші", "Бекболат", "Алтау", "Жүзден бір"],
            correct: 2
        },
        {
            q: "Етістіктің нақ осы шағын көрсететін сөйлемді табыңыз:",
            options: ["Ол кеше киноға барды.", "Оқушылар қазір емтихан тапсырып отыр.", "Ертең біз жарысқа қатысамыз.", "Мен кітап оқыдым."],
            correct: 1
        },
        {
            q: "Жалқы есімді табыңыз:",
            options: ["Жазушы", "Қала", "Алатау", "Мектеп"],
            correct: 2
        },
        {
            q: "Қазақтың ұлттық сусыны қымыз неден жасалады?",
            options: ["Сиыр сүтінен", "Бие сүтінен", "Түйе сүтінен (шұбат)", "Ешкі сүтінен"],
            correct: 1
        },
        {
            q: "Күміс пен алтыннан бұйым жасайтын шеберді қалай атайды?",
            options: ["Ағаш ұстасы", "Зергер", "Етікші", "Тігінші"],
            correct: 1
        },
        {
            q: "Қазақ кино өнерінің атасы, «Атаманның ақыры», «Тақиялы періште» фильмдерінің режиссері кім?",
            options: ["Ақан Сатаев", "Ермек Тұрсынов", "Шәкен Айманов", "Мәжит Бегалин"],
            correct: 2
        },
        {
            q: "Біріккен сөзді табыңыз:",
            options: ["Темір жол", "Аққұс", "Қызыл алма", "Оқып отыр"],
            correct: 1
        },
        {
            q: "Сәулет өнеріне қатысты сөзді табыңыз:",
            options: ["Кинотеатр экраны", "Бейнелеу", "Күмбезді кесене", "Алқа, сырға"],
            correct: 2
        },
        {
            q: "«Тамақтану» тақырыбына қатысты сөзді табыңыз:",
            options: ["Дәрумендер", "Сәулет", "Режиссер", "Бояу"],
            correct: 0
        },
        {
            q: "Күрделі (біріккен) сөзді табыңыз:",
            options: ["Қала", "Көзәйнек", "Су", "Бала"],
            correct: 1
        },
        {
            q: "Қазақтың ұлттық ою-өрнектері не үшін қолданылады?",
            options: ["Тамақ пісіруге", "Киім мен бұйымдарды сәндеуге", "Үй салуға", "Егін егуге"],
            correct: 1
        },
        {
            q: "«Салт-дәстүр» сөзінің орысша аудармасы:",
            options: ["Искусство", "Традиция и обычаи", "Праздник", "Воспитание"],
            correct: 1
        },
        {
            q: "Сан есім қандай сұрақтарға жауап береді?",
            options: ["Кім? Не?", "Қандай? Қай?", "Қанша? Неше?", "Не істеді?"],
            correct: 2
        },
        {
            q: "«Бәйтерек» монументі қай қалада орналасқан?",
            options: ["Алматы", "Астана", "Шымкент", "Атырау"],
            correct: 1
        },
        {
            q: "Жалғаулық шылауларды көрсетіңіз:",
            options: ["биік, әдемі", "және, мен, бірақ", "келді, кетті", "оқушы, мектеп"],
            correct: 1
        },
        {
            q: "Киіз үйдің ең жоғарғы, дөңгелек бөлігі (төбесі) қалай аталады?",
            options: ["Уық", "Шаңырақ", "Кереге", "Сықырлауық"],
            correct: 1
        },
        {
            q: "Етістіктің қай шағы іс-әрекеттің дәл қазір болып жатқанын білдіреді?",
            options: ["Өткен шақ", "Нақ осы шақ", "Келер шақ", "Ауыспалы келер шақ"],
            correct: 1
        }
    ];

    let currentQuestion = 0;
    let score = 0;
    let isAnswered = false;

    const quizElements = {
        container: document.getElementById('quiz-container'),
        results: document.getElementById('quiz-results'),
        text: document.getElementById('q-text'),
        options: document.getElementById('q-options'),
        current: document.getElementById('q-current'),
        total: document.getElementById('q-total'),
        feedback: document.getElementById('quiz-feedback'),
        btnNext: document.getElementById('btn-next-q'),
        progress: document.getElementById('quiz-progress'),
        resScore: document.getElementById('r-score'),
        resTotal: document.getElementById('r-total'),
        resMsg: document.getElementById('r-message'),
        resIcon: document.getElementById('r-icon'),
        btnRestart: document.getElementById('btn-restart-quiz')
    };

    function initQuiz() {
        currentQuestion = 0;
        score = 0;
        quizElements.container.style.display = 'block';
        quizElements.results.style.display = 'none';
        quizElements.total.textContent = quizData.length;
        quizElements.resTotal.textContent = quizData.length;
        loadQuestion();
    }

    function loadQuestion() {
        isAnswered = false;
        const q = quizData[currentQuestion];
        quizElements.current.textContent = currentQuestion + 1;
        quizElements.text.textContent = q.q;
        quizElements.feedback.textContent = "";
        quizElements.btnNext.style.display = 'none';
        quizElements.progress.style.width = `${((currentQuestion) / quizData.length) * 100}%`;
        
        quizElements.options.innerHTML = "";
        q.options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = opt;
            btn.onclick = () => selectAnswer(index, btn, q.correct);
            quizElements.options.appendChild(btn);
        });
    }

    function selectAnswer(selectedIndex, btn, correctIndex) {
        if(isAnswered) return;
        isAnswered = true;
        
        const allBtns = quizElements.options.querySelectorAll('.quiz-option');
        allBtns.forEach(b => b.disabled = true);

        if(selectedIndex === correctIndex) {
            btn.classList.add('correct');
            quizElements.feedback.innerHTML = '<span style="color:#2E7D32"><i class="fa-solid fa-check"></i> Дұрыс! (Правильно!)</span>';
            score++;
        } else {
            btn.classList.add('incorrect');
            allBtns[correctIndex].classList.add('correct');
            quizElements.feedback.innerHTML = '<span style="color:#C62828"><i class="fa-solid fa-xmark"></i> Қате. (Неправильно.)</span>';
        }

        quizElements.progress.style.width = `${((currentQuestion + 1) / quizData.length) * 100}%`;
        quizElements.btnNext.style.display = 'inline-block';
    }

    if(quizElements.btnNext) {
        quizElements.btnNext.addEventListener('click', () => {
            currentQuestion++;
            if(currentQuestion < quizData.length) {
                loadQuestion();
            } else {
                showResults();
            }
        });
    }

    if(quizElements.btnRestart) {
        quizElements.btnRestart.addEventListener('click', initQuiz);
    }

    function showResults() {
        quizElements.container.style.display = 'none';
        quizElements.results.style.display = 'block';
        quizElements.resScore.textContent = score;
        
        const percent = score / quizData.length;
        if(percent === 1) {
            quizElements.resIcon.innerHTML = '<i class="fa-solid fa-trophy" style="color:#F39C12"></i>';
            quizElements.resMsg.textContent = "Керемет! Сіз барлық сұраққа дұрыс жауап бердіңіз. (Отлично! Вы ответили на все вопросы.)";
        } else if (percent >= 0.7) {
            quizElements.resIcon.innerHTML = '<i class="fa-solid fa-star" style="color:#4CAF50"></i>';
            quizElements.resMsg.textContent = "Жақсы нәтиже! Біліміңіз өте жақсы. (Хороший результат!)";
        } else if (percent >= 0.4) {
            quizElements.resIcon.innerHTML = '<i class="fa-solid fa-thumbs-up" style="color:#4CAF50"></i>';
            quizElements.resMsg.textContent = "Жаман емес, бірақ тақырыптарды қайталау керек. (Неплохо, но нужно повторить темы.)";
        } else {
            quizElements.resIcon.innerHTML = '<i class="fa-solid fa-book" style="color:#F44336"></i>';
            quizElements.resMsg.textContent = "Қосымша оқу керек! Модульдерге оралып, материалды қайталаңыз. (Нужно дополнительно почитать!)";
        }
    }

    // Initialize Quiz silently 
    if(quizElements.container) initQuiz();


    // ---- Topics Logic ----
    const topicsData = {
        "1": {
            term: "I Тоқсан",
            title: "Ұлттық тағамдар",
            theory: `
                <h3>Грамматика: Қарсылықты салалас құрмалас сөйлем</h3>
                <p><strong>Сложносочиненное противительное предложение</strong> (Қарсылықты салалас) — состоит из простых предложений, смыслы которых противопоставлены друг другу.</p>
                <div class="theory-highlight">
                    <p><strong>Жалғаулық шылаулар (Противительные союзы):</strong> <em>бірақ (но), алайда (однако), дегенмен (тем не менее), әйтсе де (хотя), сонда да (все же).</em></p>
                </div>
                <p><em>Мысалы:</em> Далада қар жауып тұр, <strong>бірақ</strong> күн суық емес. (На улице идет снег, <strong>но</strong> не холодно.)</p>

                <h3>Лексика: Қазақтың ұлттық тағамдары</h3>
                <p>Қазақ халқының тағамдары негізінен ет және сүт өнімдерінен (сүт тағамдары) тұрады. <strong>Ет тағамдары:</strong> бешбармақ, қазы, қарта, қуырдақ. <strong>Сүт тағамдары:</strong> қымыз (бие сүті), шұбат (түйе сүті), құрт, ірімшік, айран.</p>
            `,
            task: `
                <h4><i class="fa-solid fa-pen-nib"></i> 1-тапсырма. Грамматика</h4>
                <div class="task-content">
                    <p>Төмендегі сөйлемге тиісті жалғаулықты таңдаңыз:</p>
                    <div class="task-question-box">
                        "Мен қазы-қартаны жақсы көремін, <strong>[ ? ]</strong> күнде жей бермеймін."
                    </div>
                    <div class="task-options-grid">
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, false, 'Қате. «Және» - ыңғайлас (соединительный) жалғаулық.')">және</button>
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, true, 'Дұрыс! «Алайда»/«Бірақ» - қарсылықты жалғаулық.')">алайда</button>
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, false, 'Қате. «Себебі» - себеп-салдар жалғаулығы.')">себебі</button>
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, false, 'Қате. «Немесе» - талғаулы жалғаулық.')">немесе</button>
                    </div>
                </div>

                <h4 style="margin-top: 30px;"><i class="fa-solid fa-utensils"></i> 2-тапсырма. Лексика</h4>
                <div class="task-content">
                    <p>Қайсысы <strong>сүт тағамына</strong> (сүт өнімдеріне) жатпайды?</p>
                    <div class="task-options-grid">
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, false, 'Қате. Шұбат - түйе сүтінен жасалады.')">Шұбат</button>
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, true, 'Өте жақсы! Қазы - ет тағамы.')">Қазы</button>
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, false, 'Қате. Құрт - сүттен жасалады.')">Құрт</button>
                    </div>
                </div>
            `
        },
        "2": {
            term: "II Тоқсан",
            title: "Қолөнер және бейнелеу өнері",
            theory: `
                <h3>Грамматика: Етістіктің шақтары (Осы шақ)</h3>
                <p><strong>Етістік (Глагол)</strong> — обозначает действие предмета. В казахском языке 3 времени глагола.</p>
                <div class="theory-highlight">
                    <p><strong>Нақ осы шақ (Собственно-настоящее время)</strong> образуется с помощью четырех вспомогательных глаголов: <em>отыр (сидеть), тұр (стоять), жүр (ходить), жатыр (лежать)</em>.</p>
                </div>
                <p><em>Мысалы:</em> Шебер ағаштан кесе жасап <strong>отыр</strong>. (Мастер <strong>сейчас делает</strong> пиалу из дерева).</p>

                <h3>Лексика: Қолөнер және бейнелеу өнері</h3>
                <p>Қолөнер (Ремесло) — ұлттық мәдениеттің маңызды бөлігі. <strong>Зергерлер</strong> (ювелиры) алтын мен күмістен әшекейлер (сырға, білезік, сақина) жасайды. Ағаш шеберлері домбыра, сандық жасайды.</p>
            `,
            task: `
                <h4><i class="fa-solid fa-lightbulb"></i> 1-тапсырма. Грамматика</h4>
                <div class="task-content">
                    <p>Қай сөйлем "нақ осы шақта" (собственно-настоящее время) тұр?</p>
                    <div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;">
                        <button class="btn btn-outline task-btn-block" onclick="window.checkTaskBtn(this, false, 'Қате. Бұл ауыспалы келер шақ. (Это будущее время)')">1. Мен сурет саламын.</button>
                        <button class="btn btn-outline task-btn-block" onclick="window.checkTaskBtn(this, true, 'Дұрыс! «Тұр» көмекші етістігі нақ осы шақты білдіреді.')">2. Суретші музейде суретке қарап тұр.</button>
                        <button class="btn btn-outline task-btn-block" onclick="window.checkTaskBtn(this, false, 'Қате. Бұл өткен шақ. (Это прошедшее время)')">3. Ол жаңа көрмеге барды.</button>
                    </div>
                </div>

                <h4 style="margin-top: 30px;"><i class="fa-solid fa-palette"></i> 2-тапсырма. Логика</h4>
                <div class="task-content">
                    <p>Алтын мен күмістен әшекей бұйымдар (сырға, білезік) жасайтын шеберді кім деп атаймыз?</p>
                    <div class="task-options-grid">
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, false, 'Қате. Ағаш ұстасы (плотник) ағаштан бұйымдар жасайды.')">Ағаш ұстасы</button>
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, true, 'Дұрыс! Зергер (ювелир) алтын мен күміспен жұмыс істейді.')">Зергер</button>
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, false, 'Қате. Етікші (сапожник) аяқ киім тігеді.')">Етікші</button>
                    </div>
                </div>
            `
        },
        "3": {
            term: "III Тоқсан",
            title: "Кино өнері",
            theory: `
                <h3>Грамматика: Сан есім түрлері</h3>
                <p><strong>Сан есім (Имя числительное)</strong> в казахском языке делится на 6 видов:</p>
                <ul class="styled-list">
                    <li><strong>Есептік (Количественные):</strong> бір, он, жүз. <em>(Қанша? Неше?)</em></li>
                    <li><strong>Реттік (Порядковые):</strong> бірінші, оныншы. <em>(Нешінші?)</em></li>
                    <li><strong>Жинақтық (Собирательные):</strong> біреу, екеу, үшеу (от 1 до 7). <em>(Нешеу?)</em></li>
                </ul>
                
                <h3>Лексика: Қазақ киносының тарихы</h3>
                <p>Қазақ кино өнерінің атасы — <strong>Шәкен Айманов</strong>. Ең танымал фильмдері: «Тақиялы періште» (Ангел в тюбетейке), «Атаманның ақыры» (Конец атамана). 1938 жылы алғашқы «Амангелді» фильмі түсірілген.</p>
            `,
            task: `
                <h4><i class="fa-solid fa-clapperboard"></i> 1-тапсырма. Ақиқат/Жалған</h4>
                <div class="task-content">
                    <p>Сұрақ: "Төртеу" (четверо) сөзі реттік (порядковое) сан есімге жатады.</p>
                    <div class="task-options-grid" style="grid-template-columns: 1fr 1fr; margin-top: 15px;">
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, false, 'Қате. «Төртеу» Нешеу? сұрағына жауап береді (Жинақтық).')">Ақиқат (Правда)</button>
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, true, 'Дұрыс! Бұл жинақтық (собирательное) сан есім.')">Жалған (Ложь)</button>
                    </div>
                </div>

                <h4 style="margin-top: 30px;"><i class="fa-solid fa-film"></i> 2-тапсырма. Сәйкестендіру</h4>
                <div class="task-content">
                    <p>1938 жылы түсірілген ең алғашқы қазақ фильмі қалай аталады?</p>
                    <div class="task-options-grid">
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, true, 'Өте дұрыс! «Амангелді» - ең алғашқы дыбысты қазақ фильмі.')">Амангелді</button>
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, false, 'Қате. Бұл фильм кейінірек түсірілген.')">Тақиялы періште</button>
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, false, 'Қате. Бұл фильм кейінірек түсірілген.')">Атаманның ақыры</button>
                    </div>
                </div>
            `
        },
        "4": {
            term: "IV Тоқсан",
            title: "Сәулет өнері",
            theory: `
                <h3>Грамматика: Жалқы есім және Біріккен сөздер</h3>
                <p><strong>Жалқы есім (Собственные имена)</strong> — адам аттары, жер-су аттары, мемлекет базарлары бас әріппен жазылады: <em>Алматы, Есіл өзені, Азамат.</em></p>
                <div class="theory-highlight">
                    <p><strong>Біріккен сөздер (Сложные/слитные слова)</strong> — образуются путем слияния двух корней и пишутся слитно: <em>немере (не+мере), Астана (Ас+тана), өнеркәсіп (өнер+кәсіп).</em></p>
                </div>
                
                <h3>Лексика: Ұлттық сәулет өнері</h3>
                <p>Сәулет өнері — ғимараттар мен ескерткіштер салу өнері. Қазақтардың дәстүрлі баспанасы — <strong>киіз үй (юрта)</strong>. Бұл көшпелі халық үшін өте ыңғайлы құрылыс.</p>
                <p>Қазақстанның заманауи сәулет өнерінің символы — <strong>Бәйтерек</strong> монументі. Оның биіктігі 97 метр.</p>
            `,
            task: `
                <h4><i class="fa-solid fa-city"></i> 1-тапсырма. Талдау (Анализ)</h4>
                <div class="task-content">
                    <p>Төмендегі сөздердің ішінен <strong>біріккен сөзді (слитные слова)</strong> табыңыз:</p>
                    <div class="task-options-grid" style="margin-top: 15px;">
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, false, 'Қате. Бұл тіркесті сөз (Словосочетание).')">Күзгі бақ</button>
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, true, 'Дұрыс! (Ақ+тау) бірігіп жасалған сөз.')">Ақтау</button>
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, false, 'Қате. Бұл қос сөз (Парное слово).')">Ата-ана</button>
                    </div>
                </div>

                <h4 style="margin-top: 30px;"><i class="fa-solid fa-monument"></i> 2-тапсырма. Мәдениет</h4>
                <div class="task-content">
                    <p>Астана қаласының символы, биіктігі 97 метрлік монумент қалай аталады?</p>
                    <div class="task-options-grid">
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, false, 'Қате. Киіз үй - дәстүрлі баспана.')">Киіз үй</button>
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, false, 'Қате. Бұл Түркістандағы тарихи кесене.')">Қожа Ахмет Ясауи кесенесі</button>
                        <button class="btn btn-outline" onclick="window.checkTaskBtn(this, true, 'Керемет! Бәйтерек - заманауи сәулет өнерінің үлгісі.')">Бәйтерек</button>
                    </div>
                </div>
            `
        }
    };


    function loadTopic(topicId) {
        try {
            const t = topicsData[topicId];
            if(!t) {
                document.getElementById('topic-title').textContent = "Қате: Тақырып табылмады (" + topicId + ")";
                document.getElementById('topic-theory').innerHTML = "<p>topicsData ішінде " + (typeof topicId) + " '" + topicId + "' жоқ.</p>";
                return;
            }
            const termEl = document.getElementById('topic-term');
            const titleEl = document.getElementById('topic-title');
            const theoryEl = document.getElementById('topic-theory');
            const taskEl = document.getElementById('interactive-task');
            
            if (termEl) termEl.textContent = t.term;
            if (titleEl) titleEl.textContent = t.title;
            if (theoryEl) theoryEl.innerHTML = t.theory;
            if (taskEl) taskEl.innerHTML = t.task;
        } catch (err) {
            document.getElementById('topic-title').textContent = "JS Error!";
        }
    }
});

// Global function for handling task clicks
window.checkTaskBtn = function(btn, isCorrect, msg) {
    let feedbackDiv = btn.parentElement.querySelector('.task-feedback-msg');
    if(!feedbackDiv) {
        feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'task-feedback-msg';
        btn.parentElement.appendChild(feedbackDiv);
    }
    
    // Remove active state from all buttons in this group
    const allBtns = btn.parentElement.querySelectorAll('.btn-outline');
    allBtns.forEach(b => {
            b.classList.remove('active-correct');
            b.classList.remove('active-incorrect');
    });

    if(isCorrect) {
        btn.classList.add('active-correct');
        feedbackDiv.innerHTML = `<span style="color:#2E7D32; font-weight:600;"><i class="fa-solid fa-circle-check"></i> ${msg}</span>`;
        feedbackDiv.style.backgroundColor = '#E8F5E9';
    } else {
        btn.classList.add('active-incorrect');
        feedbackDiv.innerHTML = `<span style="color:#C62828; font-weight:600;"><i class="fa-solid fa-circle-xmark"></i> ${msg}</span>`;
        feedbackDiv.style.backgroundColor = '#FFEBEE';
    }
    
    feedbackDiv.style.padding = '12px';
    feedbackDiv.style.marginTop = '15px';
    feedbackDiv.style.borderRadius = '8px';
    feedbackDiv.style.animation = 'fadeIn 0.3s ease';
};

// ---- AI Assistant Logic ----
document.addEventListener('DOMContentLoaded', () => {
    function createAIAssistant() {
        const aiContainer = document.createElement('div');
        aiContainer.id = 'ai-widget-container';
        aiContainer.innerHTML = `
            <button id="ai-widget-toggle" class="ai-btn" aria-label="AI Assistant">
                <i class="fa-solid fa-robot"></i>
            </button>
            <div id="ai-chat-window" class="ai-chat-hidden">
                <div class="ai-chat-header">
                    <h3><i class="fa-solid fa-robot"></i> Абай AI</h3>
                    <button id="ai-chat-close"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="ai-chat-body" id="ai-chat-messages">
                    <div class="ai-msg ai-bot">
                        <p>Сәлеметсіз бе! Мен Абай AI ассистентімін. Қазақ тілін үйренуге қандай көмегім қажет?</p>
                    </div>
                </div>
                <div class="ai-chat-input-area">
                    <input type="text" id="ai-chat-input" placeholder="Сұрағыңызды жазыңыз...">
                    <button id="ai-chat-send"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
        `;
        document.body.appendChild(aiContainer);

        // Event Listeners
        const toggleBtn = document.getElementById('ai-widget-toggle');
        const closeBtn = document.getElementById('ai-chat-close');
        const chatWindow = document.getElementById('ai-chat-window');
        const sendBtn = document.getElementById('ai-chat-send');
        const inputField = document.getElementById('ai-chat-input');
        const messagesContainer = document.getElementById('ai-chat-messages');

        toggleBtn.addEventListener('click', () => {
            chatWindow.classList.toggle('ai-chat-hidden');
            if(!chatWindow.classList.contains('ai-chat-hidden')) {
                inputField.focus();
            }
        });

        closeBtn.addEventListener('click', () => {
            chatWindow.classList.add('ai-chat-hidden');
        });

        function addMessage(text, sender) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `ai-msg ai-${sender}`;
            msgDiv.innerHTML = `<p>${text}</p>`;
            messagesContainer.appendChild(msgDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            return msgDiv;
        }

        function processAIResponse(userText) {
            let response = "Кешіріңіз, мен сұрағыңызды толық түсінбедім. Қазақ тілінің грамматикасы немесе лексикасы бойынша сұрақ қойсаңыз болады.";
            const lowerText = userText.toLowerCase();

            if (lowerText.includes("сәлем") || lowerText.includes("аман") || lowerText.includes("привет") || lowerText.includes("здравствуй")) {
                response = "Сәлеметсіз бе! Қандай тақырыпты талқылағыңыз келеді? Мәселен, 'салалас құрмалас' немесе 'сан есім' туралы сұрай аласыз.";
            } else if (lowerText.includes("қарсылықты") || lowerText.includes("салалас")) {
                response = "Қарсылықты салалас құрмалас сөйлем — екі жай сөйлемнің мағынасы бір-біріне қарсы қойылады. Жалғаулықтары: бірақ, алайда, дегенмен. Мысалы: 'Күн суытты, бірақ біз далаға шықтық.'";
            } else if (lowerText.includes("етістік") || lowerText.includes("шақ") || lowerText.includes("осы шақ")) {
                response = "Етістіктің нақ осы шағы: отыр, тұр, жүр, жатыр көмекші етістіктері арқылы жасалады. Мысалы: 'Мен қазір кітап оқып отырмын.'";
            } else if (lowerText.includes("сан есім")) {
                response = "Сан есімдердің түрлері бар: есептік (бір, он), реттік (бірінші, оныншы), жинақтық (үшеу, бесеу). Сұрақтары: Қанша? Неше? Нешінші? Нешеу?";
            } else if (lowerText.includes("тағам") || lowerText.includes("бешбармақ") || lowerText.includes("қымыз") || lowerText.includes("еда")) {
                response = "Қазақтың ұлттық тағамдары: ет тағамдары (бешбармақ, қазы-қарта, қуырдақ) және сүт тағамдары (қымыз, шұбат, құрт, айран). 'Бешбармақ' - ең басты тағам.";
            } else if (lowerText.includes("өнер") || lowerText.includes("кино") || lowerText.includes("искусство") || lowerText.includes("сәулет") || lowerText.includes("архитектура")) {
                response = "Қазақ кино өнерінің атасы – Шәкен Айманов. Танымал фильмі: 'Тақиялы періште'. Ал сәулет өнеріне келсек, көшпелілердің негізгі баспанасы – киіз үй. Қазіргі заман символы – Бәйтерек.";
            } else if (lowerText.includes("тест") || lowerText.includes("тапсырма") || lowerText.includes("тестирование")) {
                response = "Жоғарыдағы мәзірден 'ТЕСТ' бөліміне өтіп, 10 сұрақтан тұратын интерактивті тест арқылы біліміңізді тексере аласыз.";
            } else if (lowerText.includes("сөздік") || lowerText.includes("сөз") || lowerText.includes("словарь")) {
                response = "Жаңа сөздерді жаттау үшін сайттың 'ФЛЕШ-КАРТАЛАР' немесе 'СӨЗДІК' бөлімін қолданыңыз. Онда іздеу жүйесі бар.";
            } else if (lowerText.includes("ыңғайлас")) {
                response = "Ыңғайлас салалас құрмалас сөйлем — оқиғаның, іс-әрекеттің мезгілдес не бағыттас екенін білдіреді. Жалғаулықтары: және, әрі, мен/бен/пен. Мысалы: 'Жел басылды, күн ашылды.'";
            } else if (lowerText.includes("себеп") || lowerText.includes("салдар")) {
                response = "Себеп-салдар салалас құрмалас сөйлемде бірінші сөйлем екіншісінің себебін білдіреді. Жалғаулықтары: өйткені, себебі, сондықтан. Мысалы: 'Жаңбыр жауды, сондықтан жер су болды.'";
            } else if (lowerText.includes("рахмет") || lowerText.includes("спасибо")) {
                response = "Оқасы жоқ! Тағы сұрақтарыңыз болса мархабат.";
            }

            // Show typing indicator
            const typingDiv = document.createElement('div');
            typingDiv.className = 'ai-msg ai-bot';
            typingDiv.innerHTML = `
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            `;
            messagesContainer.appendChild(typingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            setTimeout(() => {
                typingDiv.remove();
                addMessage(response, 'bot');
            }, 1000);
        }

        sendBtn.addEventListener('click', () => {
            const text = inputField.value.trim();
            if (text) {
                addMessage(text, 'user');
                inputField.value = '';
                processAIResponse(text);
            }
        });

        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendBtn.click();
            }
        });
    }

    createAIAssistant();

    // ---- Scroll Animations ----
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.module-card, .feature-item, .author-card, .section-header, .interactive-task, .topic-theory, .hero-image');
    animatedElements.forEach(el => {
        el.classList.add('fade-up');
        observer.observe(el);
    });
});

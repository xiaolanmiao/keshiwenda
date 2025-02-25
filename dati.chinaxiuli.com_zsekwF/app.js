document.addEventListener('DOMContentLoaded', function () {
    let questionList = [];
    let quizIndex = 0;
    let score = 0;
    let timer = null;
    let time = 60;
    let isPaused = false;
    let startTime = null;
    let questionCount = 10; // 默认题目数量

    // 获取用户选择的科室
    function getSelectedDepartment() {
        const departmentSelect = document.getElementById('department-select');
        return departmentSelect ? departmentSelect.value : null;
    }

    // 监听科室选择的变化，重新加载题目
    document.getElementById('department-select').addEventListener('change', function() {
        loadQuestions(); // 当科室发生变化时重新加载问题数据
    });

    // 从服务器加载题目数量
    async function loadQuestionCount() {
        const department = getSelectedDepartment(); // 获取选择的科室
        if (!department) {
            console.error('No department selected.');
            throw new Error('No department selected');
        }
        try {
            const response = await fetch(`/get_questions_count.php?department=${department}`);
            if (!response.ok) {
                throw new Error('Failed to load questions count');
            }
            const data = await response.json();
            console.log('服务器返回的数据:', data);
            questionCount = parseInt(data.questionCount, 10);
            return questionCount;
        } catch (error) {
            console.error('Error loading question count:', error);
            throw new Error('Failed to load questions count');
        }
    }

    // 从服务器加载题目数据
    async function loadQuestions() {
        try {
            await loadQuestionCount(); // 先加载题目数量

            const department = getSelectedDepartment(); // 获取选择的科室
            const response = await fetch(`/get_questions.php?department=${department}`);
            if (!response.ok) {
                throw new Error('Failed to load questions');
            }
            const data = await response.json();
            console.log('服务器返回的数据:', data);

            if (!Array.isArray(data.questions)) {
                throw new Error('Invalid questions format');
            }

            // 根据题目数量随机挑选题目
            const selectedQuestions = selectRandomQuestions(data.questions, questionCount);
            questionList = selectedQuestions.map(question => ({
                ...question,
                options: JSON.parse(question.options)
            }));

            console.log('加载的问题数据：', questionList);
        } catch (error) {
            console.error('Error loading questions:', error);
            displayError('无法加载题目数据，请稍后再试。');
        }
    }
    // 从数组中随机选择指定数量的题目
    function selectRandomQuestions(questions, count) {
        const shuffled = questions.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // 显示错误信息
    function displayError(message) {
        const errorContainer = document.querySelector('.error-container');
        if (errorContainer) {
            errorContainer.innerHTML = message;
            errorContainer.style.display = 'block';
        } else {
            alert(message);
        }
    }

    // 初始化游戏并开始
    function startQuiz() {
        if (questionList.length === 0) {
            console.error('No questions available.');
            displayError('没有可用的问题，请检查设置。');
            return;
        }

        console.log('开始游戏');

        startTime = new Date().toISOString(); // 记录游戏开始时间

        questionList = shuffleArray(questionList);
        
        // 隐藏姓名和手机号输入框，以及开始按钮
        document.querySelectorAll('.input-group').forEach(group => group.style.display = 'none');
        document.querySelector('.submit-btn').style.display = 'none';

        document.querySelector('.timer').style.display = 'block';
        document.querySelector('.score').style.display = 'block';
        document.querySelector('.q-title').style.display = 'block';
        document.querySelector('.q-content').style.display = 'block';
        document.querySelector('.options').style.display = 'block';

        generateQuiz();
        startTimer();
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function generateQuiz() {
        console.log('generateQuiz function called');
        const currentQuestion = questionList[quizIndex];

        if (!currentQuestion || !currentQuestion.image || !currentQuestion.options || !currentQuestion.correctAnswer) {
            console.error('Invalid question data:', currentQuestion);
            displayError('题目数据无效，请联系管理员。');
            return;
        }

        console.log('Current question:', currentQuestion);

        const qTitle = document.querySelector('.q-title');
        const optionContent = document.querySelectorAll('.option-content');

        qTitle.innerHTML = `问题${quizIndex + 1}：`;
        console.log('设置题目标题为:', qTitle.innerHTML);

        const imageUrl = currentQuestion.image;

        console.log('Image URL:', imageUrl);
        updateQuestionImage(imageUrl, () => {
            optionContent.forEach((opt, idx) => {
                opt.querySelector('span').innerHTML = currentQuestion.options[idx];
                console.log(`设置选项 ${idx + 1}: ${currentQuestion.options[idx]}`);
                opt.onclick = () => checkAnswer(opt, idx);
            });

            console.log('选项设置完成，恢复计时器');
            resumeTimer();
        });

        console.log('暂停计时器');
        pauseTimer();
    }

    function updateQuestionImage(url, callback) {
        const imgElement = document.querySelector('.question-image');
        const loadingText = document.querySelector('.loading-text');

        imgElement.style.opacity = 0;
        loadingText.style.display = 'block';

        console.log('开始加载图片:', url);

        const img = new Image();
        img.src = url;

        img.onload = () => {
            console.log('图片加载成功:', url);
            imgElement.src = url;
            imgElement.style.display = 'block';
            imgElement.onload = () => {
                loadingText.style.display = 'none';
                imgElement.style.opacity = 1;
                console.log('图片已显示');
                if (callback) callback();
            };
        };

        img.onerror = () => {
            console.error('图片加载失败:', url);
            loadingText.textContent = '图片加载失败';
            if (callback) callback();
        };
    }

    function checkAnswer(ele, idx) {
        const selectedOption = ele.querySelector('span').innerHTML;
        const correctAnswer = questionList[quizIndex].correctAnswer;

        console.log(`用户选择了: ${selectedOption}, 正确答案是: ${correctAnswer}`);

        questionList[quizIndex].selectedAnswer = selectedOption;

        if (selectedOption === correctAnswer) {
            score += 10;
            document.querySelector('.score').innerText = `得分：${score}`;
            console.log('回答正确，得分:', score);
            alert('恭喜你，回答正确！');
        } else {
            console.log('回答错误');
            alert(`很遗憾，回答错误！正确的答案是${correctAnswer}`);
        }

        quizIndex++;
        if (quizIndex < questionList.length) {
            generateQuiz();
        } else {
            endQuiz();
        }
    }

    function startTimer() {
        console.log('开始计时器');
        timer = setInterval(() => {
            if (!isPaused) {
                if (time > 0) {
                    const minutes = Math.floor(time / 60);
                    const seconds = time % 60;
                    document.querySelector('.timer').innerHTML = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
                    time--;
                } else {
                    endQuiz();
                }
            }
        }, 1000);
    }

    function pauseTimer() {
        isPaused = true;
        console.log('计时器已暂停');
    }

    function resumeTimer() {
        isPaused = false;
        console.log('计时器已恢复');
    }

    function endQuiz() {
        clearInterval(timer);
        document.querySelector('.timer').innerHTML = '00:00';
        console.log('游戏结束，总分:', score);

        saveQuizResult();

        document.querySelector('.q-title').style.display = 'none';
        document.querySelector('.q-content').style.display = 'none';
        document.querySelector('.options').style.display = 'none';
        document.querySelector('.timer').style.display = 'none';
        document.querySelector('.score').style.display = 'none';
        document.querySelector('.quiz-container').style.display = 'none';

        showSummary();
    }

    async function saveQuizResult() {
        const userData = {
            phone: document.getElementById('phone').value,
            name: document.getElementById('name').value,
            score: score,
            totalQuestions: questionList.length,
            correctAnswers: questionList.filter(q => q.selectedAnswer === q.correctAnswer).length,
            startTime: startTime,
            endTime: new Date().toISOString()
        };

        try {
            const response = await fetch('save_user.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (result.status === 'success') {
                console.log('答题结果保存成功');
            } else {
                console.error('Error saving quiz result:', result.message);
            }
        } catch (error) {
            console.error('Error saving quiz result:', error);
        }
    }

    function showSummary() {
        const summaryContainer = document.querySelector('.summary-container');
        const finalScoreElement = document.querySelector('.final-score');
        const summaryList = document.querySelector('.summary-list');

        finalScoreElement.innerHTML = `最终得分：${score} 分`;
        summaryList.innerHTML = '';

        questionList.forEach((question, index) => {
            const listItem = document.createElement('li');
            const isCorrect = question.correctAnswer === question.selectedAnswer;
            listItem.style.color = isCorrect ? 'green' : 'red';
            listItem.innerHTML = `${isCorrect ? '✔' : '✘'} ${question.correctAnswer} - 你选择了 ${question.selectedAnswer || '未选择'}`;
            summaryList.appendChild(listItem);

            listItem.addEventListener('click', () => {
                showImageModal(question);
            });
        });

        summaryContainer.style.display = 'block';
    }

    function showImageModal(question) {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const doctorName = document.getElementById('doctorName');
        const doctorHospital = document.getElementById('doctorHospital');
        const doctorDescription = document.getElementById('doctorDescription');

        console.log('显示图片模态框:', question.image);

        modalImage.src = question.image;
        doctorName.innerHTML = question.correctAnswer;
        doctorHospital.innerHTML = '医院及职称信息';
        doctorDescription.innerHTML = '医生简介';

        modal.style.display = 'block';
    }

    document.querySelector('.close-btn').addEventListener('click', () => {
        const modal = document.getElementById('imageModal');
        modal.style.display = 'none';
        console.log('关闭图片模态框');
    });

    document.querySelector('.close').addEventListener('click', () => {
        const modal = document.getElementById('imageModal');
        modal.style.display = 'none';
        console.log('关闭图片模态框');
    });

    document.querySelector('.restart-btn').addEventListener('click', () => {
        console.log('重新开始游戏');
        location.reload();
    });

    document.querySelector('.submit-btn').addEventListener('click', () => {
        console.log('点击开始游戏按钮');
        startQuiz();
    });

    document.getElementById('phone').addEventListener('input', function () {
        const phoneInput = document.getElementById('phone');
        const phoneError = document.getElementById('phone-error');
        const submitBtn = document.querySelector('.submit-btn');
        const phoneValue = phoneInput.value;
        const nameValue = document.getElementById('name').value.trim();

        const phoneRegex = /^1[3-9]\d{9}$/;

        if (phoneRegex.test(phoneValue) && nameValue !== '') {
            phoneError.textContent = '';
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
            phoneError.textContent = '请输入有效的手机号';
        }
    });

    document.getElementById('name').addEventListener('input', function () {
        const phoneValue = document.getElementById('phone').value;
        const nameValue = document.getElementById('name').value.trim();
        const submitBtn = document.querySelector('.submit-btn');

        const phoneRegex = /^1[3-9]\d{9}$/;

        if (phoneRegex.test(phoneValue) && nameValue !== '') {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    });

    loadQuestions();
});

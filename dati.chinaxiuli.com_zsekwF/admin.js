document.addEventListener('DOMContentLoaded', function () {
    const departments = ['urology', 'hematology']; // 仅保留泌尿科和血液科
    const departmentSettingsContainer = document.getElementById('department-settings');

    // 动态生成科室设置块
    departments.forEach(department => {
        const departmentBlock = document.createElement('div');
        departmentBlock.className = 'department-block';

        departmentBlock.innerHTML = `
            <h3>${department} 设置</h3>
            <label for="question-count-${department}">题目数量：</label>
            <input type="number" id="question-count-${department}" min="1" max="100" value="10">
            <button id="save-question-count-${department}">保存题目数量</button>
            <button id="refresh-names-${department}">刷新姓名列表</button>
            <button id="refresh-questions-${department}">刷新题目</button>
        `;

        departmentSettingsContainer.appendChild(departmentBlock);

        // 绑定按钮事件
        document.getElementById(`save-question-count-${department}`).addEventListener('click', () => saveQuestionCount(department));
        document.getElementById(`refresh-names-${department}`).addEventListener('click', () => refreshNameList(department));
        document.getElementById(`refresh-questions-${department}`).addEventListener('click', () => generateAndSaveQuestions(department));

        // 加载当前科室的设置
        loadDepartmentSettings(department);
    });

    // 加载当前科室的设置
    async function loadDepartmentSettings(department) {
        try {
            const questionCountKey = `questionCount_${department}`;
            const imagePathKey = `image_path_${department}`;

            const response = await fetch(`/get_settings.php?questionCountKey=${questionCountKey}&imagePathKey=${imagePathKey}`);
            const data = await response.json();

            if (data.status === 'success') {
                document.getElementById(`question-count-${department}`).value = data.questionCount || 10;
            } else {
                throw new Error('加载设置失败');
            }
        } catch (error) {
            console.error(`Error loading settings for ${department}:`, error);
        }
    }

    // 保存题目数量到数据库
    async function saveQuestionCount(department) {
        const questionCount = document.getElementById(`question-count-${department}`).value;
        const questionCountKey = `questionCount_${department}`;
        try {
            const response = await fetch('/save_question_count.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ questionCount, questionCountKey })
            });

            if (response.ok) {
                alert(`${department} 的题目数量已保存！`);
            } else {
                throw new Error('保存题目数量失败');
            }
        } catch (error) {
            console.error(`Error saving question count for ${department}:`, error);
            alert(`${department} 的题目数量保存失败，请稍后再试。`);
        }
    }

    // 刷新姓名列表并存入数据库
    async function refreshNameList(department) {
        try {
            const response = await fetch(`/get_questions_and_images.php?department=${department}`);
            const result = await response.json();
            if (result.status === 'success') {
                alert(`${department} 的姓名列表生成成功，共生成了 ${result.namesInserted} 条记录。`);
            } else {
                throw new Error('姓名列表生成失败');
            }
        } catch (error) {
            console.error(`Error refreshing name list for ${department}:`, error);
            alert(`${department} 的姓名列表生成失败，请稍后再试。`);
        }
    }

    // 生成并保存题目
async function generateAndSaveQuestions(department) {
    try {
        const questions = await generateQuestions(department);
        await saveQuestionsToDatabase(questions, department);
        alert(`${department} 的题目生成成功，共生成了 ${questions.length} 道题目，并保存到数据库！`);
    } catch (error) {
        console.error(`Error generating questions for ${department}:`, error);
        alert(`${department} 的题目生成失败，请稍后再试。`);
    }
}

    // 生成题目数据
async function generateQuestions(department) {
    try {
        const response = await fetch(`/fetch_random_names.php?department=${department}`);
        const nameList = await response.json();

        const questions = nameList.map(name => {
            const options = generateOptions(name, nameList);
            return {
                image: `path/to/${department}/${name}.jpg`,
                correctAnswer: name,
                options
            };
        });

        console.log(`${department} 科室的题目生成成功，共生成了 ${questions.length} 个题目`);
        return questions;
    } catch (error) {
        console.error(`Error generating questions for ${department}:`, error);
        throw error;
    }
}
    // 保存题目到数据库
async function saveQuestionsToDatabase(questions, department) {
    try {
        const response = await fetch('/save_questions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ questions, department }) // department 应该作为 JSON 数据的一部分传递
        });

        if (!response.ok) {
            throw new Error('Failed to save questions');
        }

        console.log(`${department} 的题目已成功保存到数据库`);
    } catch (error) {
        console.error(`Error saving questions to database for ${department}:`, error);
        throw error;
    }
}

    // 生成选项
    function generateOptions(correctAnswer, nameList) {
        const options = [correctAnswer];
        const randomNames = nameList.filter(name => name !== correctAnswer).sort(() => 0.5 - Math.random());

        while (options.length < 4 && randomNames.length > 0) {
            options.push(randomNames.pop());
        }

        return options.sort(() => Math.random() - 0.5);
    }
});

const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(bodyParser.json());

const sequelize = new Sequelize('dati_chinaxiuli_', 'dati_chinaxiuli_', 'dati', {
    host: 'localhost',
    dialect: 'mysql'
});

// 定义模型
const Question = sequelize.define('Question', {
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    correctAnswer: {
        type: DataTypes.STRING,
        allowNull: false
    },
    options: {
        type: DataTypes.TEXT, // 使用 TEXT 类型来代替 JSON
        allowNull: false
    }
});

// 同步数据库（如果表不存在则创建）
sequelize.sync();

// 获取所有问题
app.get('/questions', async (req, res) => {
    const questions = await Question.findAll();
    // 将 options 字段从 TEXT 转换为 JSON
    const formattedQuestions = questions.map(question => ({
        ...question.dataValues,
        options: JSON.parse(question.options) // 解析为 JSON 格式
    }));
    res.json(formattedQuestions);
});

// 保存或更新问题
app.post('/questions', async (req, res) => {
    const questions = req.body;

    // 删除现有的所有问题
    await Question.destroy({ where: {}, truncate: true });

    // 将 options 字段转换为字符串形式保存
    const formattedQuestions = questions.map(question => ({
        ...question,
        options: JSON.stringify(question.options) // 转换为字符串格式
    }));

    // 插入新问题
    await Question.bulkCreate(formattedQuestions);
    res.status(200).send('Questions saved.');
});

// 启动服务器
app.listen(3000, () => {
    console.log('Server running on http://localhost:888');
});

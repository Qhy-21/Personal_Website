const skillGroups = {
  '语言 & 基础': [
    { name: 'Java', level: 70 },
    { name: 'JavaScript', level: 65 },
    { name: 'C / C++', level: 65 },
    { name: 'Python', level: 60 },
    { name: '数据结构与算法', level: 60 },
    { name: 'OOP', level: 60 },
    { name: '计算机网络', level: 55 },
  ],
  '后端技术': [
    { name: 'JavaWeb', level: 70 },
    { name: 'Node.js', level: 65 },
    { name: 'MySQL', level: 65 },
    { name: 'RESTful API', level: 65 },
    { name: 'SpringBoot', level: 60 },
    { name: 'Koa 2', level: 60 },
    { name: 'MyBatis-Plus', level: 55 },
    { name: 'JWT', level: 55 },
    { name: 'Maven', level: 55 },
    { name: 'Netty', level: 40 },
  ],
  '前端 & 工具': [
    { name: 'Markdown', level: 70 },
    { name: 'HTML / CSS / JS', level: 65 },
    { name: 'Vue 3', level: 60 },
    { name: 'Vite', level: 60 },
    { name: 'Git', level: 60 },
    { name: 'Android SDK', level: 60 },
    { name: 'Postman', level: 50 },
    { name: 'Linux', level: 40 },
  ],
  'AI / ML 专项': [
    { name: '机器学习理论', level: 55 },
    { name: 'scikit-learn', level: 55 },
    { name: 'numpy / pandas', level: 55 },
    { name: 'Jupyter', level: 60 },
  ],
}

export const groupKeys = ['语言 & 基础', '后端技术', '前端 & 工具', 'AI / ML 专项']

export const groupNameMap = {
  '语言 & 基础': { 'zh-CN': '语言 & 基础', en: 'Languages & Fundamentals' },
  '后端技术': { 'zh-CN': '后端技术', en: 'Backend' },
  '前端 & 工具': { 'zh-CN': '前端 & 工具', en: 'Frontend & Tools' },
  'AI / ML 专项': { 'zh-CN': 'AI / ML 专项', en: 'AI / ML' },
}

export default skillGroups

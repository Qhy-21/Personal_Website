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

export const groupMetaMap = {
  '语言 & 基础': {
    mark: '{ }',
    description: {
      'zh-CN': '底层语言、算法与计算机基础，构成整个知识系统的引力核心。',
      en: 'Languages, algorithms, and computer science fundamentals form the gravitational core of the system.',
    },
  },
  '后端技术': {
    mark: 'API',
    description: {
      'zh-CN': '从请求进入系统，到数据落盘与服务通信，关注稳定而清晰的工程链路。',
      en: 'From incoming requests to persistence and service communication, focused on reliable engineering paths.',
    },
  },
  '前端 & 工具': {
    mark: '</>',
    description: {
      'zh-CN': '把结构、交互与工具链组织成可感知、可维护的产品体验。',
      en: 'Structure, interaction, and tooling shaped into experiences that feel clear and remain maintainable.',
    },
  },
  'AI / ML 专项': {
    mark: 'AI',
    description: {
      'zh-CN': '从数据处理出发，理解模型如何学习、如何被评估，以及下一步往哪里探索。',
      en: 'Starting with data, exploring how models learn, how they are evaluated, and where to go next.',
    },
  },
}

export default skillGroups

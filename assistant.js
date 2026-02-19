// 快速提问功能
function askQuestion(question) {
    document.getElementById('chatInput').value = question;
    sendMessage();
}

// ---------------------------
// DeepSeek API (optional)
// ---------------------------

const DEFAULT_CONFIG = {
    DEEPSEEK_API_KEY: '',
    DEEPSEEK_API_URL: 'https://api.deepseek.com/chat/completions',
    DEEPSEEK_MODEL: 'deepseek-chat',
    GYM_NAME: '活力健身馆',
    GYM_LOCATION: '香港大学'
};

function getConfig() {
    const cfg = (typeof window !== 'undefined' && window.CONFIG) ? window.CONFIG : {};
    return { ...DEFAULT_CONFIG, ...cfg };
}

// In-memory conversation history for the API (simple, page-lifetime only)
const conversationHistory = [];

// Gentle hint if API key is not configured (shown once per page load)
try {
    const cfg = getConfig();
    if (!cfg.DEEPSEEK_API_KEY) {
        console.info('[AI助手] 未配置 DeepSeek API Key，将使用离线规则回答。可在 config.js 中填入 DEEPSEEK_API_KEY 以启用联网模型。');
    }
} catch (_) {}

// Gym course packages (templates) — used by the model for recommendations
// Keep in sync with `training.js` coursePackages.
const GYM_COURSE_PACKAGES = [
    {
        id: 'all',
        name: '🏋️ 基础健身课程',
        targetAreas: ['arms', 'legs', 'core', 'chest', 'back', 'cardio'],
        instructor: '张教练',
        duration: '90分钟',
        frequency: '每周3次',
        price: '¥599/月',
        schedule: '周一、周三、周五 19:00-20:30',
        description: '适合健身新手的全面基础课程，涵盖全身各部位基础训练（力量+有氧+拉伸），建立动作模式与训练习惯。'
    },
    {
        id: 'strength_arms_legs',
        name: '💪 力量增强课程',
        targetAreas: ['arms', 'legs'],
        instructor: '李教练',
        duration: '75分钟',
        frequency: '每周3次',
        price: '¥499/月',
        schedule: '周二、周四、周六 19:00-20:15',
        description: '专注手臂与下肢力量提升的系统课程，偏复合动作与渐进负重，提升整体力量与运动表现。'
    },
    {
        id: 'full_body_strength',
        name: '🔥 全身力量强化课程',
        targetAreas: ['arms', 'legs', 'core', 'chest', 'back'],
        instructor: '王教练',
        duration: '80分钟',
        frequency: '每周3次',
        price: '¥549/月',
        schedule: '周一、周三、周五 18:00-19:20',
        description: '覆盖手臂/下肢/核心/胸/背的系统力量训练，适合想整体提升力量与体态的人群。'
    },
    {
        id: 'upper_body_strength',
        name: '💪 上肢力量课程',
        targetAreas: ['arms', 'chest', 'back'],
        instructor: '张教练',
        duration: '70分钟',
        frequency: '每周3次',
        price: '¥449/月',
        schedule: '周二、周四、周六 18:30-19:40',
        description: '上肢综合（手臂+胸+背）强化，兼顾力量与体态，适合长期伏案/圆肩人群。'
    },
    {
        id: 'lower_body_strength',
        name: '🦵 下肢力量课程',
        targetAreas: ['legs', 'core'],
        instructor: '李教练',
        duration: '65分钟',
        frequency: '每周3次',
        price: '¥429/月',
        schedule: '周一、周三、周五 19:30-20:35',
        description: '下肢+核心专项强化，围绕深蹲/硬拉/单腿稳定性训练，提升力量与稳定性。'
    },
    {
        id: 'core_focus',
        name: '🎯 核心力量专项课程',
        targetAreas: ['core'],
        instructor: '王教练',
        duration: '50分钟',
        frequency: '每周4次',
        price: '¥349/月',
        schedule: '周一至周四 19:00-19:50',
        description: '核心稳定与力量专项，包含腹肌/侧腹/下背训练，改善体态与运动表现。'
    },
    {
        id: 'cardio_strength',
        name: '❤️ 有氧力量结合课程',
        targetAreas: ['cardio'],
        instructor: '赵教练',
        duration: '60分钟',
        frequency: '每周4次',
        price: '¥399/月',
        schedule: '周一至周四 18:00-19:00',
        description: '有氧+力量结合，兼顾心肺与力量基础，适合想提升耐力与体能的人群。'
    },
    {
        id: 'arms_focus',
        name: '💪 手臂力量专项课程',
        targetAreas: ['arms'],
        instructor: '张教练',
        duration: '55分钟',
        frequency: '每周2次',
        price: '¥299/月',
        schedule: '周二、周五 19:00-19:55',
        description: '手臂专项（含二头/三头/前臂），强调动作标准与渐进超负荷。'
    },
    {
        id: 'legs_focus',
        name: '🦵 下肢力量专项课程',
        targetAreas: ['legs'],
        instructor: '李教练',
        duration: '60分钟',
        frequency: '每周2次',
        price: '¥329/月',
        schedule: '周三、周六 19:00-20:00',
        description: '下肢专项（大腿/臀/小腿），提升力量与下肢线条。'
    }
];

// Coach profiles (templates) — for “哪个教练更好/评价” questions.
const GYM_COACHES = [
    {
        name: '张教练',
        rating: 4.8,
        years: 8,
        specialties: ['力量训练', '上肢训练', '动作模式纠正'],
        style: '标准严格、讲解细、适合想把动作打扎实的人'
    },
    {
        name: '李教练',
        rating: 4.7,
        years: 7,
        specialties: ['下肢训练', '力量提升', '训练计划安排'],
        style: '节奏清晰、推进稳，适合想提升力量与训练系统性的人'
    },
    {
        name: '王教练',
        rating: 4.6,
        years: 6,
        specialties: ['核心稳定', '体态改善', '康复性训练思路（轻度）'],
        style: '更关注稳定与细节，适合腰背不适/想改善体态的人'
    },
    {
        name: '赵教练',
        rating: 4.5,
        years: 5,
        specialties: ['心肺训练', 'HIIT', '体能提升'],
        style: '氛围感强、带课有节奏，适合想提升体能/耐力的人'
    }
];

function buildSystemPrompt() {
    const cfg = getConfig();
    return `你是${cfg.GYM_LOCATION}${cfg.GYM_NAME}的AI健身顾问助手。你的主要任务是帮助用户解决健身/营养/训练/路线相关问题，并在合适的时候自然地给出课程建议（不要硬广）。\n\n` +
        `【场馆信息】\n- 地点：${cfg.GYM_LOCATION}\n\n` +
        `【课程库（可推荐）】\n${JSON.stringify(GYM_COURSE_PACKAGES, null, 2)}\n\n` +
        `【教练信息（可对比评价）】\n${JSON.stringify(GYM_COACHES, null, 2)}\n\n` +
        `【输出要求】\n` +
        `1) 用中文，友好、专业、简洁。\n` +
        `2) 当用户问“推荐上什么课/选哪个课”时：根据用户的不足/目标，推荐1-3门最合适的课程（按最推荐→备选的顺序），并给出理由（匹配点：目标/部位/频率/时间）。\n` +
        `3) 当用户问“哪个教练更好/评价更好/怎么选教练”时：基于rating/特长/风格客观比较，不要绝对化；如果信息不足先提1-2个澄清问题。\n` +
        `4) 如果用户问题与健身无关：可以简短回答，但最后用一句自然的话把话题带回健身/课程（可选）。\n` +
        `5) 不要编造不存在的地址细节（比如具体楼层/门牌），只说“香港大学校园内”。\n`;
}

async function callDeepSeek(userMessage) {
    const cfg = getConfig();
    const apiKey = (cfg.DEEPSEEK_API_KEY || '').trim();
    if (!apiKey) return null;

    // NOTE: If DeepSeek API doesn’t allow browser CORS, this will fail and we’ll fallback.
    const payload = {
        model: cfg.DEEPSEEK_MODEL,
        messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...conversationHistory,
            { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 900
    };

    const resp = await fetch(cfg.DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
    });

    if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`DeepSeek API error: ${resp.status} ${text}`.slice(0, 400));
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    return String(content);
}

// 发送消息
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;

    const messagesDiv = document.getElementById('chatMessages');
    const sendBtn = document.getElementById('sendBtn');
    
    // 禁用发送按钮
    sendBtn.disabled = true;
    
    // 显示用户消息
    const userMsg = document.createElement('div');
    userMsg.className = 'message user';
    userMsg.textContent = message;
    messagesDiv.appendChild(userMsg);
    
    input.value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // 显示加载状态
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'message assistant loading';
    loadingMsg.textContent = '正在思考...';
    messagesDiv.appendChild(loadingMsg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
        // 保存用户消息到全局变量，供本地函数使用
        window.lastUserMessage = message;

        // 先尝试 DeepSeek（有 key 才会调用）
        let responseText = null;
        try {
            responseText = await callDeepSeek(message);
        } catch (e) {
            console.warn('DeepSeek 调用失败，已降级到本地助手：', e);
        }

        // 降级到本地规则
        if (!responseText) {
            // 轻微的“思考”延迟，让体验更自然
            await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
            responseText = generateAIResponse(message);
        } else {
            // 更新历史（只记录 API 模式的纯文本，避免把 HTML 注入给模型）
            conversationHistory.push({ role: 'user', content: message });
            conversationHistory.push({ role: 'assistant', content: responseText });
            // 限制历史长度，避免请求过大
            if (conversationHistory.length > 16) {
                conversationHistory.splice(0, conversationHistory.length - 16);
            }
        }

        // 移除加载消息
        messagesDiv.removeChild(loadingMsg);

        // 显示AI回复
        const assistantMsg = document.createElement('div');
        assistantMsg.className = 'message assistant';
        assistantMsg.innerHTML = String(responseText).replace(/\n/g, '<br>');
        messagesDiv.appendChild(assistantMsg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } catch (error) {
        messagesDiv.removeChild(loadingMsg);
        const errorMsg = document.createElement('div');
        errorMsg.className = 'message assistant';
        errorMsg.textContent = '抱歉，发生了错误。请稍后再试。错误信息：' + error.message;
        messagesDiv.appendChild(errorMsg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } finally {
        // 重新启用发送按钮
        sendBtn.disabled = false;
    }
}

// 生成AI回复
function generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    window.lastUserMessage = userMessage; // 保存原始消息
    
    // 先检查是否是通用问题（数学、常识等）
    const generalAnswer = handleGeneralQuestion(userMessage);
    if (generalAnswer) {
        return generalAnswer;
    }
    
    // 识别问题类型和关键词
    const analysis = analyzeQuestion(message);
    
    // 生成回答
    let response = '';
    
    if (analysis.type === 'fitness_weakness') {
        response = generateFitnessAdvice(analysis);
        // 自然地推荐课程
        const courseRecommendation = recommendCourses(analysis.keywords);
        if (courseRecommendation) {
            response += '<br><br>' + courseRecommendation;
        }
    } else if (analysis.type === 'nutrition') {
        response = generateNutritionAdvice(analysis);
    } else if (analysis.type === 'navigation') {
        response = generateNavigationAdvice(analysis);
    } else if (analysis.type === 'general_fitness') {
        response = generateGeneralFitnessAdvice(analysis);
        // 如果涉及具体部位，也推荐课程
        const courseRecommendation = recommendCourses(analysis.keywords);
        if (courseRecommendation) {
            response += '<br><br>' + courseRecommendation;
        }
    } else {
        // 对于无法识别的问题，友好地引导
        response = generatePoliteRedirect(userMessage);
    }
    
    return response;
}

// 处理通用问题（数学、常识等）
function handleGeneralQuestion(userMessage) {
    const message = userMessage.trim();
    
    // 数学问题
    if (isMathQuestion(message)) {
        const mathAnswer = calculateMath(message);
        if (mathAnswer !== null) {
            return `${mathAnswer}<br><br><span style="color: #666; font-size: 0.9em;">💡 顺便提一下，如果您有健身相关的问题，我很乐意为您解答！</span>`;
        }
    }
    
    // 简单常识问题
    if (isCommonKnowledgeQuestion(message)) {
        return answerCommonKnowledge(message);
    }
    
    // 问候语
    if (isGreeting(message)) {
        return `您好！我是活力健身馆的AI助手，很高兴为您服务！<br><br>我可以帮助您解答健身、营养、路线导航等相关问题。请问有什么可以帮助您的？`;
    }
    
    return null;
}

// 判断是否是数学问题
function isMathQuestion(message) {
    // 匹配数学表达式：数字、运算符、等号
    const mathPattern = /^[\d+\-*/().\s=]+$/;
    // 或者包含常见的数学问题关键词
    const mathKeywords = ['等于', '加', '减', '乘', '除', '一加一', '二加二', '计算', '算'];
    
    if (mathPattern.test(message.replace(/\s/g, '')) && message.length < 50) {
        return true;
    }
    
    for (const keyword of mathKeywords) {
        if (message.includes(keyword)) {
            return true;
        }
    }
    
    return false;
}

// 计算数学表达式
function calculateMath(message) {
    try {
        // 特殊处理常见的中文数学问题
        if (message.includes('一加一') || message.match(/1\s*[+＋]\s*1/) || message === '1+1' || message === '1 + 1') {
            return `<strong>计算结果：</strong>1 + 1 = 2`;
        }
        if (message.includes('二加二') || message.match(/2\s*[+＋]\s*2/) || message === '2+2' || message === '2 + 2') {
            return `<strong>计算结果：</strong>2 + 2 = 4`;
        }
        if (message.includes('三加三') || message.match(/3\s*[+＋]\s*3/) || message === '3+3' || message === '3 + 3') {
            return `<strong>计算结果：</strong>3 + 3 = 6`;
        }
        if (message.includes('一加二') || message.match(/1\s*[+＋]\s*2/) || message === '1+2' || message === '1 + 2') {
            return `<strong>计算结果：</strong>1 + 2 = 3`;
        }
        
        // 处理简单的加减乘除表达式
        // 提取数字和运算符
        const cleanMessage = message.replace(/[^0-9+\-*/().=等于加减乘除]/g, '');
        
        // 处理中文运算符
        let expression = cleanMessage
            .replace(/等于/g, '=')
            .replace(/加/g, '+')
            .replace(/减/g, '-')
            .replace(/乘/g, '*')
            .replace(/除/g, '/')
            .replace(/=/g, '')
            .trim();
        
        // 只处理简单的表达式（最多两个数字和一个运算符）
        const simplePattern = /^(\d+)\s*([+\-*/])\s*(\d+)$/;
        const match = expression.match(simplePattern);
        
        if (match) {
            const num1 = parseFloat(match[1]);
            const operator = match[2];
            const num2 = parseFloat(match[3]);
            
            let result;
            switch (operator) {
                case '+':
                    result = num1 + num2;
                    break;
                case '-':
                    result = num1 - num2;
                    break;
                case '*':
                    result = num1 * num2;
                    break;
                case '/':
                    if (num2 === 0) {
                        return `<strong>错误：</strong>除数不能为零`;
                    }
                    result = num1 / num2;
                    break;
                default:
                    return null;
            }
            
            return `<strong>计算结果：</strong>${num1} ${operator} ${num2} = ${result}`;
        }
        
        // 处理等号形式的问题（如 "1+1=?" 或 "1+1等于几"）
        if (message.includes('等于') || message.includes('=')) {
            const equalMatch = message.match(/(\d+)\s*([+\-*/])\s*(\d+)/);
            if (equalMatch) {
                const num1 = parseFloat(equalMatch[1]);
                const operator = equalMatch[2];
                const num2 = parseFloat(equalMatch[3]);
                
                let result;
                switch (operator) {
                    case '+':
                        result = num1 + num2;
                        break;
                    case '-':
                        result = num1 - num2;
                        break;
                    case '*':
                        result = num1 * num2;
                        break;
                    case '/':
                        if (num2 === 0) {
                            return `<strong>错误：</strong>除数不能为零`;
                        }
                        result = num1 / num2;
                        break;
                    default:
                        return null;
                }
                
                return `<strong>计算结果：</strong>${num1} ${operator} ${num2} = ${result}`;
            }
        }
        
    } catch (error) {
        return null;
    }
    
    return null;
}

// 判断是否是常识问题
function isCommonKnowledgeQuestion(message) {
    const commonQuestions = {
        '今天星期几': '抱歉，我无法获取实时日期信息。建议您查看手机或日历。',
        '现在几点': '抱歉，我无法获取实时时间信息。建议您查看手机或时钟。',
        '天气怎么样': '抱歉，我无法获取天气信息。建议您查看天气预报应用。',
        '你是谁': '我是活力健身馆的AI助手，专门帮助您解答健身、营养、路线导航等相关问题。',
        '你叫什么': '我是活力健身馆的AI助手，您可以叫我"小健"或"健身助手"。',
        '你好': '您好！我是活力健身馆的AI助手，很高兴为您服务！',
        'hello': '您好！我是活力健身馆的AI助手，很高兴为您服务！',
        'hi': '您好！我是活力健身馆的AI助手，很高兴为您服务！'
    };
    
    for (const [question, answer] of Object.entries(commonQuestions)) {
        if (message.includes(question)) {
            return true;
        }
    }
    
    return false;
}

// 回答常识问题
function answerCommonKnowledge(message) {
    const answers = {
        '今天星期几': '抱歉，我无法获取实时日期信息。建议您查看手机或日历。<br><br>💡 如果您有健身相关的问题，我很乐意为您解答！',
        '现在几点': '抱歉，我无法获取实时时间信息。建议您查看手机或时钟。<br><br>💡 如果您有健身相关的问题，我很乐意为您解答！',
        '天气怎么样': '抱歉，我无法获取天气信息。建议您查看天气预报应用。<br><br>💡 如果您有健身相关的问题，我很乐意为您解答！',
        '你是谁': '我是活力健身馆的AI助手，专门帮助您解答健身、营养、路线导航等相关问题。请问有什么可以帮助您的？',
        '你叫什么': '我是活力健身馆的AI助手，您可以叫我"小健"或"健身助手"。请问有什么可以帮助您的？',
        '你好': '您好！我是活力健身馆的AI助手，很高兴为您服务！我可以帮助您解答健身、营养、路线导航等相关问题。',
        'hello': '您好！我是活力健身馆的AI助手，很高兴为您服务！我可以帮助您解答健身、营养、路线导航等相关问题。',
        'hi': '您好！我是活力健身馆的AI助手，很高兴为您服务！我可以帮助您解答健身、营养、路线导航等相关问题。'
    };
    
    for (const [question, answer] of Object.entries(answers)) {
        if (message.includes(question)) {
            return answer;
        }
    }
    
    return null;
}

// 判断是否是问候语
function isGreeting(message) {
    const greetings = ['你好', 'hello', 'hi', 'hey', '您好', '早上好', '下午好', '晚上好', '嗨'];
    return greetings.some(greeting => message.toLowerCase().includes(greeting.toLowerCase()));
}

// 生成礼貌的重定向回复
function generatePoliteRedirect(userMessage) {
    return `我理解您的问题，但作为活力健身馆的AI助手，我主要专注于帮助您解答以下方面的问题：<br><br>
• 💪 健身训练计划和动作指导<br>
• 🥗 营养饮食建议（减脂、增肌等）<br>
• 📍 来健身馆的路线导航<br>
• ❓ 健身相关问题解答<br><br>
如果您有这些方面的问题，我很乐意为您详细解答！<br><br>
<span style="color: #666; font-size: 0.9em;">💡 提示：您也可以尝试问一些健身相关的问题，比如"我手臂缺乏力量该怎么办？"或"我想减脂应该吃什么？"</span>`;
}

// 分析问题
function analyzeQuestion(message) {
    const result = {
        type: 'general',
        keywords: [],
        bodyParts: [],
        intent: null
    };
    
    // 识别身体部位关键词
    const bodyPartKeywords = {
        'arms': ['手臂', '胳膊', '二头肌', '三头肌', '前臂', '上臂'],
        'legs': ['腿', '下肢', '大腿', '小腿', '股四头肌', '股二头肌', '臀部', '臀'],
        'core': ['核心', '腹肌', '腹部', '腰', '腰部', '下背', '侧腹'],
        'chest': ['胸', '胸部', '胸肌'],
        'back': ['背', '背部', '背阔肌', '斜方肌', '菱形肌'],
        'cardio': ['心肺', '有氧', '耐力', '跑步', '游泳', 'hiit']
    };
    
    // 识别问题类型
    if (message.includes('缺乏') || message.includes('不足') || message.includes('薄弱') || 
        message.includes('怎么练') || message.includes('如何提升') || message.includes('如何加强')) {
        result.type = 'fitness_weakness';
        result.intent = 'improve';
    } else if (message.includes('营养') || message.includes('饮食') || message.includes('吃') || 
               message.includes('减脂') || message.includes('增肌') || message.includes('减肥')) {
        result.type = 'nutrition';
    } else if (message.includes('路线') || message.includes('怎么走') || message.includes('怎么去') || 
               message.includes('地址') || message.includes('地铁') || message.includes('开车') || 
               message.includes('导航') || message.includes('位置')) {
        result.type = 'navigation';
    } else if (message.includes('健身') || message.includes('训练') || message.includes('运动') || 
               message.includes('锻炼') || message.includes('计划')) {
        result.type = 'general_fitness';
    }
    
    // 识别身体部位
    for (const [part, keywords] of Object.entries(bodyPartKeywords)) {
        for (const keyword of keywords) {
            if (message.includes(keyword)) {
                result.bodyParts.push(part);
                result.keywords.push(keyword);
                break;
            }
        }
    }
    
    return result;
}

// 生成健身建议
function generateFitnessAdvice(analysis) {
    const advice = {
        'arms': {
            title: '💪 关于手臂力量提升',
            content: `针对手臂力量不足的问题，我建议您采用以下训练方法：

<strong>1. 二头肌训练</strong>
• 哑铃弯举：3-4组，每组10-12次
• 杠铃弯举：3-4组，每组8-10次
• 锤式弯举：3组，每组12-15次

<strong>2. 三头肌训练</strong>
• 三头肌下压：3-4组，每组12-15次
• 窄距俯卧撑：3组，每组10-15次
• 仰卧臂屈伸：3组，每组10-12次

<strong>3. 训练频率</strong>
建议每周训练2-3次，每次训练间隔至少48小时，给肌肉充分的恢复时间。

<strong>4. 注意事项</strong>
• 动作要标准，避免借力
• 循序渐进增加重量
• 训练后充分拉伸
• 保证充足的蛋白质摄入`
        },
        'legs': {
            title: '🦵 关于下肢力量提升',
            content: `针对下肢力量不足的问题，我建议您采用以下训练方法：

<strong>1. 股四头肌训练</strong>
• 深蹲：4组，每组10-12次
• 腿举：3-4组，每组12-15次
• 弓步蹲：3组，每组每侧10次

<strong>2. 股二头肌训练</strong>
• 罗马尼亚硬拉：3-4组，每组10-12次
• 腿弯举：3组，每组12-15次

<strong>3. 臀部训练</strong>
• 臀桥：3-4组，每组15-20次
• 保加利亚分腿蹲：3组，每组每侧10次

<strong>4. 训练建议</strong>
• 每周训练2-3次
• 注意动作标准，保护膝盖
• 训练前充分热身
• 训练后拉伸放松`
        },
        'core': {
            title: '🎯 关于核心力量提升',
            content: `针对核心力量不足的问题，我建议您采用以下训练方法：

<strong>1. 腹直肌训练</strong>
• 卷腹：4组，每组20-25次
• 悬垂举腿：3组，每组10-15次
• V字起身：3组，每组12-15次

<strong>2. 侧腹训练</strong>
• 俄罗斯转体：3组，每组30次
• 侧平板支撑：3组，每组每侧45-60秒

<strong>3. 下背部训练</strong>
• 超人式：3组，每组15-20次
• 硬拉：3组，每组10-12次

<strong>4. 训练频率</strong>
核心肌群恢复较快，可以每周训练3-4次，但要注意强度控制。`
        },
        'chest': {
            title: '🏋️ 关于胸部力量提升',
            content: `针对胸部力量不足的问题，我建议您采用以下训练方法：

<strong>1. 上胸训练</strong>
• 上斜卧推：4组，每组10-12次
• 上斜哑铃推举：3组，每组12次

<strong>2. 中胸训练</strong>
• 平板卧推：4组，每组8-10次
• 平板飞鸟：3组，每组12-15次

<strong>3. 下胸训练</strong>
• 下斜卧推：3组，每组10-12次
• 双杠臂屈伸：3组，每组10-15次

<strong>4. 训练建议</strong>
• 每周训练2次，间隔至少72小时
• 注意肩部保护，避免过度训练
• 循序渐进增加重量`
        },
        'back': {
            title: '🔥 关于背部力量提升',
            content: `针对背部力量不足的问题，我建议您采用以下训练方法：

<strong>1. 背阔肌训练</strong>
• 引体向上：4组，每组8-10次
• 高位下拉：4组，每组12-15次
• 单臂划船：3组，每组每侧10-12次

<strong>2. 斜方肌训练</strong>
• 耸肩：3组，每组15-20次
• 直立划船：3组，每组12次

<strong>3. 菱形肌训练</strong>
• 坐姿划船：4组，每组12次
• 反向飞鸟：3组，每组15次

<strong>4. 训练建议</strong>
• 每周训练2次
• 注意动作标准，避免圆肩
• 训练后充分拉伸`
        },
        'cardio': {
            title: '❤️ 关于心肺耐力提升',
            content: `针对心肺耐力不足的问题，我建议您采用以下训练方法：

<strong>1. 有氧跑步</strong>
• 慢跑：每周3-4次，每次30-45分钟
• 间歇跑：每周1-2次，快跑1分钟+慢跑2分钟，重复10组

<strong>2. HIIT训练</strong>
• 波比跳：4组，每组10-15次
• 高抬腿：4组，每组30秒
• 开合跳：4组，每组30秒

<strong>3. 游泳</strong>
• 自由泳：每周2-3次，每次30-40分钟
• 间歇游泳：快游50米+慢游50米，重复10组

<strong>4. 训练建议</strong>
• 循序渐进，不要一开始就高强度
• 注意心率控制
• 训练前后充分热身和拉伸`
        }
    };
    
    if (analysis.bodyParts.length > 0) {
        const part = analysis.bodyParts[0];
        if (advice[part]) {
            return `<strong>${advice[part].title}</strong><br><br>${advice[part].content}`;
        }
    }
    
    return `针对您的问题，我建议您：

<strong>1. 制定系统训练计划</strong>
根据您的具体情况，制定有针对性的训练计划，包括训练动作、组数、次数和频率。

<strong>2. 循序渐进</strong>
不要急于求成，从基础动作开始，逐步增加强度和难度。

<strong>3. 保证恢复</strong>
肌肉生长发生在休息时，要保证充足的睡眠和营养。

<strong>4. 寻求专业指导</strong>
如果有条件，建议在专业教练的指导下进行训练，可以避免受伤并提高效率。`;
}

// 生成营养建议
function generateNutritionAdvice(analysis) {
    if (analysis.keywords.includes('减脂') || analysis.keywords.includes('减肥')) {
        return `<strong>🍎 减脂饮食建议</strong><br><br>
<strong>1. 控制总热量</strong>
• 每日热量摄入应低于消耗300-500大卡
• 建议使用热量追踪APP记录

<strong>2. 高蛋白饮食</strong>
• 每公斤体重摄入1.5-2g蛋白质
• 推荐：鸡胸肉、鱼肉、鸡蛋、豆腐、低脂奶制品

<strong>3. 控制碳水化合物</strong>
• 选择复合碳水：燕麦、糙米、红薯、全麦面包
• 避免精制糖和加工食品

<strong>4. 健康脂肪</strong>
• 适量摄入：坚果、牛油果、橄榄油
• 占总热量的20-30%

<strong>5. 多喝水</strong>
• 每天至少2-3升水
• 餐前喝水有助于控制食欲

<strong>6. 餐次安排</strong>
• 少食多餐，每3-4小时进食一次
• 训练前1-2小时补充少量碳水
• 训练后30分钟内补充蛋白质`;
    } else if (analysis.keywords.includes('增肌')) {
        return `<strong>💪 增肌饮食建议</strong><br><br>
<strong>1. 热量盈余</strong>
• 每日热量摄入应高于消耗300-500大卡
• 确保有足够能量支持肌肉生长

<strong>2. 高蛋白摄入</strong>
• 每公斤体重摄入2-2.5g蛋白质
• 推荐：牛肉、鸡胸肉、鱼肉、鸡蛋、蛋白粉

<strong>3. 充足碳水化合物</strong>
• 训练前后补充碳水，提供能量
• 推荐：米饭、面条、土豆、香蕉

<strong>4. 健康脂肪</strong>
• 适量摄入优质脂肪
• 推荐：坚果、牛油果、深海鱼

<strong>5. 训练前后营养</strong>
• 训练前：适量碳水（香蕉、燕麦）
• 训练后：蛋白质+碳水（蛋白粉+香蕉）

<strong>6. 充足水分</strong>
• 每天至少3-4升水
• 训练中及时补充水分`;
    } else {
        return `<strong>🥗 健康饮食建议</strong><br><br>
<strong>1. 均衡营养</strong>
• 保证蛋白质、碳水化合物、脂肪的合理比例
• 多吃新鲜蔬菜和水果

<strong>2. 优质蛋白质</strong>
• 每餐包含优质蛋白：鸡胸肉、鱼肉、鸡蛋、豆类

<strong>3. 复合碳水化合物</strong>
• 选择全谷物：燕麦、糙米、全麦面包

<strong>4. 健康脂肪</strong>
• 适量摄入：坚果、牛油果、橄榄油

<strong>5. 充足水分</strong>
• 每天至少2-3升水

<strong>6. 规律饮食</strong>
• 定时定量，避免暴饮暴食`;
    }
}

// 生成导航建议
function generateNavigationAdvice(analysis) {
    const gymLocation = {
        name: '活力健身馆',
        address: '香港大学',
        details: '位于香港大学校园内'
    };
    
    // 获取原始消息（从全局或参数传递）
    const userMessage = window.lastUserMessage || '';
    
    let response = `<strong>📍 来活力健身馆的路线</strong><br><br>
<strong>地址：</strong>${gymLocation.address} - ${gymLocation.details}<br><br>`;
    
    if (userMessage.includes('地铁') || userMessage.includes('mtr')) {
        response += `<strong>🚇 地铁路线：</strong><br>
• 乘坐港岛线到<strong>香港大学站</strong><br>
• 从A2出口出站<br>
• 步行约5-8分钟即可到达健身馆<br>
• 地铁站内有清晰的指示牌指引<br><br>`;
    }
    
    if (userMessage.includes('开车') || userMessage.includes('驾车') || userMessage.includes('停车')) {
        response += `<strong>🚗 开车路线：</strong><br>
• 导航至"香港大学"<br>
• 校园内有停车场，建议提前预约<br>
• 停车费用：首2小时免费，之后每小时$10<br>
• 建议使用校园导航系统查找最近的停车场<br><br>`;
    }
    
    if (!userMessage.includes('地铁') && !userMessage.includes('开车')) {
        response += `<strong>🚇 地铁路线：</strong><br>
• 乘坐港岛线到<strong>香港大学站</strong>，A2出口，步行5-8分钟<br><br>
<strong>🚗 开车路线：</strong><br>
• 导航至"香港大学"，校园内有停车场<br>
• 停车：首2小时免费，之后每小时$10<br><br>`;
    }
    
    response += `<strong>💡 温馨提示：</strong><br>
• 建议提前预约体验课程<br>
• 首次到访可联系前台获取详细指引<br>
• 校园内有多处指示牌，方便找到健身馆位置`;
    
    return response;
}

// 生成一般健身建议
function generateGeneralFitnessAdvice(analysis) {
    return `关于健身训练，我给您以下建议：

<strong>1. 制定训练计划</strong>
根据您的目标（增肌、减脂、提升力量等），制定系统的训练计划，包括训练频率、动作选择和强度安排。

<strong>2. 动作标准</strong>
确保每个动作的标准性，这比重量更重要。不标准的动作容易导致受伤，效果也会大打折扣。

<strong>3. 循序渐进</strong>
不要急于求成，从基础开始，逐步增加强度和难度。给身体适应的时间。

<strong>4. 充分恢复</strong>
肌肉生长发生在休息时，要保证充足的睡眠（7-9小时）和营养补充。

<strong>5. 热身和拉伸</strong>
训练前充分热身，训练后拉伸放松，可以预防受伤并提高训练效果。

<strong>6. 寻求专业指导</strong>
如果是新手，建议在专业教练的指导下开始训练，可以避免错误动作和受伤风险。`;
}

// 推荐课程
function recommendCourses(keywords) {
    // 课程映射
    const keywordToCourses = {
        '手臂': ['arms_biceps', 'arms_triceps'],
        '胳膊': ['arms_biceps', 'arms_triceps'],
        '二头肌': ['arms_biceps'],
        '三头肌': ['arms_triceps'],
        '前臂': ['arms_forearms'],
        '腿': ['legs_quadriceps', 'legs_hamstrings', 'legs_glutes', 'legs_calves'],
        '下肢': ['legs_quadriceps', 'legs_hamstrings', 'legs_glutes'],
        '大腿': ['legs_quadriceps', 'legs_hamstrings'],
        '股四头肌': ['legs_quadriceps'],
        '股二头肌': ['legs_hamstrings'],
        '臀部': ['legs_glutes'],
        '臀': ['legs_glutes'],
        '小腿': ['legs_calves'],
        '核心': ['core_abs', 'core_obliques', 'core_lower_back'],
        '腹肌': ['core_abs'],
        '腹部': ['core_abs'],
        '腰': ['core_obliques', 'core_lower_back'],
        '腰部': ['core_obliques', 'core_lower_back'],
        '侧腹': ['core_obliques'],
        '下背': ['core_lower_back'],
        '胸': ['chest_upper_chest', 'chest_middle_chest', 'chest_lower_chest'],
        '胸部': ['chest_upper_chest', 'chest_middle_chest', 'chest_lower_chest'],
        '胸肌': ['chest_upper_chest', 'chest_middle_chest', 'chest_lower_chest'],
        '上胸': ['chest_upper_chest'],
        '中胸': ['chest_middle_chest'],
        '下胸': ['chest_lower_chest'],
        '背': ['back_lats', 'back_traps', 'back_rhomboids'],
        '背部': ['back_lats', 'back_traps', 'back_rhomboids'],
        '背阔肌': ['back_lats'],
        '斜方肌': ['back_traps'],
        '菱形肌': ['back_rhomboids'],
        '心肺': ['cardio_running', 'cardio_hiit', 'cardio_swimming'],
        '有氧': ['cardio_running', 'cardio_hiit'],
        '耐力': ['cardio_running', 'cardio_hiit', 'cardio_swimming'],
        '跑步': ['cardio_running'],
        '游泳': ['cardio_swimming'],
        'hiit': ['cardio_hiit']
    };
    
    // 查找匹配的课程
    const matchedCourseIds = new Set();
    for (const keyword of keywords) {
        const courses = keywordToCourses[keyword];
        if (courses) {
            courses.forEach(id => matchedCourseIds.add(id));
        }
    }
    
    if (matchedCourseIds.size === 0) return null;
    
    // 获取课程数据（需要从training.js导入，这里先使用本地数据）
    const courses = getCourseData();
    const recommendedCourses = [];
    
    matchedCourseIds.forEach(courseId => {
        if (courses[courseId]) {
            recommendedCourses.push(...courses[courseId]);
        }
    });
    
    if (recommendedCourses.length === 0) return null;
    
    // 生成推荐文本（最多推荐2-3个课程，不要太明显）
    const coursesToShow = recommendedCourses.slice(0, Math.min(2, recommendedCourses.length));
    
    let recommendation = '<div style="margin-top: 15px; padding: 15px; background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); border-radius: 10px; border-left: 4px solid #f5576c;">';
    recommendation += '<strong>💡 顺便提一下：</strong><br>';
    recommendation += '如果您想要更系统、更专业的训练指导，我们健身馆有针对性的课程。';
    
    coursesToShow.forEach((course, index) => {
        recommendation += `<br><br><strong>${course.name}</strong><br>`;
        recommendation += `👨‍🏫 ${course.instructor} | ⏱️ ${course.duration} | ${course.frequency}<br>`;
        recommendation += `💰 ${course.price}<br>`;
        recommendation += `<span style="font-size: 0.9em; color: #666;">${course.description}</span>`;
    });
    
    recommendation += '<br><br><span style="font-size: 0.9em;">如果您感兴趣，可以到我们的"训练推荐"页面了解更多课程详情，或者直接到馆内咨询。</span>';
    recommendation += '</div>';
    
    return recommendation;
}

// 获取课程数据（简化版，实际应该从training.js导入）
function getCourseData() {
    return {
        'arms_biceps': [
            {
                name: '💪 二头肌强化课程',
                instructor: '张教练',
                duration: '60分钟',
                frequency: '每周2-3次',
                price: '¥299/月',
                description: '专业二头肌训练，包含多种弯举动作，帮助您快速提升手臂力量'
            },
            {
                name: '🔥 手臂塑形课程',
                instructor: '李教练',
                duration: '45分钟',
                frequency: '每周2次',
                price: '¥199/月',
                description: '综合手臂训练，同时锻炼二头肌和三头肌，打造完美手臂线条'
            }
        ],
        'arms_triceps': [
            {
                name: '💪 三头肌专项训练',
                instructor: '王教练',
                duration: '50分钟',
                frequency: '每周2次',
                price: '¥249/月',
                description: '针对三头肌的专业训练，包含多种下压和推举动作'
            }
        ],
        'arms_forearms': [
            {
                name: '✋ 前臂力量提升课程',
                instructor: '赵教练',
                duration: '40分钟',
                frequency: '每周2次',
                price: '¥179/月',
                description: '专注前臂和握力训练，提升整体手臂力量'
            }
        ],
        'legs_quadriceps': [
            {
                name: '🦵 股四头肌强化课程',
                instructor: '张教练',
                duration: '60分钟',
                frequency: '每周2次',
                price: '¥299/月',
                description: '专业深蹲和腿举训练，快速提升大腿前侧力量'
            }
        ],
        'legs_hamstrings': [
            {
                name: '💪 股二头肌训练课程',
                instructor: '李教练',
                duration: '55分钟',
                frequency: '每周2次',
                price: '¥279/月',
                description: '针对大腿后侧的专业训练，提升腿部整体力量'
            }
        ],
        'legs_glutes': [
            {
                name: '🍑 臀部塑形课程',
                instructor: '王教练',
                duration: '50分钟',
                frequency: '每周3次',
                price: '¥349/月',
                description: '专业臀部训练，包含深蹲、硬拉等多种动作，打造完美臀型'
            }
        ],
        'legs_calves': [
            {
                name: '👣 小腿力量提升课程',
                instructor: '赵教练',
                duration: '40分钟',
                frequency: '每周2次',
                price: '¥199/月',
                description: '专注小腿肌肉训练，提升腿部整体协调性'
            }
        ],
        'core_abs': [
            {
                name: '🎯 腹肌强化课程',
                instructor: '张教练',
                duration: '45分钟',
                frequency: '每周3-4次',
                price: '¥249/月',
                description: '专业腹肌训练，包含多种卷腹和举腿动作，打造六块腹肌'
            }
        ],
        'core_obliques': [
            {
                name: '⚡ 侧腹塑形课程',
                instructor: '李教练',
                duration: '40分钟',
                frequency: '每周2次',
                price: '¥199/月',
                description: '专注侧腹训练，打造完美腰线'
            }
        ],
        'core_lower_back': [
            {
                name: '🛡️ 下背部强化课程',
                instructor: '王教练',
                duration: '50分钟',
                frequency: '每周2次',
                price: '¥229/月',
                description: '专业下背部训练，预防腰痛，提升核心稳定性'
            }
        ],
        'chest_upper_chest': [
            {
                name: '⬆️ 上胸强化课程',
                instructor: '张教练',
                duration: '55分钟',
                frequency: '每周2次',
                price: '¥279/月',
                description: '专业上胸训练，包含上斜卧推等多种动作'
            }
        ],
        'chest_middle_chest': [
            {
                name: '➡️ 中胸塑形课程',
                instructor: '李教练',
                duration: '60分钟',
                frequency: '每周2次',
                price: '¥299/月',
                description: '专业中胸训练，包含平板卧推和飞鸟动作'
            }
        ],
        'chest_lower_chest': [
            {
                name: '⬇️ 下胸强化课程',
                instructor: '王教练',
                duration: '50分钟',
                frequency: '每周2次',
                price: '¥249/月',
                description: '专业下胸训练，包含下斜卧推和双杠臂屈伸'
            }
        ],
        'back_lats': [
            {
                name: '🦅 背阔肌强化课程',
                instructor: '张教练',
                duration: '60分钟',
                frequency: '每周2次',
                price: '¥299/月',
                description: '专业背阔肌训练，包含引体向上和高位下拉'
            }
        ],
        'back_traps': [
            {
                name: '🏔️ 斜方肌训练课程',
                instructor: '李教练',
                duration: '45分钟',
                frequency: '每周2次',
                price: '¥229/月',
                description: '专注斜方肌训练，改善体态，提升肩部力量'
            }
        ],
        'back_rhomboids': [
            {
                name: '💎 菱形肌强化课程',
                instructor: '王教练',
                duration: '50分钟',
                frequency: '每周2次',
                price: '¥249/月',
                description: '专业菱形肌训练，改善圆肩驼背，提升背部力量'
            }
        ],
        'cardio_running': [
            {
                name: '🏃 有氧跑步课程',
                instructor: '赵教练',
                duration: '45分钟',
                frequency: '每周3-4次',
                price: '¥199/月',
                description: '专业跑步指导，提升心肺功能和耐力'
            }
        ],
        'cardio_hiit': [
            {
                name: '⚡ HIIT高强度训练',
                instructor: '张教练',
                duration: '30分钟',
                frequency: '每周3次',
                price: '¥249/月',
                description: '高强度间歇训练，快速燃脂，提升心肺功能'
            }
        ],
        'cardio_swimming': [
            {
                name: '🏊 游泳训练课程',
                instructor: '李教练',
                duration: '60分钟',
                frequency: '每周2次',
                price: '¥299/月',
                description: '专业游泳指导，全身有氧运动，低冲击训练'
            }
        ]
    };
}

// 生成默认回复
function generateDefaultResponse() {
    return `您好！我是活力健身馆的AI助手，很高兴为您服务！

我可以帮助您：
• 💪 制定健身训练计划
• 🥗 提供营养饮食建议
• 📍 规划来健身馆的路线
• ❓ 解答健身相关问题

请告诉我您想了解什么，我会尽力帮助您！`;
}

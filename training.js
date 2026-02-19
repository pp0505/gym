// 选中的大板块（不足）
let selectedMainSections = new Set();
// 选中的小板块
let selectedSubSections = new Set();

// 大板块和小板块的映射关系
const mainToSubSections = {
    arms: [
        { id: 'biceps', name: '二头肌', icon: '💪' },
        { id: 'triceps', name: '三头肌', icon: '🔥' },
        { id: 'forearms', name: '前臂', icon: '✋' }
    ],
    legs: [
        { id: 'quadriceps', name: '股四头肌', icon: '🦵' },
        { id: 'hamstrings', name: '股二头肌', icon: '💪' },
        { id: 'glutes', name: '臀部', icon: '🍑' },
        { id: 'calves', name: '小腿', icon: '👣' }
    ],
    core: [
        { id: 'abs', name: '腹直肌', icon: '🎯' },
        { id: 'obliques', name: '腹斜肌', icon: '⚡' },
        { id: 'lower_back', name: '下背部', icon: '🛡️' }
    ],
    chest: [
        { id: 'upper_chest', name: '上胸', icon: '⬆️' },
        { id: 'middle_chest', name: '中胸', icon: '➡️' },
        { id: 'lower_chest', name: '下胸', icon: '⬇️' }
    ],
    back: [
        { id: 'lats', name: '背阔肌', icon: '🦅' },
        { id: 'traps', name: '斜方肌', icon: '🏔️' },
        { id: 'rhomboids', name: '菱形肌', icon: '💎' }
    ],
    cardio: [
        { id: 'running', name: '有氧跑步', icon: '🏃' },
        { id: 'hiit', name: 'HIIT训练', icon: '⚡' },
        { id: 'swimming', name: '游泳', icon: '🏊' }
    ]
};

// 大板块名称映射
const mainSectionNames = {
    arms: '手臂力量',
    legs: '下肢力量',
    core: '核心力量',
    chest: '胸部力量',
    back: '背部力量',
    cardio: '心肺耐力'
};

// 切换大板块选择（可多选）
function toggleMainSection(element, sectionId) {
    element.classList.toggle('selected');
    
    if (selectedMainSections.has(sectionId)) {
        selectedMainSections.delete(sectionId);
        // 移除该大板块下所有已选的小板块
        const subSections = mainToSubSections[sectionId];
        subSections.forEach(sub => {
            const fullId = `${sectionId}_${sub.id}`;
            selectedSubSections.delete(fullId);
        });
    } else {
        selectedMainSections.add(sectionId);
    }
    
    // 更新小板块显示
    updateSubSectionsDisplay();
    // 检查是否应该显示获取推荐按钮
    checkRecommendButton();
}

// 更新小板块显示
function updateSubSectionsDisplay() {
    const subSectionsContainer = document.getElementById('subSectionsContainer');
    const subSectionsGrid = document.getElementById('subSectionsGrid');
    
    if (selectedMainSections.size === 0) {
        subSectionsContainer.style.display = 'none';
        return;
    }
    
    subSectionsContainer.style.display = 'block';
    subSectionsGrid.innerHTML = '';
    
    // 为每个选中的大板块显示其小板块
    selectedMainSections.forEach(mainId => {
        const subSections = mainToSubSections[mainId];
        
        // 创建大板块标题
        const sectionTitle = document.createElement('div');
        sectionTitle.style.cssText = 'grid-column: 1 / -1; margin-top: 20px; margin-bottom: 10px; padding: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; color: white;';
        sectionTitle.innerHTML = `<h4 style="margin: 0; font-size: 1.2em;">${mainSectionNames[mainId]} - 选择具体部位</h4>`;
        subSectionsGrid.appendChild(sectionTitle);
        
        // 创建小板块卡片
        subSections.forEach(sub => {
            const card = document.createElement('div');
            card.className = 'body-part-card';
            const fullId = `${mainId}_${sub.id}`;
            const isSelected = selectedSubSections.has(fullId);
            if (isSelected) {
                card.classList.add('selected');
            }
            card.onclick = () => toggleSubSection(card, mainId, sub.id);
            card.innerHTML = `
                <h3>${sub.icon} ${sub.name}</h3>
            `;
            subSectionsGrid.appendChild(card);
        });
    });
}

// 切换小板块选择
function toggleSubSection(element, mainSectionId, subSectionId) {
    const fullId = `${mainSectionId}_${subSectionId}`;
    element.classList.toggle('selected');
    
    if (selectedSubSections.has(fullId)) {
        selectedSubSections.delete(fullId);
    } else {
        selectedSubSections.add(fullId);
    }
    
    // 检查是否应该显示获取推荐按钮
    checkRecommendButton();
}

// 检查是否显示获取推荐按钮
function checkRecommendButton() {
    const recommendBtn = document.getElementById('getRecommendBtn');
    if (selectedSubSections.size > 0) {
        recommendBtn.style.display = 'block';
    } else {
        recommendBtn.style.display = 'none';
    }
}

// 健身房课程数据
const gymCourses = {
    // 手臂力量课程
    'arms_biceps': [
        {
            name: '💪 二头肌强化课程',
            instructor: '张教练',
            duration: '60分钟',
            frequency: '每周2-3次',
            price: '¥299/月',
            description: '专业二头肌训练，包含多种弯举动作，帮助您快速提升手臂力量',
            schedule: '周一、周三、周五 19:00-20:00'
        },
        {
            name: '🔥 手臂塑形课程',
            instructor: '李教练',
            duration: '45分钟',
            frequency: '每周2次',
            price: '¥199/月',
            description: '综合手臂训练，同时锻炼二头肌和三头肌，打造完美手臂线条',
            schedule: '周二、周四 18:30-19:15'
        }
    ],
    'arms_triceps': [
        {
            name: '💪 三头肌专项训练',
            instructor: '王教练',
            duration: '50分钟',
            frequency: '每周2次',
            price: '¥249/月',
            description: '针对三头肌的专业训练，包含多种下压和推举动作',
            schedule: '周三、周六 19:30-20:20'
        }
    ],
    'arms_forearms': [
        {
            name: '✋ 前臂力量提升课程',
            instructor: '赵教练',
            duration: '40分钟',
            frequency: '每周2次',
            price: '¥179/月',
            description: '专注前臂和握力训练，提升整体手臂力量',
            schedule: '周一、周五 18:00-18:40'
        }
    ],
    
    // 下肢力量课程
    'legs_quadriceps': [
        {
            name: '🦵 股四头肌强化课程',
            instructor: '张教练',
            duration: '60分钟',
            frequency: '每周2次',
            price: '¥299/月',
            description: '专业深蹲和腿举训练，快速提升大腿前侧力量',
            schedule: '周二、周五 19:00-20:00'
        }
    ],
    'legs_hamstrings': [
        {
            name: '💪 股二头肌训练课程',
            instructor: '李教练',
            duration: '55分钟',
            frequency: '每周2次',
            price: '¥279/月',
            description: '针对大腿后侧的专业训练，提升腿部整体力量',
            schedule: '周三、周日 18:30-19:25'
        }
    ],
    'legs_glutes': [
        {
            name: '🍑 臀部塑形课程',
            instructor: '王教练',
            duration: '50分钟',
            frequency: '每周3次',
            price: '¥349/月',
            description: '专业臀部训练，包含深蹲、硬拉等多种动作，打造完美臀型',
            schedule: '周一、周三、周五 18:00-18:50'
        }
    ],
    'legs_calves': [
        {
            name: '👣 小腿力量提升课程',
            instructor: '赵教练',
            duration: '40分钟',
            frequency: '每周2次',
            price: '¥199/月',
            description: '专注小腿肌肉训练，提升腿部整体协调性',
            schedule: '周二、周四 19:00-19:40'
        }
    ],
    
    // 核心力量课程
    'core_abs': [
        {
            name: '🎯 腹肌强化课程',
            instructor: '张教练',
            duration: '45分钟',
            frequency: '每周3-4次',
            price: '¥249/月',
            description: '专业腹肌训练，包含多种卷腹和举腿动作，打造六块腹肌',
            schedule: '周一至周四 19:30-20:15'
        }
    ],
    'core_obliques': [
        {
            name: '⚡ 侧腹塑形课程',
            instructor: '李教练',
            duration: '40分钟',
            frequency: '每周2次',
            price: '¥199/月',
            description: '专注侧腹训练，打造完美腰线',
            schedule: '周二、周五 18:00-18:40'
        }
    ],
    'core_lower_back': [
        {
            name: '🛡️ 下背部强化课程',
            instructor: '王教练',
            duration: '50分钟',
            frequency: '每周2次',
            price: '¥229/月',
            description: '专业下背部训练，预防腰痛，提升核心稳定性',
            schedule: '周三、周六 18:30-19:20'
        }
    ],
    
    // 胸部力量课程
    'chest_upper_chest': [
        {
            name: '⬆️ 上胸强化课程',
            instructor: '张教练',
            duration: '55分钟',
            frequency: '每周2次',
            price: '¥279/月',
            description: '专业上胸训练，包含上斜卧推等多种动作',
            schedule: '周一、周四 19:00-19:55'
        }
    ],
    'chest_middle_chest': [
        {
            name: '➡️ 中胸塑形课程',
            instructor: '李教练',
            duration: '60分钟',
            frequency: '每周2次',
            price: '¥299/月',
            description: '专业中胸训练，包含平板卧推和飞鸟动作',
            schedule: '周二、周五 19:00-20:00'
        }
    ],
    'chest_lower_chest': [
        {
            name: '⬇️ 下胸强化课程',
            instructor: '王教练',
            duration: '50分钟',
            frequency: '每周2次',
            price: '¥249/月',
            description: '专业下胸训练，包含下斜卧推和双杠臂屈伸',
            schedule: '周三、周六 19:00-19:50'
        }
    ],
    
    // 背部力量课程
    'back_lats': [
        {
            name: '🦅 背阔肌强化课程',
            instructor: '张教练',
            duration: '60分钟',
            frequency: '每周2次',
            price: '¥299/月',
            description: '专业背阔肌训练，包含引体向上和高位下拉',
            schedule: '周一、周四 19:00-20:00'
        }
    ],
    'back_traps': [
        {
            name: '🏔️ 斜方肌训练课程',
            instructor: '李教练',
            duration: '45分钟',
            frequency: '每周2次',
            price: '¥229/月',
            description: '专注斜方肌训练，改善体态，提升肩部力量',
            schedule: '周二、周五 18:30-19:15'
        }
    ],
    'back_rhomboids': [
        {
            name: '💎 菱形肌强化课程',
            instructor: '王教练',
            duration: '50分钟',
            frequency: '每周2次',
            price: '¥249/月',
            description: '专业菱形肌训练，改善圆肩驼背，提升背部力量',
            schedule: '周三、周日 19:00-19:50'
        }
    ],
    
    // 心肺耐力课程
    'cardio_running': [
        {
            name: '🏃 有氧跑步课程',
            instructor: '赵教练',
            duration: '45分钟',
            frequency: '每周3-4次',
            price: '¥199/月',
            description: '专业跑步指导，提升心肺功能和耐力',
            schedule: '周一至周五 18:00-18:45'
        }
    ],
    'cardio_hiit': [
        {
            name: '⚡ HIIT高强度训练',
            instructor: '张教练',
            duration: '30分钟',
            frequency: '每周3次',
            price: '¥249/月',
            description: '高强度间歇训练，快速燃脂，提升心肺功能',
            schedule: '周一、周三、周五 19:30-20:00'
        }
    ],
    'cardio_swimming': [
        {
            name: '🏊 游泳训练课程',
            instructor: '李教练',
            duration: '60分钟',
            frequency: '每周2次',
            price: '¥299/月',
            description: '专业游泳指导，全身有氧运动，低冲击训练',
            schedule: '周二、周六 19:00-20:00'
        }
    ]
};

// 课程套餐定义
const coursePackages = {
    // 全部选上 - 基础课程
    'all': {
        name: '🏋️ 基础健身课程',
        instructor: '张教练',
        duration: '90分钟',
        frequency: '每周3次',
        price: '¥599/月',
        description: '适合健身新手的全面基础课程，涵盖全身各部位的基础训练，帮助您建立正确的健身习惯和动作模式。课程包括基础力量训练、有氧运动和拉伸放松。',
        schedule: '周一、周三、周五 19:00-20:30',
        targetAreas: ['arms', 'legs', 'core', 'chest', 'back', 'cardio'],
        priority: 1
    },
    // 力量增强课程 - 手臂+下肢
    'strength_arms_legs': {
        name: '💪 力量增强课程',
        instructor: '李教练',
        duration: '75分钟',
        frequency: '每周3次',
        price: '¥499/月',
        description: '专注于手臂和下肢力量提升的专业课程。通过系统性的力量训练，帮助您快速提升上下肢力量，增强整体运动表现。',
        schedule: '周二、周四、周六 19:00-20:15',
        targetAreas: ['arms', 'legs'],
        priority: 2
    },
    // 全身力量课程 - 手臂+下肢+核心+胸部+背部
    'full_body_strength': {
        name: '🔥 全身力量强化课程',
        instructor: '王教练',
        duration: '80分钟',
        frequency: '每周3次',
        price: '¥549/月',
        description: '全面的力量训练课程，涵盖手臂、下肢、核心、胸部和背部的系统训练。适合有一定基础、希望全面提升力量的学员。',
        schedule: '周一、周三、周五 18:00-19:20',
        targetAreas: ['arms', 'legs', 'core', 'chest', 'back'],
        priority: 3
    },
    // 上肢力量课程 - 手臂+胸部+背部
    'upper_body_strength': {
        name: '💪 上肢力量课程',
        instructor: '张教练',
        duration: '70分钟',
        frequency: '每周3次',
        price: '¥449/月',
        description: '专注于上肢力量提升的课程，包括手臂、胸部和背部的综合训练。帮助您打造强壮的上半身，改善体态。',
        schedule: '周二、周四、周六 18:30-19:40',
        targetAreas: ['arms', 'chest', 'back'],
        priority: 4
    },
    // 下肢力量课程 - 下肢+核心
    'lower_body_strength': {
        name: '🦵 下肢力量课程',
        instructor: '李教练',
        duration: '65分钟',
        frequency: '每周3次',
        price: '¥429/月',
        description: '专注于下肢和核心力量提升的课程。通过深蹲、硬拉等复合动作，全面提升下肢力量和核心稳定性。',
        schedule: '周一、周三、周五 19:30-20:35',
        targetAreas: ['legs', 'core'],
        priority: 5
    },
    // 核心力量课程 - 核心
    'core_focus': {
        name: '🎯 核心力量专项课程',
        instructor: '王教练',
        duration: '50分钟',
        frequency: '每周4次',
        price: '¥349/月',
        description: '专注于核心肌群训练的课程，包括腹肌、侧腹和下背部的强化训练。提升核心稳定性和力量，改善体态。',
        schedule: '周一至周四 19:00-19:50',
        targetAreas: ['core'],
        priority: 6
    },
    // 有氧力量结合 - 包含心肺
    'cardio_strength': {
        name: '❤️ 有氧力量结合课程',
        instructor: '赵教练',
        duration: '60分钟',
        frequency: '每周4次',
        price: '¥399/月',
        description: '结合有氧运动和力量训练的综合性课程。在提升力量的同时，增强心肺功能，实现全面健康提升。',
        schedule: '周一至周四 18:00-19:00',
        targetAreas: ['cardio'],
        priority: 7
    },
    // 专项手臂课程
    'arms_focus': {
        name: '💪 手臂力量专项课程',
        instructor: '张教练',
        duration: '55分钟',
        frequency: '每周2次',
        price: '¥299/月',
        description: '专注于手臂力量提升的专项课程，包括二头肌、三头肌和前臂的全面训练。',
        schedule: '周二、周五 19:00-19:55',
        targetAreas: ['arms'],
        priority: 8
    },
    // 专项下肢课程
    'legs_focus': {
        name: '🦵 下肢力量专项课程',
        instructor: '李教练',
        duration: '60分钟',
        frequency: '每周2次',
        price: '¥329/月',
        description: '专注于下肢力量提升的专项课程，包括大腿、臀部和小腿的全面训练。',
        schedule: '周三、周六 19:00-20:00',
        targetAreas: ['legs'],
        priority: 9
    }
};

// 获取课程推荐
function getRecommendations() {
    if (selectedSubSections.size === 0) {
        alert('请至少选择一个具体部位！');
        return;
    }

    const recommendationsDiv = document.getElementById('recommendations');
    recommendationsDiv.innerHTML = '<h3 style="color: #333; margin-bottom: 20px;">📚 为您推荐的健身房课程</h3>';
    recommendationsDiv.innerHTML += '<p style="color: #666; margin-bottom: 20px;">根据您选择的不足，我们为您推荐以下课程：</p>';

    // 获取用户选择的大板块
    const selectedMainSections = new Set();
    selectedSubSections.forEach(subId => {
        const mainId = subId.split('_')[0];
        selectedMainSections.add(mainId);
    });

    // 匹配课程套餐
    let matchedPackages = matchCoursePackages(selectedMainSections);

    // 确保最少1个，最多3个课程
    if (matchedPackages.length === 0) {
        // 如果没有匹配的，至少推荐基础课程
        matchedPackages = [coursePackages['all']];
    } else {
        // 按优先级排序
        matchedPackages.sort((a, b) => a.priority - b.priority);
        // 最多只取前3个
        matchedPackages = matchedPackages.slice(0, 3);
    }

    if (matchedPackages.length > 0) {
        
        matchedPackages.forEach((pkg, index) => {
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            courseCard.style.cursor = 'pointer';
            courseCard.style.transition = 'all 0.3s';
            courseCard.style.marginBottom = '20px';
            
            if (index === 0) {
                courseCard.style.border = '3px solid #f5576c';
                courseCard.style.boxShadow = '0 5px 20px rgba(245, 87, 108, 0.3)';
            }
            
            courseCard.onmouseenter = () => {
                courseCard.style.transform = 'translateY(-5px)';
                courseCard.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
            };
            courseCard.onmouseleave = () => {
                courseCard.style.transform = 'translateY(0)';
                if (index === 0) {
                    courseCard.style.boxShadow = '0 5px 20px rgba(245, 87, 108, 0.3)';
                } else {
                    courseCard.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.1)';
                }
            };
            
            // 获取针对部位
            const targetAreasText = pkg.targetAreas.map(area => mainSectionNames[area]).join('、');
            
            courseCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div>
                        <h3 style="color: #f5576c; margin-bottom: 8px; font-size: 1.3em;">${pkg.name}</h3>
                        <p style="color: #999; font-size: 0.9em; margin: 0;">针对：${targetAreasText}</p>
                        ${index === 0 ? '<span style="display: inline-block; margin-top: 5px; padding: 4px 12px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border-radius: 12px; font-size: 0.85em;">⭐ 最推荐</span>' : ''}
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.5em; font-weight: bold; color: #667eea; margin-bottom: 5px;">${pkg.price}</div>
                    </div>
                </div>
                
                <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">${pkg.description}</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e9ecef;">
                    <div>
                        <strong style="color: #333;">👨‍🏫 教练：</strong>
                        <span style="color: #666;">${pkg.instructor}</span>
                    </div>
                    <div>
                        <strong style="color: #333;">⏱️ 时长：</strong>
                        <span style="color: #666;">${pkg.duration}</span>
                    </div>
                    <div>
                        <strong style="color: #333;">📅 频率：</strong>
                        <span style="color: #666;">${pkg.frequency}</span>
                    </div>
                </div>
                
                <div style="margin-top: 15px; padding: 12px; background: #f8f9fa; border-radius: 8px;">
                    <strong style="color: #333;">🕐 课程时间：</strong>
                    <span style="color: #666;">${pkg.schedule}</span>
                </div>
                
                <button style="width: 100%; margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 1em; cursor: pointer; transition: all 0.3s;" 
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)';"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';"
                        onclick="selectCourse('${pkg.name}')">
                    选择此课程
                </button>
            `;
            
            recommendationsDiv.appendChild(courseCard);
        });
    }

    recommendationsDiv.classList.add('show');
    recommendationsDiv.scrollIntoView({ behavior: 'smooth' });
}

// 匹配课程套餐
function matchCoursePackages(selectedMainSections) {
    const matchedPackages = [];
    
    // 检查是否全部选上（6个大板块）
    if (selectedMainSections.size === 6) {
        matchedPackages.push(coursePackages['all']);
        // 也可以推荐全身力量课程作为备选
        matchedPackages.push(coursePackages['full_body_strength']);
        return matchedPackages;
    }
    
    // 检查各种组合
    const hasArms = selectedMainSections.has('arms');
    const hasLegs = selectedMainSections.has('legs');
    const hasCore = selectedMainSections.has('core');
    const hasChest = selectedMainSections.has('chest');
    const hasBack = selectedMainSections.has('back');
    const hasCardio = selectedMainSections.has('cardio');
    const selectedCount = selectedMainSections.size;
    
    // 精确匹配的课程（优先级最高）
    // 全身力量课程（手臂+下肢+核心+胸部+背部，不含心肺）
    if (hasArms && hasLegs && hasCore && hasChest && hasBack && !hasCardio) {
        matchedPackages.push(coursePackages['full_body_strength']);
    }
    
    // 力量增强课程（手臂+下肢）
    if (hasArms && hasLegs && !hasCore && !hasChest && !hasBack && !hasCardio) {
        matchedPackages.push(coursePackages['strength_arms_legs']);
    }
    
    // 上肢力量课程（手臂+胸部+背部）
    if (hasArms && hasChest && hasBack && !hasLegs && !hasCore && !hasCardio) {
        matchedPackages.push(coursePackages['upper_body_strength']);
    }
    
    // 下肢力量课程（下肢+核心）
    if (hasLegs && hasCore && !hasArms && !hasChest && !hasBack && !hasCardio) {
        matchedPackages.push(coursePackages['lower_body_strength']);
    }
    
    // 有氧力量结合（包含心肺）
    if (hasCardio && selectedCount >= 2) {
        matchedPackages.push(coursePackages['cardio_strength']);
    }
    
    // 核心力量专项
    if (hasCore && !hasArms && !hasLegs && !hasChest && !hasBack && !hasCardio) {
        matchedPackages.push(coursePackages['core_focus']);
    }
    
    // 手臂专项
    if (hasArms && !hasLegs && !hasCore && !hasChest && !hasBack && !hasCardio) {
        matchedPackages.push(coursePackages['arms_focus']);
    }
    
    // 下肢专项
    if (hasLegs && !hasArms && !hasCore && !hasChest && !hasBack && !hasCardio) {
        matchedPackages.push(coursePackages['legs_focus']);
    }
    
    // 如果没有精确匹配，根据选择推荐相关课程（可以推荐多个）
    if (matchedPackages.length === 0) {
        // 如果选择了多个大板块（3个或以上），推荐全身力量课程
        if (selectedCount >= 3) {
            matchedPackages.push(coursePackages['full_body_strength']);
            // 如果包含心肺，也推荐有氧力量结合课程
            if (hasCardio) {
                matchedPackages.push(coursePackages['cardio_strength']);
            }
        }
        // 如果选择了手臂和下肢
        else if (hasArms && hasLegs) {
            matchedPackages.push(coursePackages['strength_arms_legs']);
        }
        // 如果选择了手臂和胸部或背部
        else if (hasArms && (hasChest || hasBack)) {
            matchedPackages.push(coursePackages['upper_body_strength']);
            matchedPackages.push(coursePackages['arms_focus']);
        }
        // 如果选择了下肢和核心
        else if (hasLegs && hasCore) {
            matchedPackages.push(coursePackages['lower_body_strength']);
        }
        // 如果只选择了手臂
        else if (hasArms) {
            matchedPackages.push(coursePackages['arms_focus']);
        }
        // 如果只选择了下肢
        else if (hasLegs) {
            matchedPackages.push(coursePackages['legs_focus']);
        }
        // 如果只选择了核心
        else if (hasCore) {
            matchedPackages.push(coursePackages['core_focus']);
        }
        // 如果包含心肺
        else if (hasCardio) {
            matchedPackages.push(coursePackages['cardio_strength']);
        }
    } else {
        // 如果已经有精确匹配，可以添加一些相关课程作为备选
        // 如果选择了多个部位，可以推荐更全面的课程
        if (selectedCount >= 3 && matchedPackages.length < 3) {
            // 如果还没有推荐全身力量课程，且选择了多个部位
            const hasFullBody = matchedPackages.some(pkg => pkg === coursePackages['full_body_strength']);
            if (!hasFullBody && hasArms && hasLegs) {
                matchedPackages.push(coursePackages['full_body_strength']);
            }
        }
        
        // 如果包含心肺，可以添加有氧力量结合课程
        if (hasCardio && matchedPackages.length < 3) {
            const hasCardioCourse = matchedPackages.some(pkg => pkg === coursePackages['cardio_strength']);
            if (!hasCardioCourse) {
                matchedPackages.push(coursePackages['cardio_strength']);
            }
        }
    }
    
    // 确保至少有一个课程
    if (matchedPackages.length === 0) {
        matchedPackages.push(coursePackages['all']);
    }
    
    return matchedPackages;
}

// 选择课程
function selectCourse(courseName) {
    alert(`您已选择：${courseName}\n\n请前往前台办理报名手续，或联系客服咨询详情。`);
}

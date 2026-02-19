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

// 获取课程推荐
function getRecommendations() {
    if (selectedSubSections.size === 0) {
        alert('请至少选择一个具体部位！');
        return;
    }

    const recommendationsDiv = document.getElementById('recommendations');
    recommendationsDiv.innerHTML = '<h3 style="color: #333; margin-bottom: 20px;">📚 为您推荐的健身房课程</h3>';
    recommendationsDiv.innerHTML += '<p style="color: #666; margin-bottom: 20px;">根据您选择的不足，我们为您推荐以下课程，请选择您感兴趣的课程：</p>';

    // 收集所有相关课程
    const allCourses = [];
    selectedSubSections.forEach(subId => {
        const courses = gymCourses[subId] || [];
        courses.forEach(course => {
            // 添加来源信息
            const courseWithSource = {
                ...course,
                source: subId
            };
            allCourses.push(courseWithSource);
        });
    });

    if (allCourses.length === 0) {
        recommendationsDiv.innerHTML += '<p style="color: #f5576c; text-align: center; padding: 20px;">暂无相关课程，请联系前台咨询</p>';
    } else {
        // 显示所有课程
        allCourses.forEach((course, index) => {
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            courseCard.style.cursor = 'pointer';
            courseCard.style.transition = 'all 0.3s';
            courseCard.onmouseenter = () => {
                courseCard.style.transform = 'translateY(-5px)';
                courseCard.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
            };
            courseCard.onmouseleave = () => {
                courseCard.style.transform = 'translateY(0)';
                courseCard.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.1)';
            };
            
            // 获取来源部位名称
            const [mainId, subIdOnly] = course.source.split('_');
            const subSections = mainToSubSections[mainId];
            const subSection = subSections.find(s => s.id === subIdOnly);
            const sourceName = subSection ? subSection.name : '';
            
            courseCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div>
                        <h3 style="color: #f5576c; margin-bottom: 8px; font-size: 1.3em;">${course.name}</h3>
                        <p style="color: #999; font-size: 0.9em; margin: 0;">针对：${sourceName}</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.5em; font-weight: bold; color: #667eea; margin-bottom: 5px;">${course.price}</div>
                    </div>
                </div>
                
                <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">${course.description}</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e9ecef;">
                    <div>
                        <strong style="color: #333;">👨‍🏫 教练：</strong>
                        <span style="color: #666;">${course.instructor}</span>
                    </div>
                    <div>
                        <strong style="color: #333;">⏱️ 时长：</strong>
                        <span style="color: #666;">${course.duration}</span>
                    </div>
                    <div>
                        <strong style="color: #333;">📅 频率：</strong>
                        <span style="color: #666;">${course.frequency}</span>
                    </div>
                </div>
                
                <div style="margin-top: 15px; padding: 12px; background: #f8f9fa; border-radius: 8px;">
                    <strong style="color: #333;">🕐 课程时间：</strong>
                    <span style="color: #666;">${course.schedule}</span>
                </div>
                
                <button style="width: 100%; margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 1em; cursor: pointer; transition: all 0.3s;" 
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)';"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';"
                        onclick="selectCourse('${course.name}')">
                    选择此课程
                </button>
            `;
            
            recommendationsDiv.appendChild(courseCard);
        });
    }

    recommendationsDiv.classList.add('show');
    recommendationsDiv.scrollIntoView({ behavior: 'smooth' });
}

// 选择课程
function selectCourse(courseName) {
    alert(`您已选择：${courseName}\n\n请前往前台办理报名手续，或联系客服咨询详情。`);
}

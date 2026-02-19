// 教练数据
let coaches = [
    { id: 1, name: '张教练', days: 5, hourlyRate: 150 },
    { id: 2, name: '李教练', days: 12, hourlyRate: 150 },
    { id: 3, name: '王教练', days: 8, hourlyRate: 180 }
];

// 会员数据
let members = [
    { id: 1, name: '王阿姨', preference: '举哑铃、力量训练', frequency: '每周3次', notes: '注意膝盖保护' },
    { id: 2, name: '李先生', preference: '跑步、游泳', frequency: '每周5次', notes: '减脂计划中' },
    { id: 3, name: '张小姐', preference: '瑜伽、普拉提', frequency: '每周4次', notes: '柔韧性训练' }
];

let editingCoachId = null;
let editingMemberId = null;

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    renderCoachTable();
    renderMemberTable();
    updateStats();
});

// 渲染教练表格
function renderCoachTable() {
    const tbody = document.getElementById('coachTableBody');
    tbody.innerHTML = '';
    
    coaches.forEach(coach => {
        const salary = calculateSalary(coach.days, coach.hourlyRate);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${coach.name}</td>
            <td>${coach.days}天</td>
            <td>${coach.hourlyRate}</td>
            <td>¥${salary.toLocaleString()}</td>
            <td>
                <button class="action-btn" onclick="editCoach(${coach.id})">编辑</button>
                <button class="action-btn delete" onclick="deleteCoach(${coach.id})">删除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 渲染会员表格
function renderMemberTable() {
    const tbody = document.getElementById('memberTableBody');
    tbody.innerHTML = '';
    
    members.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.name}</td>
            <td>${member.preference}</td>
            <td>${member.frequency}</td>
            <td>${member.notes || '-'}</td>
            <td>
                <button class="action-btn" onclick="editMember(${member.id})">编辑</button>
                <button class="action-btn delete" onclick="deleteMember(${member.id})">删除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 计算工资（假设每天工作8小时）
function calculateSalary(days, hourlyRate) {
    return days * 8 * hourlyRate;
}

// 更新统计数据
function updateStats() {
    // 教练统计
    document.getElementById('totalCoaches').textContent = coaches.length;
    
    const totalDays = coaches.reduce((sum, coach) => sum + coach.days, 0);
    document.getElementById('totalWorkDays').textContent = totalDays;
    
    const totalSalary = coaches.reduce((sum, coach) => 
        sum + calculateSalary(coach.days, coach.hourlyRate), 0);
    document.getElementById('totalSalary').textContent = '¥' + totalSalary.toLocaleString();
    
    // 会员统计
    document.getElementById('totalMembers').textContent = members.length;
    document.getElementById('activeMembers').textContent = members.length;
}

// 教练模态框操作
function openCoachModal(id = null) {
    const modal = document.getElementById('coachModal');
    const form = document.getElementById('coachForm');
    const title = document.getElementById('coachModalTitle');
    
    editingCoachId = id;
    
    if (id) {
        // 编辑模式
        const coach = coaches.find(c => c.id === id);
        title.textContent = '编辑教练';
        document.getElementById('coachName').value = coach.name;
        document.getElementById('coachDays').value = coach.days;
        document.getElementById('coachHourlyRate').value = coach.hourlyRate;
    } else {
        // 新增模式
        title.textContent = '添加教练';
        form.reset();
    }
    
    modal.style.display = 'block';
}

function closeCoachModal() {
    document.getElementById('coachModal').style.display = 'none';
    editingCoachId = null;
}

// 处理教练表单提交
document.getElementById('coachForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('coachName').value;
    const days = parseInt(document.getElementById('coachDays').value);
    const hourlyRate = parseInt(document.getElementById('coachHourlyRate').value);
    
    if (editingCoachId) {
        // 更新现有教练
        const coach = coaches.find(c => c.id === editingCoachId);
        coach.name = name;
        coach.days = days;
        coach.hourlyRate = hourlyRate;
    } else {
        // 添加新教练
        const newId = coaches.length > 0 ? Math.max(...coaches.map(c => c.id)) + 1 : 1;
        coaches.push({ id: newId, name, days, hourlyRate });
    }
    
    renderCoachTable();
    updateStats();
    closeCoachModal();
});

function editCoach(id) {
    openCoachModal(id);
}

function deleteCoach(id) {
    if (confirm('确定要删除这位教练吗？')) {
        coaches = coaches.filter(c => c.id !== id);
        renderCoachTable();
        updateStats();
    }
}

// 会员模态框操作
function openMemberModal(id = null) {
    const modal = document.getElementById('memberModal');
    const form = document.getElementById('memberForm');
    const title = document.getElementById('memberModalTitle');
    
    editingMemberId = id;
    
    if (id) {
        // 编辑模式
        const member = members.find(m => m.id === id);
        title.textContent = '编辑会员';
        document.getElementById('memberName').value = member.name;
        document.getElementById('memberPreference').value = member.preference;
        document.getElementById('memberFrequency').value = member.frequency;
        document.getElementById('memberNotes').value = member.notes || '';
    } else {
        // 新增模式
        title.textContent = '添加会员';
        form.reset();
    }
    
    modal.style.display = 'block';
}

function closeMemberModal() {
    document.getElementById('memberModal').style.display = 'none';
    editingMemberId = null;
}

// 处理会员表单提交
document.getElementById('memberForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('memberName').value;
    const preference = document.getElementById('memberPreference').value;
    const frequency = document.getElementById('memberFrequency').value;
    const notes = document.getElementById('memberNotes').value;
    
    if (editingMemberId) {
        // 更新现有会员
        const member = members.find(m => m.id === editingMemberId);
        member.name = name;
        member.preference = preference;
        member.frequency = frequency;
        member.notes = notes;
    } else {
        // 添加新会员
        const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
        members.push({ id: newId, name, preference, frequency, notes });
    }
    
    renderMemberTable();
    updateStats();
    closeMemberModal();
});

function editMember(id) {
    openMemberModal(id);
}

function deleteMember(id) {
    if (confirm('确定要删除这位会员吗？')) {
        members = members.filter(m => m.id !== id);
        renderMemberTable();
        updateStats();
    }
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const coachModal = document.getElementById('coachModal');
    const memberModal = document.getElementById('memberModal');
    
    if (event.target === coachModal) {
        closeCoachModal();
    }
    if (event.target === memberModal) {
        closeMemberModal();
    }
}

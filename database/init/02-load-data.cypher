// 创建示例数据：公司组织架构图
// 清除现有数据
MATCH (n) DETACH DELETE n;

// 创建部门节点
CREATE 
  (ceo:Person {id: 'ceo', name: '张总', title: 'CEO', department: '总裁办', level: 1, avatar: 'https://via.placeholder.com/40/FF6B6B/FFFFFF?text=张'}),
  (cto:Person {id: 'cto', name: '李CTO', title: 'CTO', department: '技术部', level: 2, avatar: 'https://via.placeholder.com/40/4ECDC4/FFFFFF?text=李'}),
  (cfo:Person {id: 'cfo', name: '王CFO', title: 'CFO', department: '财务部', level: 2, avatar: 'https://via.placeholder.com/40/45B7D1/FFFFFF?text=王'}),
  (hr_mgr:Person {id: 'hr_mgr', name: '赵HR', title: 'HR Manager', department: '人事部', level: 2, avatar: 'https://via.placeholder.com/40/F7DC6F/FFFFFF?text=赵'}),
  
  // 技术部门
  (fe_lead:Person {id: 'fe_lead', name: '前端组长', title: 'Frontend Lead', department: '技术部', level: 3, avatar: 'https://via.placeholder.com/40/BB8FCE/FFFFFF?text=前'}),
  (be_lead:Person {id: 'be_lead', name: '后端组长', title: 'Backend Lead', department: '技术部', level: 3, avatar: 'https://via.placeholder.com/40/85C1E9/FFFFFF?text=后'}),
  (qa_lead:Person {id: 'qa_lead', name: '测试组长', title: 'QA Lead', department: '技术部', level: 3, avatar: 'https://via.placeholder.com/40/82E0AA/FFFFFF?text=测'}),
  
  // 前端开发者
  (fe_dev1:Person {id: 'fe_dev1', name: '小明', title: 'Frontend Developer', department: '技术部', level: 4, avatar: 'https://via.placeholder.com/40/F8C471/FFFFFF?text=明'}),
  (fe_dev2:Person {id: 'fe_dev2', name: '小红', title: 'Frontend Developer', department: '技术部', level: 4, avatar: 'https://via.placeholder.com/40/EC7063/FFFFFF?text=红'}),
  
  // 后端开发者
  (be_dev1:Person {id: 'be_dev1', name: '小刚', title: 'Backend Developer', department: '技术部', level: 4, avatar: 'https://via.placeholder.com/40/5DADE2/FFFFFF?text=刚'}),
  (be_dev2:Person {id: 'be_dev2', name: '小丽', title: 'Backend Developer', department: '技术部', level: 4, avatar: 'https://via.placeholder.com/40/A569BD/FFFFFF?text=丽'}),
  (be_dev3:Person {id: 'be_dev3', name: '小强', title: 'Backend Developer', department: '技术部', level: 4, avatar: 'https://via.placeholder.com/40/58D68D/FFFFFF?text=强'}),
  
  // 测试工程师
  (qa_dev1:Person {id: 'qa_dev1', name: '小华', title: 'QA Engineer', department: '技术部', level: 4, avatar: 'https://via.placeholder.com/40/F4D03F/FFFFFF?text=华'}),
  (qa_dev2:Person {id: 'qa_dev2', name: '小芳', title: 'QA Engineer', department: '技术部', level: 4, avatar: 'https://via.placeholder.com/40/E74C3C/FFFFFF?text=芳'}),
  
  // 财务部门
  (accountant:Person {id: 'accountant', name: '会计师', title: 'Accountant', department: '财务部', level: 3, avatar: 'https://via.placeholder.com/40/3498DB/FFFFFF?text=会'}),
  (cashier:Person {id: 'cashier', name: '出纳员', title: 'Cashier', department: '财务部', level: 3, avatar: 'https://via.placeholder.com/40/9B59B6/FFFFFF?text=出'}),
  
  // 人事部门
  (recruiter:Person {id: 'recruiter', name: '招聘专员', title: 'Recruiter', department: '人事部', level: 3, avatar: 'https://via.placeholder.com/40/E67E22/FFFFFF?text=招'}),
  (trainer:Person {id: 'trainer', name: '培训专员', title: 'Trainer', department: '人事部', level: 3, avatar: 'https://via.placeholder.com/40/16A085/FFFFFF?text=培'});

// 创建部门节点
CREATE
  (tech_dept:Department {id: 'tech_dept', name: '技术部', type: 'department', description: '负责产品技术开发'}),
  (finance_dept:Department {id: 'finance_dept', name: '财务部', type: 'department', description: '负责财务管理'}),
  (hr_dept:Department {id: 'hr_dept', name: '人事部', type: 'department', description: '负责人力资源管理'}),
  (executive_dept:Department {id: 'executive_dept', name: '总裁办', type: 'department', description: '公司最高管理层'});

// 创建项目节点
CREATE
  (web_project:Project {id: 'web_project', name: '官网重构项目', status: 'active', description: '公司官网前端重构'}),
  (api_project:Project {id: 'api_project', name: 'API微服务项目', status: 'active', description: '后端API微服务架构'}),
  (mobile_project:Project {id: 'mobile_project', name: '移动端APP', status: 'planning', description: '移动端应用开发'});

// 创建技能节点
CREATE
  (vue_skill:Skill {id: 'vue_skill', name: 'Vue.js', category: 'frontend', level: 'advanced'}),
  (react_skill:Skill {id: 'react_skill', name: 'React', category: 'frontend', level: 'intermediate'}),
  (node_skill:Skill {id: 'node_skill', name: 'Node.js', category: 'backend', level: 'advanced'}),
  (python_skill:Skill {id: 'python_skill', name: 'Python', category: 'backend', level: 'advanced'}),
  (testing_skill:Skill {id: 'testing_skill', name: 'Testing', category: 'qa', level: 'expert'}),
  (finance_skill:Skill {id: 'finance_skill', name: 'Financial Analysis', category: 'finance', level: 'expert'}),
  (recruitment_skill:Skill {id: 'recruitment_skill', name: 'Recruitment', category: 'hr', level: 'advanced'});

// 创建管理关系
CREATE
  (ceo)-[:MANAGES]->(cto),
  (ceo)-[:MANAGES]->(cfo),
  (ceo)-[:MANAGES]->(hr_mgr),
  
  (cto)-[:MANAGES]->(fe_lead),
  (cto)-[:MANAGES]->(be_lead),
  (cto)-[:MANAGES]->(qa_lead),
  
  (fe_lead)-[:MANAGES]->(fe_dev1),
  (fe_lead)-[:MANAGES]->(fe_dev2),
  
  (be_lead)-[:MANAGES]->(be_dev1),
  (be_lead)-[:MANAGES]->(be_dev2),
  (be_lead)-[:MANAGES]->(be_dev3),
  
  (qa_lead)-[:MANAGES]->(qa_dev1),
  (qa_lead)-[:MANAGES]->(qa_dev2),
  
  (cfo)-[:MANAGES]->(accountant),
  (cfo)-[:MANAGES]->(cashier),
  
  (hr_mgr)-[:MANAGES]->(recruiter),
  (hr_mgr)-[:MANAGES]->(trainer);

// 创建部门关系
CREATE
  (ceo)-[:WORKS_IN]->(executive_dept),
  (cto)-[:WORKS_IN]->(tech_dept),
  (cfo)-[:WORKS_IN]->(finance_dept),
  (hr_mgr)-[:WORKS_IN]->(hr_dept),
  
  (fe_lead)-[:WORKS_IN]->(tech_dept),
  (be_lead)-[:WORKS_IN]->(tech_dept),
  (qa_lead)-[:WORKS_IN]->(tech_dept),
  (fe_dev1)-[:WORKS_IN]->(tech_dept),
  (fe_dev2)-[:WORKS_IN]->(tech_dept),
  (be_dev1)-[:WORKS_IN]->(tech_dept),
  (be_dev2)-[:WORKS_IN]->(tech_dept),
  (be_dev3)-[:WORKS_IN]->(tech_dept),
  (qa_dev1)-[:WORKS_IN]->(tech_dept),
  (qa_dev2)-[:WORKS_IN]->(tech_dept),
  
  (accountant)-[:WORKS_IN]->(finance_dept),
  (cashier)-[:WORKS_IN]->(finance_dept),
  
  (recruiter)-[:WORKS_IN]->(hr_dept),
  (trainer)-[:WORKS_IN]->(hr_dept);

// 创建项目参与关系
CREATE
  (fe_lead)-[:PARTICIPATES_IN {role: 'lead'}]->(web_project),
  (fe_dev1)-[:PARTICIPATES_IN {role: 'developer'}]->(web_project),
  (fe_dev2)-[:PARTICIPATES_IN {role: 'developer'}]->(web_project),
  
  (be_lead)-[:PARTICIPATES_IN {role: 'lead'}]->(api_project),
  (be_dev1)-[:PARTICIPATES_IN {role: 'developer'}]->(api_project),
  (be_dev2)-[:PARTICIPATES_IN {role: 'developer'}]->(api_project),
  (be_dev3)-[:PARTICIPATES_IN {role: 'developer'}]->(api_project),
  
  (qa_lead)-[:PARTICIPATES_IN {role: 'qa_lead'}]->(web_project),
  (qa_lead)-[:PARTICIPATES_IN {role: 'qa_lead'}]->(api_project),
  (qa_dev1)-[:PARTICIPATES_IN {role: 'tester'}]->(web_project),
  (qa_dev2)-[:PARTICIPATES_IN {role: 'tester'}]->(api_project),
  
  (cto)-[:OVERSEES]->(web_project),
  (cto)-[:OVERSEES]->(api_project),
  (cto)-[:OVERSEES]->(mobile_project);

// 创建技能关系
CREATE
  (fe_lead)-[:HAS_SKILL]->(vue_skill),
  (fe_lead)-[:HAS_SKILL]->(react_skill),
  (fe_dev1)-[:HAS_SKILL]->(vue_skill),
  (fe_dev2)-[:HAS_SKILL]->(react_skill),
  
  (be_lead)-[:HAS_SKILL]->(node_skill),
  (be_lead)-[:HAS_SKILL]->(python_skill),
  (be_dev1)-[:HAS_SKILL]->(node_skill),
  (be_dev2)-[:HAS_SKILL]->(python_skill),
  (be_dev3)-[:HAS_SKILL]->(node_skill),
  
  (qa_lead)-[:HAS_SKILL]->(testing_skill),
  (qa_dev1)-[:HAS_SKILL]->(testing_skill),
  (qa_dev2)-[:HAS_SKILL]->(testing_skill),
  
  (cfo)-[:HAS_SKILL]->(finance_skill),
  (accountant)-[:HAS_SKILL]->(finance_skill),
  
  (hr_mgr)-[:HAS_SKILL]->(recruitment_skill),
  (recruiter)-[:HAS_SKILL]->(recruitment_skill);

// 创建协作关系
CREATE
  (fe_lead)-[:COLLABORATES_WITH]->(be_lead),
  (fe_lead)-[:COLLABORATES_WITH]->(qa_lead),
  (be_lead)-[:COLLABORATES_WITH]->(qa_lead),
  (cfo)-[:COLLABORATES_WITH]->(hr_mgr),
  (cto)-[:COLLABORATES_WITH]->(cfo),
  (cto)-[:COLLABORATES_WITH]->(hr_mgr);
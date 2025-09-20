const neo4j = require('neo4j-driver');

// Neo4j 连接配置
const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password123';

async function importSimpleData() {
  console.log('🚀 开始导入简化的示例数据到 Neo4j...');

  const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));

  try {
    const session = driver.session();

    // 清除现有数据
    console.log('🗑️ 清除现有数据...');
    await session.run('MATCH (n) DETACH DELETE n');

    // 创建人员节点
    console.log('👥 创建人员节点...');
    await session.run(`
      CREATE
        (ceo:Person {id: 'ceo', name: '张总', title: 'CEO', department: '总裁办', level: 1}),
        (cto:Person {id: 'cto', name: '李CTO', title: 'CTO', department: '技术部', level: 2}),
        (cfo:Person {id: 'cfo', name: '王CFO', title: 'CFO', department: '财务部', level: 2}),
        (hr_mgr:Person {id: 'hr_mgr', name: '赵HR', title: 'HR Manager', department: '人事部', level: 2}),
        (fe_lead:Person {id: 'fe_lead', name: '前端组长', title: 'Frontend Lead', department: '技术部', level: 3}),
        (be_lead:Person {id: 'be_lead', name: '后端组长', title: 'Backend Lead', department: '技术部', level: 3}),
        (qa_lead:Person {id: 'qa_lead', name: '测试组长', title: 'QA Lead', department: '技术部', level: 3}),
        (fe_dev1:Person {id: 'fe_dev1', name: '小明', title: 'Frontend Developer', department: '技术部', level: 4}),
        (fe_dev2:Person {id: 'fe_dev2', name: '小红', title: 'Frontend Developer', department: '技术部', level: 4}),
        (be_dev1:Person {id: 'be_dev1', name: '小刚', title: 'Backend Developer', department: '技术部', level: 4}),
        (be_dev2:Person {id: 'be_dev2', name: '小丽', title: 'Backend Developer', department: '技术部', level: 4}),
        (qa_dev1:Person {id: 'qa_dev1', name: '小华', title: 'QA Engineer', department: '技术部', level: 4}),
        (accountant:Person {id: 'accountant', name: '会计师', title: 'Accountant', department: '财务部', level: 3}),
        (recruiter:Person {id: 'recruiter', name: '招聘专员', title: 'Recruiter', department: '人事部', level: 3})
    `);

    // 创建部门节点
    console.log('🏢 创建部门节点...');
    await session.run(`
      CREATE
        (tech_dept:Department {id: 'tech_dept', name: '技术部', description: '负责产品技术开发'}),
        (finance_dept:Department {id: 'finance_dept', name: '财务部', description: '负责财务管理'}),
        (hr_dept:Department {id: 'hr_dept', name: '人事部', description: '负责人力资源管理'}),
        (executive_dept:Department {id: 'executive_dept', name: '总裁办', description: '公司最高管理层'})
    `);

    // 创建项目节点
    console.log('📋 创建项目节点...');
    await session.run(`
      CREATE
        (web_project:Project {id: 'web_project', name: '官网重构项目', status: 'active', description: '公司官网前端重构'}),
        (api_project:Project {id: 'api_project', name: 'API微服务项目', status: 'active', description: '后端API微服务架构'}),
        (mobile_project:Project {id: 'mobile_project', name: '移动端APP', status: 'planning', description: '移动端应用开发'})
    `);

    // 创建技能节点
    console.log('⚡ 创建技能节点...');
    await session.run(`
      CREATE
        (vue_skill:Skill {id: 'vue_skill', name: 'Vue.js', category: 'frontend', level: 'advanced'}),
        (react_skill:Skill {id: 'react_skill', name: 'React', category: 'frontend', level: 'intermediate'}),
        (node_skill:Skill {id: 'node_skill', name: 'Node.js', category: 'backend', level: 'advanced'}),
        (testing_skill:Skill {id: 'testing_skill', name: 'Testing', category: 'qa', level: 'expert'}),
        (finance_skill:Skill {id: 'finance_skill', name: 'Financial Analysis', category: 'finance', level: 'expert'})
    `);

    // 创建管理关系
    console.log('🔗 创建管理关系...');
    await session.run(`
      MATCH (ceo:Person {id: 'ceo'}), (cto:Person {id: 'cto'}), (cfo:Person {id: 'cfo'}), (hr_mgr:Person {id: 'hr_mgr'})
      CREATE (ceo)-[:MANAGES]->(cto), (ceo)-[:MANAGES]->(cfo), (ceo)-[:MANAGES]->(hr_mgr)
    `);

    await session.run(`
      MATCH (cto:Person {id: 'cto'}), (fe_lead:Person {id: 'fe_lead'}), (be_lead:Person {id: 'be_lead'}), (qa_lead:Person {id: 'qa_lead'})
      CREATE (cto)-[:MANAGES]->(fe_lead), (cto)-[:MANAGES]->(be_lead), (cto)-[:MANAGES]->(qa_lead)
    `);

    await session.run(`
      MATCH (fe_lead:Person {id: 'fe_lead'}), (fe_dev1:Person {id: 'fe_dev1'}), (fe_dev2:Person {id: 'fe_dev2'})
      CREATE (fe_lead)-[:MANAGES]->(fe_dev1), (fe_lead)-[:MANAGES]->(fe_dev2)
    `);

    await session.run(`
      MATCH (be_lead:Person {id: 'be_lead'}), (be_dev1:Person {id: 'be_dev1'}), (be_dev2:Person {id: 'be_dev2'})
      CREATE (be_lead)-[:MANAGES]->(be_dev1), (be_lead)-[:MANAGES]->(be_dev2)
    `);

    // 创建部门关系
    console.log('🏢 创建部门关系...');
    await session.run(`
      MATCH (ceo:Person {id: 'ceo'}), (executive_dept:Department {id: 'executive_dept'})
      CREATE (ceo)-[:WORKS_IN]->(executive_dept)
    `);

    await session.run(`
      MATCH (tech_dept:Department {id: 'tech_dept'})
      MATCH (cto:Person {id: 'cto'}), (fe_lead:Person {id: 'fe_lead'}), (be_lead:Person {id: 'be_lead'}),
            (qa_lead:Person {id: 'qa_lead'}), (fe_dev1:Person {id: 'fe_dev1'}), (fe_dev2:Person {id: 'fe_dev2'}),
            (be_dev1:Person {id: 'be_dev1'}), (be_dev2:Person {id: 'be_dev2'}), (qa_dev1:Person {id: 'qa_dev1'})
      CREATE (cto)-[:WORKS_IN]->(tech_dept), (fe_lead)-[:WORKS_IN]->(tech_dept), (be_lead)-[:WORKS_IN]->(tech_dept),
             (qa_lead)-[:WORKS_IN]->(tech_dept), (fe_dev1)-[:WORKS_IN]->(tech_dept), (fe_dev2)-[:WORKS_IN]->(tech_dept),
             (be_dev1)-[:WORKS_IN]->(tech_dept), (be_dev2)-[:WORKS_IN]->(tech_dept), (qa_dev1)-[:WORKS_IN]->(tech_dept)
    `);

    await session.run(`
      MATCH (cfo:Person {id: 'cfo'}), (accountant:Person {id: 'accountant'}), (finance_dept:Department {id: 'finance_dept'})
      CREATE (cfo)-[:WORKS_IN]->(finance_dept), (accountant)-[:WORKS_IN]->(finance_dept)
    `);

    await session.run(`
      MATCH (hr_mgr:Person {id: 'hr_mgr'}), (recruiter:Person {id: 'recruiter'}), (hr_dept:Department {id: 'hr_dept'})
      CREATE (hr_mgr)-[:WORKS_IN]->(hr_dept), (recruiter)-[:WORKS_IN]->(hr_dept)
    `);

    // 创建项目参与关系
    console.log('📋 创建项目参与关系...');
    await session.run(`
      MATCH (fe_lead:Person {id: 'fe_lead'}), (fe_dev1:Person {id: 'fe_dev1'}), (web_project:Project {id: 'web_project'})
      CREATE (fe_lead)-[:PARTICIPATES_IN {role: 'lead'}]->(web_project),
             (fe_dev1)-[:PARTICIPATES_IN {role: 'developer'}]->(web_project)
    `);

    await session.run(`
      MATCH (be_lead:Person {id: 'be_lead'}), (be_dev1:Person {id: 'be_dev1'}), (api_project:Project {id: 'api_project'})
      CREATE (be_lead)-[:PARTICIPATES_IN {role: 'lead'}]->(api_project),
             (be_dev1)-[:PARTICIPATES_IN {role: 'developer'}]->(api_project)
    `);

    // 创建技能关系
    console.log('⚡ 创建技能关系...');
    await session.run(`
      MATCH (fe_lead:Person {id: 'fe_lead'}), (vue_skill:Skill {id: 'vue_skill'}), (react_skill:Skill {id: 'react_skill'})
      CREATE (fe_lead)-[:HAS_SKILL]->(vue_skill), (fe_lead)-[:HAS_SKILL]->(react_skill)
    `);

    await session.run(`
      MATCH (be_lead:Person {id: 'be_lead'}), (node_skill:Skill {id: 'node_skill'})
      CREATE (be_lead)-[:HAS_SKILL]->(node_skill)
    `);

    await session.run(`
      MATCH (qa_lead:Person {id: 'qa_lead'}), (testing_skill:Skill {id: 'testing_skill'})
      CREATE (qa_lead)-[:HAS_SKILL]->(testing_skill)
    `);

    // 创建协作关系
    console.log('🤝 创建协作关系...');
    await session.run(`
      MATCH (fe_lead:Person {id: 'fe_lead'}), (be_lead:Person {id: 'be_lead'}), (qa_lead:Person {id: 'qa_lead'})
      CREATE (fe_lead)-[:COLLABORATES_WITH]->(be_lead),
             (fe_lead)-[:COLLABORATES_WITH]->(qa_lead),
             (be_lead)-[:COLLABORATES_WITH]->(qa_lead)
    `);

    // 验证数据导入
    console.log('🔍 验证数据导入结果...');
    const nodeCountResult = await session.run('MATCH (n) RETURN count(n) as count');
    const nodeCount = nodeCountResult.records[0].get('count').low;

    const edgeCountResult = await session.run('MATCH ()-[r]->() RETURN count(r) as count');
    const edgeCount = edgeCountResult.records[0].get('count').low;

    const nodeTypesResult = await session.run('MATCH (n) RETURN distinct labels(n) as labels, count(n) as count');
    const nodeTypes = nodeTypesResult.records.map(record => ({
      type: record.get('labels')[0],
      count: record.get('count').low
    }));

    await session.close();

    console.log('📈 数据导入完成统计:');
    console.log(`  • 总节点数: ${nodeCount}`);
    console.log(`  • 总关系数: ${edgeCount}`);
    console.log('  • 节点类型分布:');
    nodeTypes.forEach(type => {
      console.log(`    - ${type.type}: ${type.count} 个`);
    });

    console.log('🎉 示例数据导入完成！');

  } catch (error) {
    console.error('❌ 数据导入失败:', error.message);
    throw error;
  } finally {
    await driver.close();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  importSimpleData().catch(console.error);
}

module.exports = { importSimpleData };
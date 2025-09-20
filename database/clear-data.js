const neo4j = require('neo4j-driver');

// Neo4j 连接配置
const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password123';

async function clearData() {
  console.log('🧹 开始清理 Neo4j 数据库...');

  const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));

  try {
    const session = driver.session();

    // 删除所有节点和关系
    console.log('🗑️  删除所有节点和关系...');
    await session.run('MATCH (n) DETACH DELETE n');

    // 验证清理结果
    const result = await session.run('MATCH (n) RETURN count(n) as count');
    const remainingCount = result.records[0].get('count').low;

    await session.close();

    if (remainingCount === 0) {
      console.log('✅ 数据库清理完成，所有数据已删除');
    } else {
      console.log(`⚠️  警告: 仍有 ${remainingCount} 个节点未删除`);
    }

  } catch (error) {
    console.error('❌ 数据库清理失败:', error.message);
    process.exit(1);
  } finally {
    await driver.close();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  clearData().catch(console.error);
}

module.exports = { clearData };
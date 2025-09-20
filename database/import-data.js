const neo4j = require('neo4j-driver');
const fs = require('fs');
const path = require('path');

// Neo4j 连接配置
const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password123';

async function importData() {
  console.log('🚀 开始导入示例数据到 Neo4j...');

  const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));

  try {
    // 测试连接
    const session = driver.session();
    await session.run('RETURN 1');
    console.log('✅ Neo4j 数据库连接成功');
    await session.close();

    // 读取并执行约束创建脚本
    console.log('📋 创建约束和索引...');
    const constraintsScript = fs.readFileSync(
      path.join(__dirname, 'init/01-create-constraints.cypher'),
      'utf8'
    );

    const constraintStatements = constraintsScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    const constraintSession = driver.session();
    for (const statement of constraintStatements) {
      try {
        await constraintSession.run(statement);
        console.log(`  ✓ 执行成功: ${statement.substring(0, 50)}...`);
      } catch (error) {
        console.log(`  ⚠️  跳过 (可能已存在): ${statement.substring(0, 50)}...`);
      }
    }
    await constraintSession.close();

    // 读取并执行数据导入脚本
    console.log('📊 导入示例数据...');
    const dataScript = fs.readFileSync(
      path.join(__dirname, 'init/02-load-data.cypher'),
      'utf8'
    );

    const dataStatements = dataScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    const dataSession = driver.session();
    for (const statement of dataStatements) {
      if (statement.trim()) {
        await dataSession.run(statement);
        console.log(`  ✓ 数据导入: ${statement.substring(0, 50)}...`);
      }
    }
    await dataSession.close();

    // 验证数据导入
    console.log('🔍 验证数据导入结果...');
    const verifySession = driver.session();

    const nodeCountResult = await verifySession.run('MATCH (n) RETURN count(n) as count');
    const nodeCount = nodeCountResult.records[0].get('count').low;

    const edgeCountResult = await verifySession.run('MATCH ()-[r]->() RETURN count(r) as count');
    const edgeCount = edgeCountResult.records[0].get('count').low;

    const nodeTypesResult = await verifySession.run('MATCH (n) RETURN distinct labels(n) as labels, count(n) as count');
    const nodeTypes = nodeTypesResult.records.map(record => ({
      type: record.get('labels')[0],
      count: record.get('count').low
    }));

    await verifySession.close();

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
    process.exit(1);
  } finally {
    await driver.close();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  importData().catch(console.error);
}

module.exports = { importData };
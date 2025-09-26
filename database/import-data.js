const neo4j = require('neo4j-driver');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser'); // We'll add this dependency later

async function importData() {
  console.log('🚀 开始导入数据中心网络拓扑数据到 Neo4j...');

  const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));

  try {
    // Test connection
    const session = driver.session();
    await session.run('RETURN 1');
    console.log('✅ Neo4j 数据库连接成功');
    await session.close();

    // Read and execute constraint script
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

    // Clear existing data
    console.log('🗑️ 清除现有数据...');
    const clearSession = driver.session();
    await clearSession.run('MATCH (n) DETACH DELETE n');
    await clearSession.close();

    // Import node info
    console.log('📊 导入设备节点信息...');
    await importNodeInfo(driver);

    // Import node-port relationships
    console.log('🔗 导入设备-端口连接关系...');
    await importNodePortRelationships(driver);

    // Import port-port relationships
    console.log('🔌 导入端口-端口连接关系...');
    await importPortPortRelationships(driver);

    // Verify data import
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

    console.log('🎉 数据中心网络拓扑数据导入完成！');

  } catch (error) {
    console.error('❌ 数据导入失败:', error.message);
    process.exit(1);
  } finally {
    await driver.close();
  }
}

// Import node information from CSV
async function importNodeInfo(driver) {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(__dirname, 'example_data', 'node-info.csv');
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const session = driver.session();
          
          // Create device nodes
          for (const row of results) {
            const query = `
              CREATE (d:Device {
                device_name: $device_name,
                subarea: $subarea,
                dc: $dc,
                manage_ip: $manage_ip
              })
            `;
            
            await session.run(query, {
              device_name: row.DeviceName,
              subarea: row.SubArea,
              dc: row.DC,
              manage_ip: row.ManageIP
            });
            
            console.log(`  ✓ 设备创建: ${row.DeviceName} in ${row.DC}`);
          }
          
          await session.close();
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

// Import node-port relationships from CSV
async function importNodePortRelationships(driver) {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(__dirname, 'example_data', 'node-port.csv');
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const session = driver.session();
          
          // Create port nodes and device-port relationships
          for (const row of results) {
            const portName = row.dst;
            const deviceName = row.src;
            
            // Create port node
            const createPortQuery = `
              MERGE (p:Port {port_name: $port_name})
            `;
            
            await session.run(createPortQuery, {
              port_name: portName
            });
            
            // Create relationship between device and port
            const createRelQuery = `
              MATCH (d:Device {device_name: $device_name})
              MATCH (p:Port {port_name: $port_name})
              CREATE (d)-[:HAS_PORT]->(p)
            `;
            
            await session.run(createRelQuery, {
              device_name: deviceName,
              port_name: portName
            });
            
            console.log(`  ✓ 端口连接: ${deviceName} -> ${portName}`);
          }
          
          await session.close();
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

// Import port-port relationships from CSV
async function importPortPortRelationships(driver) {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(__dirname, 'example_data', 'port-port.csv');
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const session = driver.session();
          
          // Create port-port relationships
          for (const row of results) {
            const srcPort = row.src;
            const dstPort = row.dst;
            
            // Create relationship between ports
            const createRelQuery = `
              MATCH (p1:Port {port_name: $src_port})
              MATCH (p2:Port {port_name: $dst_port})
              CREATE (p1)-[:CONNECTS_TO]->(p2)
            `;
            
            await session.run(createRelQuery, {
              src_port: srcPort,
              dst_port: dstPort
            });
            
            console.log(`  ✓ 端口连接: ${srcPort} -> ${dstPort}`);
          }
          
          await session.close();
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

// Neo4j 连接配置
const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password123';

// If the script is run directly
if (require.main === module) {
  importData().catch(console.error);
}

module.exports = { importData };
const neo4j = require('neo4j-driver');
require('dotenv').config();

class Neo4jConnection {
  constructor() {
    this.driver = null;
  }

  async connect() {
    try {
      const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
      const user = process.env.NEO4J_USER || 'neo4j';
      const password = process.env.NEO4J_PASSWORD || 'password123';

      this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

      // 测试连接
      const session = this.driver.session();
      await session.run('RETURN 1');
      await session.close();

      console.log('✅ 已成功连接到 Neo4j 数据库');
      return this.driver;
    } catch (error) {
      console.error('❌ Neo4j 数据库连接失败:', error.message);
      throw error;
    }
  }

  getDriver() {
    if (!this.driver) {
      throw new Error('数据库连接未初始化，请先调用 connect() 方法');
    }
    return this.driver;
  }

  async close() {
    if (this.driver) {
      await this.driver.close();
      console.log('🔒 Neo4j 数据库连接已关闭');
    }
  }

  // 执行查询的辅助方法
  async executeQuery(query, parameters = {}) {
    const session = this.driver.session();
    try {
      const result = await session.run(query, parameters);
      return result;
    } catch (error) {
      console.error('查询执行失败:', error.message);
      throw error;
    } finally {
      await session.close();
    }
  }

  // 执行读取查询
  async executeReadQuery(query, parameters = {}) {
    const session = this.driver.session({ defaultAccessMode: neo4j.session.READ });
    try {
      const result = await session.run(query, parameters);
      return result;
    } catch (error) {
      console.error('读取查询执行失败:', error.message);
      throw error;
    } finally {
      await session.close();
    }
  }

  // 执行写入查询
  async executeWriteQuery(query, parameters = {}) {
    const session = this.driver.session({ defaultAccessMode: neo4j.session.WRITE });
    try {
      const result = await session.run(query, parameters);
      return result;
    } catch (error) {
      console.error('写入查询执行失败:', error.message);
      throw error;
    } finally {
      await session.close();
    }
  }
}

// 创建单例实例
const neo4jConnection = new Neo4jConnection();

module.exports = neo4jConnection;
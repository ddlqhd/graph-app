// 创建唯一性约束和索引
CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT department_id_unique IF NOT EXISTS FOR (d:Department) REQUIRE d.id IS UNIQUE;
CREATE CONSTRAINT project_id_unique IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT skill_id_unique IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE;

// 创建索引以优化查询性能
CREATE INDEX person_name_index IF NOT EXISTS FOR (p:Person) ON (p.name);
CREATE INDEX person_department_index IF NOT EXISTS FOR (p:Person) ON (p.department);
CREATE INDEX person_level_index IF NOT EXISTS FOR (p:Person) ON (p.level);
CREATE INDEX department_name_index IF NOT EXISTS FOR (d:Department) ON (d.name);
CREATE INDEX project_status_index IF NOT EXISTS FOR (p:Project) ON (p.status);
CREATE INDEX skill_category_index IF NOT EXISTS FOR (s:Skill) ON (s.category);
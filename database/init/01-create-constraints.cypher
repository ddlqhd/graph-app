// 创建唯一性约束和索引
CREATE CONSTRAINT device_id_unique IF NOT EXISTS FOR (d:Device) REQUIRE d.device_name IS UNIQUE;
CREATE CONSTRAINT port_id_unique IF NOT EXISTS FOR (p:Port) REQUIRE p.port_name IS UNIQUE;

// 创建索引以优化查询性能
CREATE INDEX device_name_index IF NOT EXISTS FOR (d:Device) ON (d.device_name);
CREATE INDEX device_subarea_index IF NOT EXISTS FOR (d:Device) ON (d.subarea);
CREATE INDEX device_dc_index IF NOT EXISTS FOR (d:Device) ON (d.dc);
CREATE INDEX device_manageip_index IF NOT EXISTS FOR (d:Device) ON (d.manage_ip);
CREATE INDEX port_name_index IF NOT EXISTS FOR (p:Port) ON (p.port_name);
package canal;

import com.alibaba.fastjson.JSONObject;
import com.alibaba.otter.canal.client.CanalConnector;
import com.alibaba.otter.canal.client.CanalConnectors;
import com.alibaba.otter.canal.protocol.CanalEntry.*;
import com.alibaba.otter.canal.protocol.Message;

import java.net.InetSocketAddress;
import java.util.List;

public class CanalClient {
	public static void main(String args[]) {
        CanalConnector connector = CanalConnectors.newSingleConnector(new InetSocketAddress("127.0.0.1",
                11111), "example1", "", "");
        int batchSize = 100;
        try {
            connector.connect();
            connector.subscribe(".*\\..*");
            connector.rollback();
            System.out.println("================>course start");
            while (true) {
                // 获取指定数量的数据
                Message message = connector.getWithoutAck(batchSize);
                long batchId = message.getId();
                int size = message.getEntries().size();
                if (batchId == -1 || size == 0) {
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                } else {
                    printEntry(message.getEntries());
                }
                // 提交确认
                connector.ack(batchId);
            }
        } finally {
            connector.disconnect();
        }
    }

    private static void printEntry(List<Entry> entrys) {
        for (Entry entry : entrys) {
            if (entry.getEntryType() == EntryType.TRANSACTIONBEGIN || entry.getEntryType() == EntryType.TRANSACTIONEND) {
                continue;
            }
            RowChange rowChage = null;
            try {
                rowChage = RowChange.parseFrom(entry.getStoreValue());
            } catch (Exception e) {
                throw new RuntimeException("ERROR ## parser of eromanga-event has an error , data:" + entry.toString(),
                        e);
            }
            EventType eventType = rowChage.getEventType();
            System.out.println(String.format("================> binlog[%s:%s] , name[%s,%s] , eventType : %s",
                    entry.getHeader().getLogfileName(), entry.getHeader().getLogfileOffset(),
                    entry.getHeader().getSchemaName(), entry.getHeader().getTableName(),
                    eventType));

            for (RowData rowData : rowChage.getRowDatasList()) {
                if (eventType == EventType.DELETE) {
                    redisDelete(entry.getHeader().getTableName(),rowData.getBeforeColumnsList());
                } else if (eventType == EventType.INSERT) {
                    redisInsert(entry.getHeader().getTableName(),rowData.getAfterColumnsList());
                } else {
                    System.out.println("-------> before");
                    redisUpdatePre(entry.getHeader().getTableName(),rowData.getBeforeColumnsList());
                    printColumn(rowData.getBeforeColumnsList());
                    System.out.println("-------> after");
                    redisUpdate(entry.getHeader().getTableName(),rowData.getAfterColumnsList());
                }
            }
        }
    }

    private static void printColumn(List<Column> columns) {
        for (Column column : columns) {
            System.out.println(column.getName() + " : " + column.getValue() + "    update=" + column.getUpdated());
        }
    }

    private static void redisInsert(String table,List<Column> columns) {
        JSONObject json = new JSONObject();
        String key = null;
        // course
        String ccollege = null;
        // class
        String ccourse = null;
        String cteacher = null;
        String cschoolYear = null;
        String cschoolTerm = null;
        // classSelect
        String csstudent = null;
        String csclass = null;
        String csteacher = null;
        // courseSchedule
        String csmajor = null;
        String cscourse = null;
        String cstype = null;
        
        for (Column column : columns) {
            json.put(column.getName(), column.getValue());
            if (column.getIsKey()) {
            	key = column.getValue();
            }
            if(table.equals("course")) {
            	if(column.getName().equals("collegeid")) {
            		ccollege = column.getValue();
            	}
            }
            else if(table.equals("class")) {
            	if(column.getName().equals("courseid")) {
            		ccourse = column.getValue();
            	}
            	else if(column.getName().equals("teacherid")) {
            		cteacher = column.getValue();
            	}
            	else if(column.getName().equals("schoolYear")) {
            		cschoolYear = column.getValue();
            	}
            	else if(column.getName().equals("schoolTerm")) {
            		cschoolTerm = column.getValue();
            	}
            }
            else if(table.equals("classSelect")) {
            	if(column.getName().equals("studentid")) {
            		csstudent = column.getValue();
            	}
            	else if(column.getName().equals("classid")) {
            		csclass = column.getValue();
            	}
            	else if(column.getName().equals("csteacher")) {
            		csteacher = column.getValue();
            	}
            }
            else if(table.equals("courseSchedule")) {
            	if(column.getName().equals("majorid")) {
            		csmajor = column.getValue();
            	}
            	else if(column.getName().equals("courseid")) {
            		cscourse = column.getValue();
            	}
            	else if(column.getName().equals("type")) {
            		cstype = column.getValue();
            	}
            }
        }
        if (columns.size() > 0) {
//        	RedisUtil.stringSet(table + ":" + columns.get(0).getValue(), json.toJSONString());
//        	RedisUtil.sadd("idx:" + table, key);
            if(!table.equals("courseSchedule")) {
            	RedisUtil.stringSet(table + ":" + columns.get(0).getValue(), json.toJSONString());
            	RedisUtil.sadd("idx:" + table, key);
            }
            else {
            	RedisUtil.stringSet(table + ":" + csmajor + ':' + cscourse, json.toJSONString());
            }
            
            if(table.equals("course")) {
            	RedisUtil.sadd("idx:course:college:" + ccollege, key);
            }
            else if(table.equals("class")) {
            	RedisUtil.sadd("idx:class:course:" + ccourse, key);
            	RedisUtil.sadd("idx:class:teacher:" + cteacher, key);
            	RedisUtil.sadd("idx:class:schoolYear:" + cschoolYear + ":schoolTerm:" + cschoolTerm, key);
            	RedisUtil.sadd("idx:class:course:schoolYear:" + cschoolYear + ":schoolTerm:" + cschoolTerm, ccourse);
            }
            else if(table.equals("classSelect")) {
            	RedisUtil.sadd("idx:classSelect:student:" + csstudent, key);
            	RedisUtil.sadd("idx:classSelect:class:" + csclass, key);
            	RedisUtil.sadd("idx:classSelect:teacher:" + csteacher, key);
            }
            else if(table.equals("courseSchedule")) {
            	//RedisUtil.sadd("idx:courseSchedule:major:" + csmajor, key);
            	RedisUtil.sadd("idx:courseSchedule:course:major:" + csmajor, cscourse);
            	RedisUtil.sadd("idx:courseSchedule:course:major:" + csmajor + ":type:" + cstype, cscourse);
            }
        }
    }
    
    private static void redisUpdatePre(String table,List<Column> columns) {
    	String key = null;
    	// course
        String ccollege = null;
    	// class
        String ccourse = null;
        String cteacher = null;
        String cschoolYear = null;
        String cschoolTerm = null;
        // classSelect
        String csstudent = null;
        String csclass = null;
        String csteacher = null;
        // courseSchedule
        String csmajor = null;
        String cscourse = null;
        String cstype = null;
    	
    	for (Column column : columns) {
    		if (column.getIsKey()) {
            	key = column.getValue();
            }
    		if(table.equals("course")) {
            	if(column.getName().equals("collegeid")) {
            		ccollege = column.getValue();
            	}
            }
    		else if(table.equals("class")) {
            	if(column.getName().equals("courseid")) {
            		ccourse = column.getValue();
            	}
            	else if(column.getName().equals("teacherid")) {
            		cteacher = column.getValue();
            	}
            	else if(column.getName().equals("schoolYear")) {
            		cschoolYear = column.getValue();
            	}
            	else if(column.getName().equals("schoolTerm")) {
            		cschoolTerm = column.getValue();
            	}
            }
            else if(table.equals("classSelect")) {
            	if(column.getName().equals("studentid")) {
            		csstudent = column.getValue();
            	}
            	else if(column.getName().equals("classid")) {
            		csclass = column.getValue();
            	}
            	else if(column.getName().equals("csteacher")) {
            		csteacher = column.getValue();
            	}
            }
            else if(table.equals("courseSchedule")) {
            	if(column.getName().equals("majorid")) {
            		csmajor = column.getValue();
            	}
            	else if(column.getName().equals("courseid")) {
            		cscourse = column.getValue();
            	}
            	else if(column.getName().equals("type")) {
            		cstype = column.getValue();
            	}
            }
    	}
    	if (columns.size() > 0) {
    		if(table.equals("course")) {
            	RedisUtil.srem("idx:course:college:" + ccollege, key);
            }
    		else if(table.equals("class")) {
            	RedisUtil.srem("idx:class:course:" + ccourse, key);
            	RedisUtil.srem("idx:class:teacher:" + cteacher, key);
            	RedisUtil.srem("idx:class:schoolYear:" + cschoolYear + ":schoolTerm:" + cschoolTerm, key);
            	//RedisUtil.srem("idx:class:course:schoolYear:" + cschoolYear + ":schoolTerm:" + cschoolTerm, ccourse);
            	if(RedisUtil.sinter("idx:class:course:" + ccourse, "idx:class:schoolYear:" + cschoolYear + ":schoolTerm:" + cschoolTerm) == 0) {
            		RedisUtil.srem("idx:class:course:schoolYear:" + cschoolYear + ":schoolTerm:" + cschoolTerm, ccourse);
            	}
            }
            else if(table.equals("classSelect")) {
            	RedisUtil.srem("idx:classSelect:student:" + csstudent, key);
            	RedisUtil.srem("idx:classSelect:class:" + csclass, key);
            	RedisUtil.srem("idx:classSelect:teacher:" + csteacher, key);
            }
            else if(table.equals("courseSchedule")) {
            	//RedisUtil.srem("idx:courseSchedule:major:" + csmajor, key);
            	RedisUtil.srem("idx:courseSchedule:course:major:" + csmajor, cscourse);
            	RedisUtil.srem("idx:courseSchedule:course:major:" + csmajor + ":type:" + cstype, cscourse);
            }
        }
    }

    private static void redisUpdate(String table,List<Column> columns) {
        JSONObject json = new JSONObject();
        String key = null;
        // course
        String ccollege = null;
        // class
        String ccourse = null;
        String cteacher = null;
        String cschoolYear = null;
        String cschoolTerm = null;
        // classSelect
        String csstudent = null;
        String csclass = null;
        String csteacher = null;
        // courseSchedule
        String csmajor = null;
        String cscourse = null;
        String cstype = null;
        
        for (Column column : columns) {
            json.put(column.getName(), column.getValue());
            if (column.getIsKey()) {
            	key = column.getValue();
            }
            if(table.equals("course")) {
            	if(column.getName().equals("collegeid")) {
            		ccollege = column.getValue();
            	}
            }
            else if(table.equals("class")) {
            	if(column.getName().equals("courseid")) {
            		ccourse = column.getValue();
            	}
            	else if(column.getName().equals("teacherid")) {
            		cteacher = column.getValue();
            	}
            	else if(column.getName().equals("schoolYear")) {
            		cschoolYear = column.getValue();
            	}
            	else if(column.getName().equals("schoolTerm")) {
            		cschoolTerm = column.getValue();
            	}
            }
            else if(table.equals("classSelect")) {
            	if(column.getName().equals("studentid")) {
            		csstudent = column.getValue();
            	}
            	else if(column.getName().equals("classid")) {
            		csclass = column.getValue();
            	}
            	else if(column.getName().equals("csteacher")) {
            		csteacher = column.getValue();
            	}
            }
            else if(table.equals("courseSchedule")) {
            	if(column.getName().equals("majorid")) {
            		csmajor = column.getValue();
            	}
            	else if(column.getName().equals("courseid")) {
            		cscourse = column.getValue();
            	}
            	else if(column.getName().equals("type")) {
            		cstype = column.getValue();
            	}
            }
        }
        if (columns.size() > 0) {
            //RedisUtil.stringSet(table + ":" + columns.get(0).getValue(), json.toJSONString());
            if(!table.equals("courseSchedule")) {
            	RedisUtil.stringSet(table + ":" + columns.get(0).getValue(), json.toJSONString());
            }
            else {
            	RedisUtil.stringSet(table + ":" + csmajor + ':' + cscourse, json.toJSONString());
            }
            
            if(table.equals("course")) {
            	RedisUtil.sadd("idx:course:college:" + ccollege, key);
            }
            else if(table.equals("class")) {
            	RedisUtil.sadd("idx:class:course:" + ccourse, key);
            	RedisUtil.sadd("idx:class:teacher:" + cteacher, key);
            	RedisUtil.sadd("idx:class:schoolYear:" + cschoolYear + ":schoolTerm:" + cschoolTerm, key);
            	RedisUtil.sadd("idx:class:course:schoolYear:" + cschoolYear + ":schoolTerm:" + cschoolTerm, ccourse);
            }
            else if(table.equals("classSelect")) {
            	RedisUtil.sadd("idx:classSelect:student:" + csstudent, key);
            	RedisUtil.sadd("idx:classSelect:class:" + csclass, key);
            	RedisUtil.sadd("idx:classSelect:teacher:" + csteacher, key);
            }
            else if(table.equals("courseSchedule")) {
            	//RedisUtil.sadd("idx:courseSchedule:major:" + csmajor, key);
            	RedisUtil.sadd("idx:courseSchedule:course:major:" + csmajor, cscourse);
            	RedisUtil.sadd("idx:courseSchedule:course:major:" + csmajor + ":type:" + cstype, cscourse);
            }
        }
    }

    private static void redisDelete(String table,List<Column> columns) {
        JSONObject json = new JSONObject();
        String key = null;
        // course
        String ccollege = null;
        // class
        String ccourse = null;
        String cteacher = null;
        String cschoolYear = null;
        String cschoolTerm = null;
        // classSelect
        String csstudent = null;
        String csclass = null;
        String csteacher = null;
        // courseSchedule
        String csmajor = null;
        String cscourse = null;
        String cstype = null;
        
        for (Column column : columns) {
            json.put(column.getName(), column.getValue());
            if (column.getIsKey()) {
            	key = column.getValue();
            }
            if(table.equals("course")) {
            	if(column.getName().equals("collegeid")) {
            		ccollege = column.getValue();
            	}
            }
            else if(table.equals("class")) {
            	if(column.getName().equals("courseid")) {
            		ccourse = column.getValue();
            	}
            	else if(column.getName().equals("teacherid")) {
            		cteacher = column.getValue();
            	}
            	else if(column.getName().equals("schoolYear")) {
            		cschoolYear = column.getValue();
            	}
            	else if(column.getName().equals("schoolTerm")) {
            		cschoolTerm = column.getValue();
            	}
            }
            else if(table.equals("classSelect")) {
            	if(column.getName().equals("studentid")) {
            		csstudent = column.getValue();
            	}
            	else if(column.getName().equals("classid")) {
            		csclass = column.getValue();
            	}
            	else if(column.getName().equals("csteacher")) {
            		csteacher = column.getValue();
            	}
            }
            else if(table.equals("courseSchedule")) {
            	if(column.getName().equals("majorid")) {
            		csmajor = column.getValue();
            	}
            	else if(column.getName().equals("courseid")) {
            		cscourse = column.getValue();
            	}
            	else if(column.getName().equals("type")) {
            		cstype = column.getValue();
            	}
            }
        }
        if (columns.size() > 0) {
//            RedisUtil.delKey(table + ":" + columns.get(0).getValue());
//            RedisUtil.srem("idx:" + table, key);
            if(!table.equals("courseSchedule")) {
            	RedisUtil.delKey(table + ":" + columns.get(0).getValue());
            	RedisUtil.srem("idx:" + table, key);
            }
            else {
            	RedisUtil.delKey(table + ":" + csmajor + ':' + cscourse);
            }
            
            if(table.equals("course")) {
            	RedisUtil.srem("idx:course:college:" + ccollege, key);
            }
            else if(table.equals("class")) {
            	RedisUtil.srem("idx:class:course:" + ccourse, key);
            	RedisUtil.srem("idx:class:teacher:" + cteacher, key);
            	RedisUtil.srem("idx:class:schoolYear:" + cschoolYear + ":schoolTerm:" + cschoolTerm, key);
            	//RedisUtil.srem("idx:class:course:schoolYear:" + cschoolYear + ":schoolTerm:" + cschoolTerm, ccourse);
            	if(RedisUtil.sinter("idx:class:course:" + ccourse, "idx:class:schoolYear:" + cschoolYear + ":schoolTerm:" + cschoolTerm) == 0) {
            		RedisUtil.srem("idx:class:course:schoolYear:" + cschoolYear + ":schoolTerm:" + cschoolTerm, ccourse);
            	}
            }
            else if(table.equals("classSelect")) {
            	RedisUtil.srem("idx:classSelect:student:" + csstudent, key);
            	RedisUtil.srem("idx:classSelect:class:" + csclass, key);
            	RedisUtil.srem("idx:classSelect:teacher:" + csteacher, key);
            }
            else if(table.equals("courseSchedule")) {
            	//RedisUtil.srem("idx:courseSchedule:major:" + csmajor, key);
            	RedisUtil.srem("idx:courseSchedule:course:major:" + csmajor, cscourse);
            	RedisUtil.srem("idx:courseSchedule:course:major:" + csmajor + ":type:" + cstype, cscourse);
            }
        }
    }
}

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
                11111), "example", "", "");
        int batchSize = 100;
        try {
            connector.connect();
            connector.subscribe(".*\\..*");
            connector.rollback();
            System.out.println("================>start");
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
        String enrol = null;
        String myclass = null;
        String key = null;
        for (Column column : columns) {
            json.put(column.getName(), column.getValue());
            if (column.getIsKey()) {
            	RedisUtil.sadd("idx:" + table, column.getValue());
            	key = column.getValue();
            }
            if (table.equals("student")) {
            	if (column.getName().equals("enrol")) {
            		enrol = column.getValue();
            	}
            	else if (column.getName().equals("class")) {
            		myclass = column.getValue();
            	}
            }
        }
        if (columns.size() > 0) {
            RedisUtil.stringSet(table + ":" + columns.get(0).getValue(), json.toJSONString());
            if(table.equals("student")) {
            	RedisUtil.sadd("idx:student:enrol", enrol);
            	RedisUtil.sadd("idx:student:enrol:" + enrol, key);
            	RedisUtil.sadd("idx:student:class:" + myclass, key);
            }
        }
    }

    private static void redisUpdate(String table,List<Column> columns) {
        JSONObject json = new JSONObject();
        for (Column column : columns) {
            json.put(column.getName(), column.getValue());
        }
        if (columns.size() > 0) {
            RedisUtil.stringSet(table + ":" + columns.get(0).getValue(), json.toJSONString());
        }
    }

    private static void redisDelete(String table,List<Column> columns) {
        JSONObject json = new JSONObject();
        String enrol = null;
        String myclass = null;
        String key = null;
        for (Column column : columns) {
            json.put(column.getName(), column.getValue());
            if (column.getIsKey()) {
            	RedisUtil.srem("idx:" + table, column.getValue());
            	key = column.getValue();
            }
            if (table.equals("student")) {
            	if (column.getName().equals("enrol")) {
            		enrol = column.getValue();
            	}
            	else if (column.getName().equals("class")) {
            		myclass = column.getValue();
            	}
            }
        }
        if (columns.size() > 0) {
            RedisUtil.delKey(table + ":" + columns.get(0).getValue());
            if(table.equals("student")) {
            	RedisUtil.srem("idx:student:enrol", enrol);
            	RedisUtil.srem("idx:student:enrol:" + enrol, key);
            	RedisUtil.srem("idx:student:class:" + myclass, key);
            }
        }
    }
}

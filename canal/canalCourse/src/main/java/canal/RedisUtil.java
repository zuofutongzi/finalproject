package canal;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

public class RedisUtil {
	private static Jedis jedis = null;

    public static synchronized Jedis getJedis() {
        if (jedis == null) {
            jedis = new Jedis("192.168.99.100", 6378);
            //jedis.auth("root");
        }
        return jedis;
    }
    
    public static void sadd(String key, String value) {
    	getJedis().sadd(key, value);
    }
    
    public static void srem(String key, String value) {
    	getJedis().srem(key, value);
    }
    
    public static Long scard(String key) {
    	return getJedis().scard(key);
    }
    
    public static int sinter(String key1, String key2) {
    	java.util.Set<String> sinter = jedis.sinter(key1, key2);
    	return sinter.size();
    }
    
    public static boolean existKey(String key) {
        return getJedis().exists(key);
    }

    public static void delKey(String key) {
        getJedis().del(key);
    }

    public static String stringGet(String key) {
        return getJedis().get(key);
    }

    public static String stringSet(String key, String value) {
        return getJedis().set(key, value);
    }

    public static void hashSet(String key, String field, String value) {
        getJedis().hset(key, field, value);
    }
}

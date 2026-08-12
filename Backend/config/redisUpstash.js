const { Redis } = require("@upstash/redis");
const RedisClient = Redis.fromEnv();

module.exports = {
    RedisClient
};



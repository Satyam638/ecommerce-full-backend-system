const {createClient} = require('redis');

const redisClient = createClient({
    url:"redis://127.0.0.1:6379"
});

redisClient.on("error", (err)=>{
    console.log("Redis Error:", err);
});

(async () => {
    try {
        await redisClient.connect();
        console.log("Redis Connected");
    } catch (error) {
        console.log("Redis Not Connected, app will continue");
    }
})();


module.exports = redisClient;
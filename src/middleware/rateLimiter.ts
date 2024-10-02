import '/envConfig.ts'

const rateLimitMap = new Map();
const limit = process.env.RATE_LIMIT || 5

export default function rateLimitMiddleware(handler) {
    return (req, res) => {
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        const windowMs = 60 * 1000; // 1 minute

        if (!rateLimitMap.has(ip)) {
            rateLimitMap.set(ip, {
                count: 0,
                lastReset: Date.now(),
            });
        }

        const ipData = rateLimitMap.get(ip);

        if (Date.now() - ipData.lastReset > windowMs) {
            ipData.count = 0;
            ipData.lastReset = Date.now();
        }

        if (ipData.count >= limit) {
            return res.status(429).send("Too Many Requests");
        }

        ipData.count += 1;

        return handler(req, res);
    };
}
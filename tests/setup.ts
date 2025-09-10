// tests/setup.ts
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret";
process.env.MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/test";
process.env.PORT = process.env.PORT ?? "0";

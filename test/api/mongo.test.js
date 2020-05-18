const { MongoClient } = require("mongodb");

let connection;
let db;

beforeAll(async () => {
	console.log(process.env.MONGO_URL);
	connection = await MongoClient.connect(process.env.MONGO_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
	db = await connection.db();
});

afterAll(async () => {
	await connection.close();
});

describe("insert", () => {
	let users, mockUser;

	beforeEach(async () => {
		users = db.collection("users");
		mockUser = { _id: "some-other-user-id", name: "John" };
		await users.insertOne(mockUser);
	});

	it("should insert a doc into collection", async () => {
		const insertedUser = await users.findOne({ _id: "some-other-user-id" });
		expect(insertedUser).toEqual(mockUser);
		let count = await db.collection("users").count();
		expect(count).toBe(1);
		await users.deleteOne({name: "John"});
	});

	it("should delete a doc from the collection", async () => {
		await users.deleteOne({name: "John"});
		const insertedUser = await users.findOne({ _id: "some-other-user-id" });
		let count = await db.collection("users").count();
		expect(count).toBe(0);
		expect(insertedUser).toBeUndefined;
	});
});

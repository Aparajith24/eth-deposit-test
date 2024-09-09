import { MongoClient } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

const uri = process.env.NEXT_PUBLIC_MONGODB_URI;
const dbName = "ethereum-tracker";

export async function POST(request: NextRequest) {
  const data = await request.json();
  if (!Array.isArray(data)) {
    return NextResponse.json(
      { message: "Invalid data format" },
      { status: 400 },
    );
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection("transactions");
    const result = await collection.insertMany(data);
    console.log("Data saved successfully:", result);
    return NextResponse.json(
      { message: "Data saved successfully!" },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error saving data:", error);
    return NextResponse.json(
      { message: "Something went wrong!", error: error.message },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}

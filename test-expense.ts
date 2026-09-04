import { createExpense } from "./src/server/actions/expense.action";

async function main() {
  const res = await createExpense({
    title: "Test",
    amount: 1000,
    date: new Date().toISOString(),
    projectId: "",
    category: "OPERATIONAL",
    description: "Test",
    submittedById: "test-user-id" // Might throw foreign key error but that's expected
  });
  console.log("Result:", res);
}

main().catch(console.error);

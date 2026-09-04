import { getExpenses } from "@/server/actions/expense.action";
import { prisma } from "@/lib/prisma";
import { SimpleTeamCapitalView } from "@/components/team-capital/simple-team-capital-view";

export const dynamic = "force-dynamic";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const isHistory = tab === "history";

  const { data: expenses } = await getExpenses();
  const users = await prisma.user.findMany({ select: { id: true, name: true } });

  const serializedExpenses = (expenses || []).map((e) => ({
    id: e.id,
    title: e.title,
    amount: Number(e.amount),
    date: e.date.toISOString(),
    category: e.category,
    status: e.status,
    description: e.description,
    receiptUrl: e.receiptUrl,
    submitter: {
      id: e.submitter.id,
      name: e.submitter.name,
      image: e.submitter.image,
      email: e.submitter.email,
    },
  }));

  return (
    <SimpleTeamCapitalView
      initialExpenses={serializedExpenses as any}
      users={users}
      isHistory={isHistory}
    />
  );
}

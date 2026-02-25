import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { PointTransaction } from "@lib/data/coins"

type CoinHistoryProps = {
  balance: number
  transactions: PointTransaction[]
}

const CoinHistory = ({ balance, transactions }: CoinHistoryProps) => {
  return (
    <div data-testid="coin-history-wrapper">
      <div className="mb-8">
        <Heading level="h1" className="text-2xl-semi mb-4">
          Coins
        </Heading>
        <div className="flex items-end gap-x-2">
          <span className="text-3xl-semi leading-none text-ui-fg-interactive">
            {balance.toLocaleString()}
          </span>
          <span className="uppercase text-base-regular text-ui-fg-subtle">
            Coins Available
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-y-4">
        <Heading level="h2" className="text-large-semi">
          Transaction History
        </Heading>

        {transactions.length > 0 ? (
          <div className="flex flex-col gap-y-2">
            {transactions.map((txn) => (
              <Container
                key={txn.id}
                className="bg-gray-50 flex justify-between items-center p-4"
              >
                <div className="flex items-center gap-x-4 flex-1">
                  <Badge
                    color={
                      txn.type === "earn"
                        ? "green"
                        : txn.type === "spend"
                        ? "red"
                        : "grey"
                    }
                    className="capitalize"
                  >
                    {txn.type}
                  </Badge>
                  <div className="flex flex-col">
                    <Text className="txt-medium-plus text-ui-fg-base">
                      {txn.reason || "-"}
                    </Text>
                    <Text className="txt-small text-ui-fg-subtle">
                      {new Date(txn.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </div>
                </div>
                <span
                  className={`txt-medium-plus font-semibold ${
                    txn.type === "earn"
                      ? "text-green-600"
                      : txn.type === "spend"
                      ? "text-red-600"
                      : "text-ui-fg-subtle"
                  }`}
                >
                  {txn.type === "earn" ? "+" : "-"}
                  {txn.points.toLocaleString()}
                </span>
              </Container>
            ))}
          </div>
        ) : (
          <Text className="text-ui-fg-subtle">No transactions yet</Text>
        )}
      </div>
    </div>
  )
}

export default CoinHistory

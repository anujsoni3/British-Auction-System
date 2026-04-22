export function getRankingsFromBids(bids) {
  return [...bids]
    .sort((a, b) => Number(a.price) - Number(b.price) || new Date(a.createdAt) - new Date(b.createdAt))
    .map((bid, index) => ({ ...bid, rank: `L${index + 1}` }));
}

export async function getRankings(prismaClient, rfqId) {
  const bids = await prismaClient.bid.findMany({
    where: { rfqId },
    include: { supplier: true },
    orderBy: [{ price: 'asc' }, { createdAt: 'asc' }]
  });

  return getRankingsFromBids(bids);
}

export function rankingMap(rankings) {
  const map = new Map();
  for (const bid of rankings) {
    if (!map.has(bid.supplierId)) map.set(bid.supplierId, bid.rank);
  }
  return map;
}

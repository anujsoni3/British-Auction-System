import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const now = new Date();
const minutesFromNow = (minutes) => new Date(now.getTime() + minutes * 60000);

async function main() {
  await prisma.auctionLog.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.rFQ.deleteMany();
  await prisma.supplier.deleteMany();

  const atlas = await prisma.supplier.create({ data: { name: 'Atlas Freight' } });
  const blueline = await prisma.supplier.create({ data: { name: 'BlueLine Logistics' } });
  const cargoswift = await prisma.supplier.create({ data: { name: 'CargoSwift Transport' } });

  const linehaul = await prisma.rFQ.create({
    data: {
      name: 'Mumbai to Delhi Linehaul',
      bidStartTime: minutesFromNow(-60),
      bidCloseTime: minutesFromNow(45),
      forcedCloseTime: minutesFromNow(95),
      triggerWindowMinutes: 10,
      extensionMinutes: 5,
      triggerType: 'ANY_BID',
      status: 'ACTIVE'
    }
  });

  const nearClose = await prisma.rFQ.create({
    data: {
      name: 'Pune Export Container Pickup',
      bidStartTime: minutesFromNow(-30),
      bidCloseTime: minutesFromNow(7),
      forcedCloseTime: minutesFromNow(22),
      triggerWindowMinutes: 10,
      extensionMinutes: 5,
      triggerType: 'L1_CHANGE',
      status: 'ACTIVE'
    }
  });

  await prisma.bid.createMany({
    data: [
      {
        rfqId: linehaul.id,
        supplierId: atlas.id,
        price: new Prisma.Decimal(58000),
        freightCharges: new Prisma.Decimal(45000),
        originCharges: new Prisma.Decimal(6000),
        destinationCharges: new Prisma.Decimal(7000),
        transitTime: '3 days'
      },
      {
        rfqId: linehaul.id,
        supplierId: blueline.id,
        price: new Prisma.Decimal(55000),
        freightCharges: new Prisma.Decimal(43000),
        originCharges: new Prisma.Decimal(5500),
        destinationCharges: new Prisma.Decimal(6500),
        transitTime: '4 days'
      },
      {
        rfqId: nearClose.id,
        supplierId: cargoswift.id,
        price: new Prisma.Decimal(32300),
        freightCharges: new Prisma.Decimal(25000),
        originCharges: new Prisma.Decimal(3200),
        destinationCharges: new Prisma.Decimal(4100),
        transitTime: '2 days'
      }
    ]
  });

  await prisma.auctionLog.createMany({
    data: [
      {
        rfqId: linehaul.id,
        eventType: 'RFQ_CREATED',
        message: 'Initial RFQ created with sample supplier bids'
      },
      {
        rfqId: nearClose.id,
        eventType: 'RFQ_CREATED',
        message: 'Near-close RFQ created for extension testing'
      }
    ]
  });
}

await main();
await prisma.$disconnect();
console.log('Sample auction data loaded.');

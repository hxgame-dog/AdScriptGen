import prisma from './lib/prisma';

async function main() {
  const count = await prisma.fieldConfig.count();
  console.log(`FieldConfig count: ${count}`);
  const configs = await prisma.fieldConfig.findMany();
  console.log(JSON.stringify(configs, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

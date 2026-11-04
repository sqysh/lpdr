import prisma from 'prisma/client'

const enable = process.argv.includes('--enable')

const settings = {
  isEnabled: enable,
  fixedAmount: null,
  minAmount: 18,
  suggestedAmounts: [18, 50, 100],
  allowMessage: false,
  messageMaxLength: 280,
  allowPhoto: true,
  allowDonorName: true,
  requireApproval: true,
  displayDays: null
}

;(async () => {
  const row = await prisma.memorialSettings.upsert({
    where: { id: 'default' },
    update: settings,
    create: { id: 'default', ...settings }
  })

  console.log(row)
  await prisma.$disconnect()
})()

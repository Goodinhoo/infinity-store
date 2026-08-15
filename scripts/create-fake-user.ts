import { prisma } from '../src/lib/prisma'
import { hash } from 'bcryptjs'

async function main() {
  const hashedPassword = await hash('123456', 10)
  
  const fakeUser = await prisma.user.create({
    data: {
      name: 'Fake Player',
      username: 'FakePlayer123',
      email: 'fake@example.com',
      password: hashedPassword,
      role: 'USER',
      balance: 100.0,
      avatar: 'https://minotar.net/helm/Notch/128.png'
    }
  })

  console.log('Fake user created successfully!')
  console.log(fakeUser)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

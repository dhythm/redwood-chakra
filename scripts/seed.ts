import type { Prisma } from '@prisma/client'
import { Domain, Action } from '@prisma/client'
import { db } from 'api/src/lib/db'

export default async () => {
  try {
    const promises: any[] = []
    for (const domain of Object.keys(Domain) as (keyof typeof Domain)[]) {
      for (const action of Object.keys(Action) as (keyof typeof Action)[]) {
        const name = `${domain}${action.toUpperCase()}`
        if (!(await db.ability.findUnique({ where: { name } }))) {
          promises.push(
            db.ability.create({
              data: {
                name,
                domain,
                action,
              },
            })
          )
        }
      }
    }
    await Promise.allSettled(promises)

    await db.organization.upsert({
      where: {
        organizationCode: '0000',
      },
      create: {
        organizationCode: '0000',
        name: 'sample organization',
      },
      update: {},
    })

    const queryAbilities = await db.ability.findMany({
      where: {
        action: 'query',
      },
      select: {
        id: true,
      },
    })
    await db.role.upsert({
      where: {
        organizationCode_name: {
          organizationCode: '0000',
          name: 'viewer',
        },
      },
      create: {
        organizationCode: '0000',
        name: 'viewer',
        abilities: {
          connect: queryAbilities,
        },
      },
      update: {},
    })

    const mutateAbilities = await db.ability.findMany({
      where: {
        action: 'mutate',
      },
      select: {
        id: true,
      },
    })
    await db.role.upsert({
      where: {
        organizationCode_name: {
          organizationCode: '0000',
          name: 'editor',
        },
      },
      create: {
        organizationCode: '0000',
        name: 'editor',
        abilities: {
          connect: mutateAbilities,
        },
      },
      update: {},
    })
  } catch (error) {
    console.warn('Please define your seed data.')
    console.error(error)
  }
}

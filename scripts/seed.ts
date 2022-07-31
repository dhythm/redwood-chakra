import { Domain, Action } from '@prisma/client'
import { db } from 'api/src/lib/db'
import CryptoJS from 'crypto-js'

export default async () => {
  try {
    const promises: any[] = []
    for (const domain of Object.keys(Domain) as (keyof typeof Domain)[]) {
      for (const action of Object.keys(Action) as (keyof typeof Action)[]) {
        const name = `${domain}${
          action.charAt(0).toUpperCase() + action.slice(1)
        }`
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
    const editorRole = await db.role.upsert({
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

    const [hashedPassword, salt] = _hashPassword('twixrox')
    await db.user.upsert({
      where: {
        email: 'kody@test.redwoodjs.com',
      },
      create: {
        organizationCode: '0000',
        name: 'kody',
        email: 'kody@test.redwoodjs.com',
        hashedPassword,
        salt,
        roleId: editorRole.id,
      },
      update: {},
    })
  } catch (error) {
    console.warn('Please define your seed data.')
    console.error(error)
  }
}

// https://github.com/redwoodjs/redwood/issues/5793
// https://github.com/redwoodjs/redwood/blob/main/packages/api/src/functions/dbAuth/DbAuthHandler.ts#L1288
const _hashPassword = (text: string, salt?: string) => {
  const useSalt = salt || CryptoJS.lib.WordArray.random(128 / 8).toString()

  return [
    CryptoJS.PBKDF2(text, useSalt, { keySize: 256 / 32 }).toString(),
    useSalt,
  ]
}

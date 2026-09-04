import { Prisma } from '@prisma/client'

export type DecimalToNumber<T> = T extends Prisma.Decimal
  ? number
  : T extends Prisma.Decimal | null
    ? number | null
    : T extends Date
      ? T
      : T extends (infer U)[]
        ? DecimalToNumber<U>[]
        : T extends object
          ? { [K in keyof T]: DecimalToNumber<T[K]> }
          : T

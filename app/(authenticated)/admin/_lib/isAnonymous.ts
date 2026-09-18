import { IOrderRow } from 'types/order.types'

export const isAnonymous = (o: IOrderRow) => !o.userId && !o.customerName && !o.customerEmail

import BaseEntity from '../core/_BaseEntity'
import type User from './User'

export default interface Cuenta extends BaseEntity {
  alias: string
  moneda: string
  saldoBase: number
  tipo: 'AHORRO' | 'CORRIENTE'
  usuario?: User
}

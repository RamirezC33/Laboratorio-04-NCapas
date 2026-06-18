import BaseEntity from '../core/_BaseEntity'
import type Cuenta from './Cuenta'
import type Categoria from './Categoria'

export default interface Movimiento extends BaseEntity {
  monto: number
  monedaOriginal: string
  tasaCambio?: number
  fecha: string
  descripcion?: string
  cuenta: Cuenta
  categoria?: Categoria
}

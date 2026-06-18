import BaseEntity from '../core/_BaseEntity'

export default interface Categoria extends BaseEntity {
  nombre: string
  tipo: 'INGRESO' | 'EGRESO'
  categoriaPadre?: Categoria
}

import Role from '@/models/api/entities/Role'
import Permissions from '@/models/api/entities/Permissions'
import Cuenta from '@/models/api/entities/Cuenta'
import Categoria from '@/models/api/entities/Categoria'
import Movimiento from '@/models/api/entities/Movimiento'
import Service from '../core/Service'
import UserService from './custom/UserService'

//custom
export const userService = new UserService()

//core
export const roleService = new Service<Role>({ endpoint: 'roles' })
export const permissionService = new Service<Permissions>({
  endpoint: 'permissions',
})
export const cuentaService = new Service<Cuenta>({
  endpoint: 'finanzas/cuentas',
})
export const categoriaService = new Service<Categoria>({
  endpoint: 'finanzas/categorias',
})
export const movimientoService = new Service<Movimiento>({
  endpoint: 'finanzas/movimientos',
})

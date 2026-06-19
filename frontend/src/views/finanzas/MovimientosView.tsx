import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useFindAll } from '@/hooks/core/useFindAll'
import useCrud from '@/hooks/core/useCrud'
import { queryKeys } from '@/lib/queryClient'
import type Cuenta from '@/models/api/entities/Cuenta'
import type Categoria from '@/models/api/entities/Categoria'
import type Movimiento from '@/models/api/entities/Movimiento'
import {
  categoriaService,
  cuentaService,
  movimientoService,
} from '@/services/api'
import errorResponse from '@/utils/errorResponse'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'

const { RangePicker } = DatePicker

type TransferenciaPayload = {
  cuentaOrigenId: number
  cuentaDestinoId: number
  monto: number
  descripcion?: string
}

export default function MovimientosView() {
  const queryClient = useQueryClient()

  const [selectedCuentaId, setSelectedCuentaId] = useState<number | undefined>()
  const [movParams, setMovParams] = useState({ page: 0, size: 10 })
  const [dateRange, setDateRange] = useState<
    [string | undefined, string | undefined]
  >([undefined, undefined])

  const [openMovModal, setOpenMovModal] = useState(false)
  const [openTransModal, setOpenTransModal] = useState(false)

  const [movForm] = Form.useForm()
  const [transForm] = Form.useForm()

  const { data: cuentasData } = useFindAll<Cuenta>({
    queryKey: queryKeys.cuentas,
    service: cuentaService,
    queryParams: { page: 0, size: 100 },
  })

  const { data: categoriasData } = useFindAll<Categoria>({
    queryKey: queryKeys.categorias,
    service: categoriaService,
    queryParams: { page: 0, size: 100 },
  })

  const queryParamsMovimientos = useMemo(
    () => ({
      cuentaId: selectedCuentaId,
      ...movParams,
      ...(dateRange[0] ? { fechaInicio: dateRange[0] } : {}),
      ...(dateRange[1] ? { fechaFin: dateRange[1] } : {}),
    }),
    [selectedCuentaId, movParams, dateRange]
  )

  const { data: movData, isLoading: movLoading } = useFindAll<Movimiento>({
    queryKey: queryKeys.movimientos,
    service: movimientoService,
    queryParams: queryParamsMovimientos,
    enabled: !!selectedCuentaId,
  })

  const crud = useCrud<Movimiento>({
    queryKey: queryKeys.movimientos,
    service: movimientoService,
  })

  const { mutateAsync: transferir, isPending: isTransferring } = useMutation({
    mutationFn: async (payload: TransferenciaPayload) => {
      await movimientoService.create({
        endpoint: 'finanzas/transferencias',
        payload: payload as unknown as Movimiento,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cuentas })
      queryClient.invalidateQueries({ queryKey: queryKeys.movimientos })
    },
  })

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setMovParams((prev) => ({
      ...prev,
      page: (pagination.current ?? 1) - 1,
      size: pagination.pageSize ?? prev.size,
    }))
  }

  const handleDateChange = (
    _dates: [Dayjs | null, Dayjs | null] | null,
    dateStrings: [string, string]
  ) => {
    setDateRange([
      dateStrings[0] ? `${dateStrings[0]}T00:00:00` : undefined,
      dateStrings[1] ? `${dateStrings[1]}T23:59:59` : undefined,
    ])
  }

  const handleSaveMovimiento = async () => {
    const values = await movForm.validateFields()
    try {
      await crud.create({
        payload: {
          monto: values.monto,
          monedaOriginal: values.monedaOriginal,
          tasaCambio: values.tasaCambio,
          descripcion: values.descripcion,
          cuentaId: selectedCuentaId,
          categoriaId: values.categoriaId,
        } as unknown as Movimiento,
      })
      message.success('Movimiento registrado')
      setOpenMovModal(false)
      movForm.resetFields()
    } catch (error: unknown) {
      errorResponse({ error })
    }
  }

  const handleTransferencia = async () => {
    const values = await transForm.validateFields()
    try {
      await transferir({
        cuentaOrigenId: values.cuentaOrigenId,
        cuentaDestinoId: values.cuentaDestinoId,
        monto: values.monto,
        descripcion: values.descripcion,
      })
      message.success('Transferencia realizada')
      setOpenTransModal(false)
      transForm.resetFields()
    } catch (error: unknown) {
      errorResponse({ error })
    }
  }

  const columns: ColumnsType<Movimiento> = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'center' },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      align: 'center',
      render: (v: number) => v?.toFixed(2),
    },
    {
      title: 'Moneda',
      dataIndex: 'monedaOriginal',
      key: 'monedaOriginal',
      align: 'center',
    },
    {
      title: 'Tasa Cambio',
      dataIndex: 'tasaCambio',
      key: 'tasaCambio',
      align: 'center',
      render: (v?: number) => (v != null ? v.toFixed(4) : '—'),
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      align: 'center',
      render: (v: unknown) => {
        if (!v) return '—'
        let iso: string
        if (Array.isArray(v)) {
          const [y, mo, d, h = 0, mi = 0, s = 0] = v as number[]
          iso = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        } else {
          iso = String(v).replace(/(\.\d{3})\d+/, '$1')
        }
        const parsed = dayjs(iso)
        return parsed.isValid() ? parsed.format('DD/MM/YYYY HH:mm') : '—'
      },
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      align: 'center',
    },
    {
      title: 'Categoría',
      key: 'categoria',
      align: 'center',
      render: (_: unknown, record: Movimiento) =>
        record.categoria?.nombre ?? '—',
    },
  ]

  const cuentas = cuentasData?.data ?? []
  const categorias = categoriasData?.data ?? []

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          placeholder="Selecciona una cuenta"
          style={{ minWidth: 220 }}
          allowClear
          onChange={(val) => setSelectedCuentaId(val as number | undefined)}
        >
          {cuentas.map((c) => (
            <Select.Option key={c.id} value={c.id}>
              {c.alias} ({c.moneda})
            </Select.Option>
          ))}
        </Select>

        <RangePicker onChange={handleDateChange} />

        <Space>
          <Button
            type="primary"
            disabled={!selectedCuentaId}
            onClick={() => {
              movForm.resetFields()
              setOpenMovModal(true)
            }}
          >
            Nuevo movimiento
          </Button>
          <Button
            onClick={() => {
              transForm.resetFields()
              setOpenTransModal(true)
            }}
          >
            Transferir
          </Button>
        </Space>
      </div>

      {!selectedCuentaId ? (
        <Typography.Text type="secondary">
          Selecciona una cuenta para ver sus movimientos.
        </Typography.Text>
      ) : (
        <Table<Movimiento>
          columns={columns}
          dataSource={movData?.data}
          loading={movLoading}
          rowKey="id"
          pagination={{
            current: (movData?.pagination.page ?? 0) + 1,
            pageSize: movData?.pagination.pageSize,
            total: movData?.pagination.total ?? 0,
            showSizeChanger: true,
            position: ['bottomCenter'],
          }}
          onChange={handleTableChange}
        />
      )}

      <Modal
        title="Nuevo movimiento"
        open={openMovModal}
        onOk={handleSaveMovimiento}
        onCancel={() => setOpenMovModal(false)}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={crud.isCreating}
        destroyOnClose
        style={{ top: 10 }}
      >
        <Form form={movForm} layout="vertical">
          <Form.Item
            name="monto"
            label="Monto"
            rules={[{ required: true, message: 'Ingresa el monto' }]}
          >
            <InputNumber min={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="monedaOriginal"
            label="Moneda"
            rules={[{ required: true, message: 'Selecciona la moneda' }]}
          >
            <Select>
              <Select.Option value="USD">USD</Select.Option>
              <Select.Option value="CRC">CRC</Select.Option>
              <Select.Option value="EUR">EUR</Select.Option>
              <Select.Option value="GBP">GBP</Select.Option>
              <Select.Option value="MXN">MXN</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="tasaCambio" label="Tasa de cambio">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="descripcion" label="Descripción">
            <Input />
          </Form.Item>
          <Form.Item name="categoriaId" label="Categoría">
            <Select allowClear>
              {categorias.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.nombre} ({cat.tipo})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Transferencia entre cuentas"
        open={openTransModal}
        onOk={handleTransferencia}
        onCancel={() => setOpenTransModal(false)}
        okText="Transferir"
        cancelText="Cancelar"
        confirmLoading={isTransferring}
        destroyOnClose
        style={{ top: 10 }}
      >
        <Form form={transForm} layout="vertical">
          <Form.Item
            name="cuentaOrigenId"
            label="Cuenta origen"
            rules={[{ required: true, message: 'Selecciona la cuenta origen' }]}
          >
            <Select>
              {cuentas.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.alias} ({c.moneda}) — Saldo: {c.saldoBase?.toFixed(2)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="cuentaDestinoId"
            label="Cuenta destino"
            rules={[
              { required: true, message: 'Selecciona la cuenta destino' },
            ]}
          >
            <Select>
              {cuentas.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.alias} ({c.moneda})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="monto"
            label="Monto"
            rules={[{ required: true, message: 'Ingresa el monto' }]}
          >
            <InputNumber min={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="descripcion" label="Descripción">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

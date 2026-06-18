import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  message,
} from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useMemo, useState } from 'react'
import { useFindAll } from '@/hooks/core/useFindAll'
import useCrud from '@/hooks/core/useCrud'
import { queryKeys } from '@/lib/queryClient'
import type Cuenta from '@/models/api/entities/Cuenta'
import { cuentaService } from '@/services/api'
import errorResponse from '@/utils/errorResponse'

export default function CuentasView() {
  const [params, setParams] = useState({ page: 0, size: 10 })
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  const { data, isLoading } = useFindAll<Cuenta>({
    queryKey: queryKeys.cuentas,
    service: cuentaService,
    queryParams: params,
  })

  const crud = useCrud<Cuenta>({
    queryKey: queryKeys.cuentas,
    service: cuentaService,
  })

  const response = useMemo(() => data, [data])

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setParams((prev) => ({
      ...prev,
      page: (pagination.current ?? 1) - 1,
      size: pagination.pageSize ?? prev.size,
    }))
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    try {
      await crud.create({ payload: values as Cuenta })
      message.success('Cuenta creada')
      setOpen(false)
      form.resetFields()
    } catch (error: unknown) {
      errorResponse({ error })
    }
  }

  const columns: ColumnsType<Cuenta> = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'center' },
    { title: 'Alias', dataIndex: 'alias', key: 'alias', align: 'center' },
    { title: 'Moneda', dataIndex: 'moneda', key: 'moneda', align: 'center' },
    {
      title: 'Saldo Base',
      dataIndex: 'saldoBase',
      key: 'saldoBase',
      align: 'center',
      render: (v: number) => v?.toFixed(2),
    },
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo', align: 'center' },
  ]

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button
          type="primary"
          onClick={() => {
            form.resetFields()
            setOpen(true)
          }}
        >
          Nueva cuenta
        </Button>
      </div>

      <Table<Cuenta>
        columns={columns}
        dataSource={response?.data}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: (response?.pagination.page ?? 0) + 1,
          pageSize: response?.pagination.pageSize,
          total: response?.pagination.total ?? 0,
          showSizeChanger: true,
          position: ['bottomCenter'],
        }}
        onChange={handleTableChange}
      />

      <Modal
        title="Nueva cuenta"
        open={open}
        onOk={handleSave}
        onCancel={() => setOpen(false)}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={crud.isCreating}
        destroyOnClose
        style={{ top: 10 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="alias"
            label="Alias"
            rules={[{ required: true, message: 'Ingresa un alias' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="moneda"
            label="Moneda"
            rules={[{ required: true, message: 'Selecciona una moneda' }]}
          >
            <Select>
              <Select.Option value="USD">USD - Dólar</Select.Option>
              <Select.Option value="CRC">CRC - Colón</Select.Option>
              <Select.Option value="EUR">EUR - Euro</Select.Option>
              <Select.Option value="GBP">GBP - Libra</Select.Option>
              <Select.Option value="MXN">MXN - Peso</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="saldoBase"
            label="Saldo inicial"
            rules={[{ required: true, message: 'Ingresa el saldo inicial' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="tipo"
            label="Tipo"
            rules={[{ required: true, message: 'Selecciona el tipo' }]}
          >
            <Select>
              <Select.Option value="AHORRO">Ahorro</Select.Option>
              <Select.Option value="CORRIENTE">Corriente</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
